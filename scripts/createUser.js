#!/usr/bin/env node
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const [,, email, password, firstName = 'CJ', lastName = 'Industrial', role = 'user', whatsappNumber = ''] = process.argv;

if (!email || !password) {
  console.error('Usage: node scripts/createUser.js email password [firstName] [lastName] [role]');
  process.exit(1);
}

(async () => {
  const prisma = new PrismaClient();
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log('USER_ALREADY_EXISTS', existing.id);
      return;
    }

    const hash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        password: hash,
        firstName,
        lastName,
        role,
        whatsappNumber,
        emailVerified: new Date(),
      },
    });
    console.log('CREATED_USER_ID:', user.id);
  } catch (e) {
    console.error('ERROR:', e.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
