import type { Request, Response } from "express";
import db from "../config/db";
import { io } from "../config/app";

const getMessageByRoom = async (req: Request, res: Response): Promise<any> => {
    const { room_id } = req.params;
    const { rows } = await db.query('SELECT * FROM messages WHERE room_id = $1', [room_id]);

    return res.json(rows.length > 0 ? rows : []);
}

const postMessageByRoom = async (req: Request, res: Response): Promise<any> => {
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
};


export { getMessageByRoom, postMessageByRoom }
