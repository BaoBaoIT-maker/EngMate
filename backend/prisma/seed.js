import 'dotenv/config';
import prismaClientPkg from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const { PrismaClient } = prismaClientPkg;

const databaseUrl = process.env.DATABASE_URL;
const parsedUrl = new URL(databaseUrl);

// TiDB Cloud yêu cầu SSL — thêm ssl=true vào URL cho mariadb driver
const isTiDB = parsedUrl.hostname.includes('tidbcloud.com');
if (isTiDB || parsedUrl.searchParams.get('sslaccept') === 'strict') {
  parsedUrl.searchParams.delete('sslaccept');
  parsedUrl.searchParams.set('ssl', 'true');
}
const connectionUrl = parsedUrl.toString();

const adapter = new PrismaMariaDb(connectionUrl);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding Categories...');
  const categories = [
    { code: 'GENERAL', name: 'Tiếng Anh Giao Tiếp', description: 'Từ vựng và hội thoại giao tiếp hàng ngày', sortOrder: 1 },
    { code: 'TOEIC',   name: 'Luyện thi TOEIC',    description: 'Từ vựng và kỹ năng thi TOEIC',              sortOrder: 2 },
    { code: 'IELTS',   name: 'Luyện thi IELTS',    description: 'Từ vựng và kỹ năng thi IELTS',              sortOrder: 3 },
  ];
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { code: cat.code },
      update: { name: cat.name, description: cat.description, sortOrder: cat.sortOrder },
      create: cat,
    });
  }
  console.log('✅ Categories seeded');

  console.log('🌱 Seeding GameConfigs...');
  const games = [
    { gameType: 'MATCHING',      label: 'Nối từ',             isEnabled: true },
    { gameType: 'FILL_BLANK',    label: 'Điền vào chỗ trống', isEnabled: true },
    { gameType: 'SPEAKING_GAME', label: 'AI Speaking Coach',  isEnabled: true },
  ];
  for (const game of games) {
    await prisma.gameConfig.upsert({
      where: { gameType: game.gameType },
      update: { label: game.label, isEnabled: game.isEnabled },
      create: game,
    });
  }
  console.log('✅ GameConfigs seeded');

  console.log('🌱 Seeding SubscriptionPlans...');
  const plans = [
    {
      code: 'FREE',
      name: 'Miễn phí',
      price: 0,
      durationDays: 36500,
      features: { aiLimit: 3, freezeStreak: false },
      isActive: true,
    },
    {
      code: 'PREMIUM_MONTH',
      name: 'Gói 1 Tháng',
      price: 1000,
      durationDays: 30,
      features: { aiLimit: 20, freezeStreak: true },
      isActive: true,
    },
    {
      code: 'PREMIUM_YEAR',
      name: 'Gói 1 Năm',
      price: 6000,
      durationDays: 365,
      features: { aiLimit: 20, freezeStreak: true },
      isActive: true,
    },
  ];
  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { code: plan.code },
      update: plan,
      create: plan,
    });
  }
  console.log('✅ SubscriptionPlans seeded');

  console.log('\n🎉 All seeds completed!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
