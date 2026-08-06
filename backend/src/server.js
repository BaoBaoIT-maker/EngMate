import 'dotenv/config';
import http from 'http';
import app from './app.js';
import { initSocket } from './config/socket.js';

const PORT = process.env.PORT || 8080;

const server = http.createServer(app);

// Khởi tạo Socket.io
initSocket(server);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});