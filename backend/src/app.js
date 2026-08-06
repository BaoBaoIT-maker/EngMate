import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import apiRoutes from './routes/index.js';
import { errorHandler, notFound } from './middlewares/error.middleware.js';

const app = express();

// Trust proxy for rate limiter (if behind Nginx/Render/etc)
app.set('trust proxy', 1);

const allowedOrigins = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : ['http://localhost:5173'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'EngMate backend is running',
  });
});

// Rate limiting chung cho toàn bộ API (1000 requests per 15 minutes per IP cho môi trường dev)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 1000, // Giới hạn 1000 request mỗi IP mỗi 15 phút (khá nới lỏng cho dev)
  message: {
    success: false,
    message: 'Quá nhiều request từ IP của bạn, vui lòng thử lại sau.'
  },
  standardHeaders: true, 
  legacyHeaders: false, 
});

app.use('/api', apiLimiter, apiRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;