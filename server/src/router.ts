import express, { type Request, type Response } from 'express';
import { getUsers, postUser } from './handlers/user';
import db from './config/db';
import { io } from './config/app';
import { getMessageByRoom, postMessageByRoom } from './handlers/message';
import { addMemberToRoom, getRoomByUser, postRoom } from './handlers/room';

const router = express.Router();

// route -> users
router.get('/users', getUsers);
router.post('/users', postUser);

// route -> messages
router.get('/messages/:room_id', getMessageByRoom);
router.post('/message', postMessageByRoom);

// route -> rooms
router.post("/rooms/add", addMemberToRoom);
router.post('/room', postRoom);
router.get('/rooms/:user_id', getRoomByUser);

router.delete('/room/delete/:room_id', async (req: Request, res: Response) => {

})


export default router;
