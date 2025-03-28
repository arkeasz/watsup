import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { Client, Pool } from 'pg';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const db = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT as string),
    max: 10
});

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  }
});


async function clientConnectDB() {
    try {
        await db.connect();
        console.log("Postgres connected");
    } catch (error) {
        console.error(error);
        process.exit(1)
    }
}

app.use(express.json());
app.use(cors());

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('registerUser', (userId) => {
        socket.join(userId.toString());
        console.log(`Usuario ${userId} registrado en su room personal`);
    });

    socket.on("joinRoom", (room_id) => {
        socket.join(room_id);
        console.log(`Usuario ${socket.id} se unió a la sala ${room_id}`);
    });

    socket.on("leaveRoom", (room_id) => {
        socket.leave(room_id);
        console.log(`Usuario ${socket.id} salió de la sala ${room_id}`);
    });

    socket.on('send-msg', (msg) => {
        io.emit('receive-message', msg);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

void clientConnectDB();

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World');
});

app.get('/users', async (req: Request, res: Response) => {
    const { rows } = await db.query('SELECT * FROM users');
    res.json(rows);
});

app.post('/users', async (req: Request, res: Response) => {
    const { username, email, password } = req.body;
    console.log("Datos recibidos:", req.body);
    if (!username || !email || !password) {
        res.status(400).json({ error: 'Invalid data' });
        return;
    }

    const password_hash = await bcrypt.hash(password, 10)

    let query = 'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *';
    const { rows } = await db.query(query, [username, email, password_hash]);
    io.emit('new-usr', rows[0]);
    console.log(rows[0])
    return res.json(rows[0]);
});

app.get('/messages/:room_id', async (req: Request, res: Response) => {
    const { room_id } = req.params;
    const { rows } = await db.query('SELECT * FROM messages WHERE room_id = $1', [room_id]);

    return res.json(rows.length > 0 ? rows : []);
});

app.post('/message', async (req: Request, res: Response) => {
    const { content, user_id, room_id } = req.body;
    if (!content || !user_id || !room_id) {
        res.status(400).json({ error: 'Invalid data' });
        return;
    }

    let query = 'INSERT INTO messages (content, user_id, room_id) VALUES ($1, $2, $3) RETURNING *';
    const { rows } = await db.query(query, [content, user_id, room_id]);

    if (rows.length == 0) return res.status(500).json({ error: 'Internal server error' });

    const newMessage = rows[0];

    try {
        io.emit('new-msg', newMessage);
    } catch (error) {
        console.error(error);
    }
    return res.json(newMessage);
});
app.post("/rooms/add", async (req: Request, res: Response) => {
    const { email, room_id } = req.body;

    if (!email || !room_id) {
        return res.status(400).json({ error: "Faltan datos" });
    }

    try {
        const userRes = await db.query("SELECT id, username FROM users WHERE email = $1", [email]);
        if (userRes.rowCount === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        const { id: user_id, username } = userRes.rows[0];

        const memberCheck = await db.query(
            "SELECT 1 FROM room_members WHERE user_id = $1 AND room_id = $2",
            [user_id, room_id]
        );
        if (memberCheck.rowCount > 0) {
            return res.status(400).json({ error: "El usuario ya está en la sala" });
        }

        const roomRes = await db.query("SELECT name FROM rooms WHERE id = $1", [room_id]);
        if (roomRes.rowCount === 0) {
            return res.status(404).json({ error: "Sala no encontrada" });
        }
        const room_name = roomRes.rows[0].name;

        await db.query(
            "INSERT INTO room_members (user_id, room_id) VALUES ($1, $2)",
            [user_id, room_id]
        );

        io.to(user_id.toString()).emit('youWereAddedToRoom', {
            room_id,
            room_name
        });

        io.to(room_id.toString()).emit('userJoined', {
            user_id,
            username,
            room_id,
            room_name
        });

        return res.status(201).json({
            success: true,
            message: "Usuario agregado correctamente"
        });

    } catch (error) {
        console.error("Error al agregar usuario:", error);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
});

app.delete('/room/delete/:room_id', async (req: Request, res: Response) => {

})

app.post('/room', async (req: Request, res: Response) => {
    const { name, user_id } = req.body;
    console.log(req.body)
    if (!name || !user_id) {
        res.status(400).json({ error: 'Invalid data' });
        return;
    }

    let room_query = 'INSERT INTO rooms (name) VALUES ($1) RETURNING *';
    const { rows: roomRows } = await db.query(room_query, [name]);


    if (roomRows.length == 0) return res.status(500).json({ error: 'Room creation failed' });

    const newRoom = roomRows[0];

    // insert the creator of the room on room_members
    const member_query = 'INSERT INTO room_members (room_id, user_id) VALUES ($1, $2)';
    await db.query(member_query, [newRoom.id, user_id]);

    try {
        io.emit('new-room', newRoom);
    } catch (error) {
        console.error(error);
    }

    return res.json(newRoom);
});

app.get('/rooms/:user_id', async (req: Request, res: Response) => {
    const { user_id } = req.params;

    try {
        // join between rooms and room_members
        const query = `
            SELECT r.*
            FROM rooms r
            JOIN room_members rm ON r.id = rm.room_id
            WHERE rm.user_id = $1
        `;

        const { rows } = await db.query(query, [user_id]);
        return res.json(rows)
    } catch (error) {
        console.error("Error al obtener las salas:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

server.listen(3000, () => {
    console.log("Server running on port 3000");
});
