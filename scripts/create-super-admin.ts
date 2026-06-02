import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "cjindustrialrd@hotmail.com";
  const plainPassword = "CJjunior1";

  const hashed = await bcrypt.hash(plainPassword, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashed,
      firstName: "CJ",
      lastName: "Industrial",
      whatsappNumber: "",
      role: "super-admin",
      emailVerified: new Date(),
    },
    create: {
      email,
      password: hashed,
      firstName: "CJ",
      lastName: "Industrial",
      whatsappNumber: "",
      role: "super-admin",
      emailVerified: new Date(),
    },
  });

  console.log("✅ Super-admin created/updated:", user.email);
}

main()
  .catch((e) => {
    console.error("❌ Error creating super-admin:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
