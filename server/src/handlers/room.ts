import type { Request, Response } from "express";
import db from "../config/db";
import { io } from "../config/app";

const addMemberToRoom = async (req: Request, res: Response): Promise<any> => {
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
}

const postRoom = async (req: Request, res: Response): Promise<any> => {
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
}

const getRoomByUser = async (req: Request, res: Response): Promise<any> => {
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
}

export { addMemberToRoom, postRoom, getRoomByUser }
