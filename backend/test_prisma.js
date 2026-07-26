const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return console.log('No user');

    const result = await prisma.userLearningPath.upsert({
      where: { userId_category: { userId: user.id, category: 'GENERAL' } },
      update: { currentLevel: 'A2', targetScore: 'B2', isActive: true, updatedAt: new Date() },
      create: { userId: user.id, category: 'GENERAL', currentLevel: 'A2', targetScore: 'B2', isActive: true }
    });
    console.log('Success:', result);
  } catch(e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
