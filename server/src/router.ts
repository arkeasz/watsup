import { Router } from 'express';
import { getUsers, postUser } from './handlers/user';
import { getMessageByRoom, postMessageByRoom } from './handlers/message';
import { addMemberToRoom, deleteRoom, getRoomByUser, postRoom } from './handlers/room';

const router = Router();

// route -> users
router.get('/users', getUsers);
router.post('/users', postUser);

// route -> messages
router.get('/messages/:room_id', getMessageByRoom);
router.post('/message', postMessageByRoom);

// route -> rooms
// rooms
router.post('/room/add', postRoom);
router.delete('/room/delete/:room_id', deleteRoom)
// rooms and users
router.get('/rooms/:user_id', getRoomByUser);
router.post("/rooms/member/add", addMemberToRoom);

export default router;
