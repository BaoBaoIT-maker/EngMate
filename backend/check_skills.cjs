const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const skills = await prisma.userSkill.findMany();
  console.log(skills);
  await prisma.$disconnect();
}
main();
