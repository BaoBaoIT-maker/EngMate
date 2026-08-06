import { Server } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt.js';
import prisma from './prisma.js';

let io;

/**
 * Parse cookie string thành object
 */
const parseCookies = (cookieStr = '') => {
  return Object.fromEntries(
    cookieStr.split(';').map(c => {
      const [k, ...v] = c.trim().split('=');
      return [k, decodeURIComponent(v.join('='))];
    }).filter(([k]) => k)
  );
};

export const initSocket = (server) => {
  const allowedOrigins = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : ['http://localhost:5173'];
  
  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    }
  });

  // Socket Authentication Middleware
  // Ưu tiên: 1. Cookie accessToken (HttpOnly), 2. socket.handshake.auth.token (fallback)
  io.use(async (socket, next) => {
    try {
      let token = null;

      // Thử đọc từ Cookie trước (vì chúng ta dùng HttpOnly Cookie)
      const cookieStr = socket.handshake.headers?.cookie || '';
      if (cookieStr) {
        const cookies = parseCookies(cookieStr);
        token = cookies['accessToken'];
      }

      // Fallback: đọc từ auth header (cho trường hợp mobile/test)
      if (!token) {
        token = socket.handshake.auth?.token;
      }

      if (!token) {
        return next(new Error('Authentication error: Missing token'));
      }

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
    console.log(`[Socket] Connected: ${socket.user.email} (${socket.user.role}) — ID: ${socket.id}`);

    // Admin join room 'admins' để nhận thông báo Dashboard & Support
    if (socket.user.role === 'ADMIN') {
      socket.join('admins');
    } else {
      // User join room riêng để nhận tin nhắn support từ Admin
      socket.join(`user_${socket.user.id}`);
    }

    socket.on('disconnect', () => {
      console.log(`[Socket] Disconnected: ${socket.user.email}`);
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
