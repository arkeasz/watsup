import { io } from "./config/app";

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.onAny((event, ...args) => {
        console.log('📡 Evento recibido:', event, args);
      });
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
