import 'dotenv/config';
import prisma from '../src/config/prisma.js';

async function main() {
  console.log('Seeding plans...');

  const plans = [
    {
      name: 'Gói Miễn Phí (Free)',
      code: 'FREE',
      price: 0,
      durationDays: 3650, // 10 năm
      features: { aiLimit: 3, streakRepair: false },
    },
    {
      name: 'Gói 1 Tháng (Premium)',
      code: 'MONTHLY_1',
      price: 1000,
      durationDays: 30,
      features: { aiLimit: 20, streakRepair: true },
    },
    {
      name: 'Gói 1 Năm (Premium)',
      code: 'YEARLY_1',
      price: 6000,
      durationDays: 365,
      features: { aiLimit: 20, streakRepair: true },
    }
  ];

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { code: plan.code },
      update: {
        name: plan.name,
        price: plan.price,
        durationDays: plan.durationDays,
        features: plan.features
      },
      create: plan
    });
  }

  console.log('Plans seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
