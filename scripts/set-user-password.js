const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.log("USAGE: node scripts/set-user-password.js <email> <password>");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log("USER_NOT_FOUND");
    return;
  }

  const hash = await bcrypt.hash(password, 12);
  await prisma.user.update({
    where: { email },
    data: { password: hash, emailVerified: new Date() },
  });

  console.log("PASSWORD_UPDATED");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
