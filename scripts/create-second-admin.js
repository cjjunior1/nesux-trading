
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'cjindustrialrd@hotmail.com';
  const passwordRaw = 'Cj-industrial';
  
  console.log(`Creating/Updating admin user: ${email}...`);

  try {
    const hashedPassword = await bcrypt.hash(passwordRaw, 10);

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        role: 'admin', // Asegura rol admin
        emailVerified: new Date(), // Asegura email verificado
      },
      create: {
        email,
        password: hashedPassword,
        role: 'admin',
        firstName: 'CJ',
        lastName: 'Industrial',
        whatsappNumber: '0000000000',
        emailVerified: new Date(),
      },
    });

    console.log(`SUCCESS: User ${user.email} is now an admin.`);
    console.log(`Role: ${user.role}`);
  } catch (error) {
    console.error('ERROR creating admin user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
