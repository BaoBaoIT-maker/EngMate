import prismaClientPkg from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const { PrismaClient } = prismaClientPkg;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required');
}

const parsedUrl = new URL(databaseUrl);

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
  // SSL bắt buộc cho TiDB Cloud Serverless
  ...(needsSSL && { ssl: true }),
};

const adapter = new PrismaMariaDb(adapterConfig);

const prisma = globalThis.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export default prisma;