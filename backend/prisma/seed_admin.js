import 'dotenv/config';
import prismaClientPkg from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import bcrypt from 'bcryptjs';

const { PrismaClient } = prismaClientPkg;

const databaseUrl = process.env.DATABASE_URL;
const parsedUrl = new URL(databaseUrl);

// TiDB Cloud yêu cầu SSL
const isTiDB = parsedUrl.hostname.includes('tidbcloud.com');
if (isTiDB || parsedUrl.searchParams.get('sslaccept') === 'strict') {
  parsedUrl.searchParams.delete('sslaccept');
  parsedUrl.searchParams.set('ssl', 'true');
}
const adapter = new PrismaMariaDb(parsedUrl.toString());

const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = 'admin@engmate.com';
  const adminPassword = 'admin';
  const adminUsername = 'admin';

  console.log(`Checking for existing admin user with email: ${adminEmail}`);
  
  let adminUser = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (adminUser) {
    console.log('Admin user already exists. Checking role...');
    if (adminUser.role !== 'ADMIN') {
      await prisma.user.update({
        where: { id: adminUser.id },
        data: { role: 'ADMIN' }
      });
      console.log('Role updated to ADMIN.');
    } else {
      console.log('Admin user is fully set up.');
    }
  } else {
    console.log('Admin user not found. Creating a new one...');
    
    // Using standard bcrypt hash as used in utils/password.js
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(adminPassword, saltRounds);

    adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        role: 'ADMIN',
        isVerified: true,
        verifiedAt: new Date(),
        provider: 'LOCAL',
        profile: {
          create: {
            username: adminUsername,
          }
        },
        setting: {
          create: {
            theme: 'LIGHT',
            receiveEmails: false,
            onboardingDone: true,
          }
        }
      }
    });
    console.log(`Created admin user successfully: ${adminEmail} / ${adminPassword}`);
  }
}

main()
  .catch((e) => {
    console.error('Error seeding admin user:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
