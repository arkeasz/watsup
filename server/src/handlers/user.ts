import type { Request, Response } from "express";
import db from "../config/db";
import bcrypt from 'bcrypt';
import { io } from "../config/app";

const getUsers = async (req: Request, res: Response): Promise<any> => {
    const { rows } = await db.query('SELECT * FROM users');
    return res.json(rows);
}

const postUser = async (req: Request, res: Response): Promise<any> => {
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
}



export { getUsers, postUser };
