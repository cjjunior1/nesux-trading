const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function resetPassword() {
  const email = 'admin@nesux.com';
  const newPassword = 'Cjjunior1@';

  // Generar hash simple (sin bcrypt disponible, usar crypto)
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(newPassword, salt, 100000, 64, 'sha512').toString('hex');
  const hashedPassword = `$pbkdf2-sha512$100000$${salt}$${hash}`;

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });
    console.log('✅ Contraseña actualizada para:', email);
    console.log('Nueva contraseña: Cjjunior1@');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
