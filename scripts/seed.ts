import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("\ud83c\udf31 Seeding database...");

  // Create admin test user (john@doe.com)
  const hashedPassword = await bcrypt.hash("johndoe123", 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: "john@doe.com" },
    update: {},
    create: {
      email: "john@doe.com",
      password: hashedPassword,
      firstName: "John",
      lastName: "Doe",
      whatsappNumber: "+1234567890",
      role: "admin",
      emailVerified: new Date(),
    },
  });

  console.log("\u2705 Admin user created:", adminUser.email);

  // Create some sample leads
  const leads = [
    {
      email: "carlos@example.com",
      firstName: "Carlos",
      lastName: "Mendoza",
      whatsappNumber: "+521234567890",
      source: "landing_page",
      status: "new",
    },
    {
      email: "maria@example.com",
      firstName: "María",
      lastName: "González",
      whatsappNumber: "+573001234567",
      source: "registro",
      status: "contacted",
    },
    {
      email: "andres@example.com",
      firstName: "Andrés",
      lastName: "Rivera",
      whatsappNumber: "+51987654321",
      source: "webinar",
      status: "qualified",
    },
  ];

  for (const lead of leads) {
    await prisma.lead.upsert({
      where: { id: lead.email },
      update: {},
      create: lead,
    });
  }

  console.log("\u2705 Sample leads created");

  console.log("\ud83c\udf89 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("\u274c Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
