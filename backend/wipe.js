import prisma from './src/config/prisma.js';

async function main() {
  const res = await prisma.user.deleteMany({});
  console.log(`Đã xóa thành công ${res.count} tài khoản cũ.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
