import { Server } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt.js';
import prisma from './prisma.js';

let io;

export const initSocket = (server) => {
  const allowedOrigins = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : ['http://localhost:5173'];
  
  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    }
  });

  // Socket Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error: Missing token'));

      const decoded = verifyAccessToken(token);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, role: true }
      });

      if (!user) return next(new Error('Authentication error: User not found'));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.email} (Socket ID: ${socket.id})`);

    // Nếu là Admin, cho join vào room "admins" để nhận thống báo Dashboard
    if (socket.user.role === 'ADMIN') {
      socket.join('admins');
    } else {
      // User bình thường join vào room riêng của họ để nhận tin nhắn support
      socket.join(`user_${socket.user.id}`);
    }

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.email}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io has not been initialized!');
  }
  return io;
};
