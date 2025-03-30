import express from 'express'
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  }
});

export { app, server, io }
