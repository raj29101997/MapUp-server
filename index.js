import express from 'express'
import http from 'http'
import { Server as socketIo } from 'socket.io';
import { connection } from './src/config/db.js';
import cors from 'cors';
import compression from 'compression';
import { Data } from './src/models/models.js';
import { verifyToken } from './src/services/csvservices.js';
import csvQueue from './src/queues/csvProcessor.js';
import dotenv from "dotenv";
dotenv.config();
const { PORT, CLIENT_URL } = process.env;
const app = express();
const server = http.createServer(app);
const io = new socketIo(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  },
});

// Middleware
app.use(cors())
app.use(express.json());
app.use(compression());
app.use(verifyToken);

// Routes
import dataRoutes from './src/routes/dataRoutes.js'
app.use('/data', dataRoutes);

import auth from './src/routes/auth.js'
app.use('/auth', auth)

import users from './src/routes/users.js'
app.use('/users', users)
// Socket.io for real-time updates

io.on('connection', async (socket) => {
  csvQueue.on('completed', async (job) => {
    try {
      const fetchData = await Data.find().sort({ createdAt: -1 });
      if (fetchData?.length > 0) {
        io.emit('dashboardUpdate', fetchData);
      } else {
        console.error('Error retrieving data from Redis');
      }
    } catch (error) {
      console.error('Error in job completion handler:', error);
    }
  });
  socket.on('joinRoom', (room) => {
    socket.join(room);
    console.log(`Client joined room: ${room}`);
  });

  // Leave a room
  socket.on('leaveRoom', (room) => {
    socket.leave(room);
    console.log(`Client left room: ${room}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id);
  });

});


server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
