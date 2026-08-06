import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import dns from 'dns';

// Render có thể gặp lỗi timeout khi resolve IPv6 với TiDB NLB, ưu tiên IPv4
dns.setDefaultResultOrder('ipv4first');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

const parsedUrl = new URL(process.env.DATABASE_URL);
const isTiDB = parsedUrl.hostname.includes('tidbcloud.com');
const needsSSL =
  isTiDB ||
  parsedUrl.searchParams.get('sslaccept') === 'strict' ||
  parsedUrl.searchParams.get('ssl') === 'true';

const adapterConfig = {
  host: parsedUrl.hostname,
  port: parsedUrl.port ? parseInt(parsedUrl.port, 10) : 3306,
  user: decodeURIComponent(parsedUrl.username),
  password: decodeURIComponent(parsedUrl.password),
  database: parsedUrl.pathname.replace(/^\//, ''),
  connectionLimit: 10,
  connectTimeout: 20000, // Tăng timeout lên 20s
  ...(needsSSL && {
    ssl: {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: false,
    },
  }),
};

const adapter = new PrismaMariaDb(adapterConfig);
const prisma = globalThis.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export default prisma;
