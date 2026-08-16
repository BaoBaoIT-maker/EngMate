import 'dotenv/config';
import http from 'http';
import dns from 'dns';

// Fix for Render IPv6 routing issues with Nodemailer
dns.setDefaultResultOrder('ipv4first');
import app from './app.js';
import { initSocket } from './config/socket.js';

// Khởi chạy các BullMQ Workers
import './queues/email.queue.js';
import './queues/flashcard.queue.js';

const PORT = process.env.PORT || 8080;

const server = http.createServer(app);

// Khởi tạo Socket.io
initSocket(server);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});