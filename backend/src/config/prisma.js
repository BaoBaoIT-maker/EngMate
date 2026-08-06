import prismaClientPkg from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const { PrismaClient } = prismaClientPkg;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required');
}

// Xây dựng connection URL chuẩn mariadb://... để adapter tự xử lý SSL
const buildConnectionUrl = (rawUrl) => {
  const parsedUrl = new URL(rawUrl);
  
  // Adapter cần protocol là mariadb:// hoặc mysql://
  // Giữ nguyên protocol, chỉ đảm bảo ssl được khai báo đúng
  const isTiDB = parsedUrl.hostname.includes('tidbcloud.com');
  const needsSSL = parsedUrl.searchParams.get('sslaccept') === 'strict' || isTiDB;
  
  if (needsSSL) {
    // Xóa param cũ và thêm param ssl chuẩn cho mariadb driver
    parsedUrl.searchParams.delete('sslaccept');
    parsedUrl.searchParams.set('ssl', 'true');
  }

  return parsedUrl.toString();
};

const connectionUrl = buildConnectionUrl(databaseUrl);
const adapter = new PrismaMariaDb(connectionUrl);

const prisma = globalThis.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export default prisma;