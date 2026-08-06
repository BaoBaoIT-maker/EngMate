import { PrismaClient } from '@prisma/client';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

// Dùng Prisma native engine (Rust) thay vì driver adapter mariadb.
// Prisma native engine hoàn toàn tương thích và tự động cấu hình SSL cho TiDB Cloud 
// (đã được chứng minh qua lệnh prisma db push).
const prisma = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export default prisma;