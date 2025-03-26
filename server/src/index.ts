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
    const { username, email, password_hash } = req.body;
    if (!username || !email || !password_hash) {
        res.status(400).json({ error: 'Invalid data' });
        return;
    }

    const hashedPassword = await bcrypt.hash(password_hash, 10)

    let query = 'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *';
    const { rows } = await db.query(query, [username, email, hashedPassword]);
    io.emit('new-usr', rows[0]);
    res.json(rows[0]);
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

    res.json(newMessage);
});

server.listen(3000, () => {
    console.log("Server running on port 3000");
});
