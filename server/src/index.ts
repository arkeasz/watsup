import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { Client } from 'pg';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const db = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT as string),
});

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  }
});


async function clientConnectDB() {
    await db.connect();
    console.log("Postgres connected");
}

app.use(express.json());
app.use(cors());

io.on('connection', (socket) => {
    console.log('a user connected');
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

    return res.json(rows[0]);
});

app.get('/message/:room_id', async (req: Request, res: Response) => {
    const { room_id } = req.params;
    const { rows } = await db.query('SELECT * FROM messages WHERE room_id = $1', [room_id]);
    if (rows.length === 0) {
        return res.status(404).json({ error: 'No messages found' });
    }
    return res.json(rows);
});

app.post('/message', async (req: Request, res: Response) => {
    const { content, user_id, room_id } = req.body;
    if (!content || !user_id || !room_id) {
        res.status(400).json({ error: 'Invalid data' });
        return;
    }

    let query = 'INSERT INTO messages (content, user_id, room_id) VALUES ($1, $2) RETURNING *';
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
