import 'dotenv/config';
import http from 'http';
import dns from 'dns';
// Khởi chạy các BullMQ Workers
import './queues/email.queue.js';
import './queues/flashcard.queue.js';
import './queues/progress.queue.js';
import './workers/progress.worker.js'; // DEV: chạy cùng process. PROD: node src/workers/progress.worker.js
import app from './app.js';
import { initSocket } from './config/socket.js';

// Fix for Render IPv6 routing issues with Nodemailer
dns.setDefaultResultOrder('ipv4first');
 
const PORT = process.env.PORT || 8080;

const server = http.createServer(app);

// Khởi tạo Socket.io
initSocket(server);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});