const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function createAdmin() {
  const email = 'admin@nesux.com';
  const password = 'Cjjunior1@';

  // Generar hash
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  const hashedPassword = `$pbkdf2-sha512$100000$${salt}$${hash}`;

  try {
    // Intenta actualizar primero
    let user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      // Si existe, actualiza la contraseña
      user = await prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
      });
      console.log('✅ Contraseña actualizada para:', email);
    } else {
      // Si no existe, lo crea
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName: 'Admin',
          lastName: 'Nesux',
          role: 'admin',
          emailVerified: new Date(),
        },
      });
      console.log('✅ Usuario admin creado:', email);
    }

    console.log('Credenciales:');
    console.log('Email:', email);
    console.log('Contraseña:', password);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
