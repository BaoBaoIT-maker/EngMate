import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

const parsedUrl = new URL(process.env.DATABASE_URL);

const adapter = new PrismaMariaDb({
  host: parsedUrl.hostname,
  port: parsedUrl.port ? parseInt(parsedUrl.port, 10) : 3306,
  user: decodeURIComponent(parsedUrl.username),
  password: decodeURIComponent(parsedUrl.password),
  database: parsedUrl.pathname.replace(/^\//, ''),
  // TiDB Cloud bắt buộc SSL, dùng object config để mariadb driver nhận đúng
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: false, // false để chấp nhận TiDB self-signed cert
  },
});

const prisma = globalThis.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export default prisma;