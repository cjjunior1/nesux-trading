#!/usr/bin/env node
const { PrismaClient } = require('@prisma/client');

const [,, email, role = 'admin'] = process.argv;
if (!email) {
  console.error('Usage: node scripts/setRole.js email [role]');
  process.exit(1);
}

(async () => {
  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.error('USER_NOT_FOUND');
      process.exit(1);
    }
    const updated = await prisma.user.update({
      where: { email },
      data: { role },
    });
    console.log('UPDATED_USER:', updated.id, updated.email, updated.role);
  } catch (e) {
    console.error('ERROR:', e.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
