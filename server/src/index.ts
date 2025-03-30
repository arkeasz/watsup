import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './router';
import clientConnectDB from './config/conn';
import { app, server } from './config/app';
import db from './config/db';
import './socket'

dotenv.config();

app.use(express.json());
app.use(cors());

void clientConnectDB(db);

app.use('/', router)

server.listen(3000, () => {
    console.log("Server running on port 3000");
});
