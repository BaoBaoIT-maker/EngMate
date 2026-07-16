import prismaClientPkg from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const { PrismaClient } = prismaClientPkg;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required');
}

const parsedUrl = new URL(databaseUrl);

const adapter = new PrismaMariaDb({
  host: parsedUrl.hostname,
  user: decodeURIComponent(parsedUrl.username),
  password: decodeURIComponent(parsedUrl.password),
  database: parsedUrl.pathname.replace(/^\//, ''),
});

const prisma = globalThis.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export default prisma;