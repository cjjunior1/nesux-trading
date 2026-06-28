/**
 * Seed de DESARROLLO para el panel de administración.
 * Crea un admin, alumnos de prueba con suscripciones y pagos variados
 * (al día / morosos / suspendidos) y algo de actividad, para que el
 * Dashboard y la gestión de usuarios muestren datos reales.
 *
 * Ejecutar:  npx tsx --require dotenv/config scripts/seed-dev.ts
 * (Usa el DATABASE_URL de .env -> base local trading_dev)
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PLANS = [
  { plan: "basico", amount: 99.99 },
  { plan: "intermedio", amount: 199.99 },
  { plan: "profesional", amount: 499.99 },
  { plan: "vip", amount: 999.99 },
];

const METHODS = ["card", "paypal", "transfer", "crypto", "manual"];
const FIRST = ["Carlos", "María", "Andrés", "Janet", "Mario", "Ana", "Joel", "Lucía", "Pedro", "Sofía", "Diego", "Valentina", "Robinson", "Emma", "Luis"];
const LAST = ["Mendoza", "González", "Rivera", "Sánchez", "Guzmán", "Martínez", "Paredes", "Torres", "Ramírez", "Flores", "Castro", "Vargas", "Rosario", "Ortega", "Núñez"];

const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);
const daysFromNow = (d: number) => new Date(Date.now() + d * 24 * 60 * 60 * 1000);
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

async function main() {
  console.log("🌱 Seed de desarrollo (panel admin)...");

  // --- Admin (puedes entrar con este) ---
  const adminPass = await bcrypt.hash("Cjjunior1@", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@nesux.com" },
    update: { password: adminPass, role: "admin", emailVerified: new Date(), status: "active" },
    create: {
      email: "admin@nesux.com",
      password: adminPass,
      firstName: "CJ",
      lastName: "Admin",
      whatsappNumber: "+10000000000",
      role: "admin",
      emailVerified: new Date(),
    },
  });
  console.log("✅ Admin:", admin.email, "/ contraseña: Cjjunior1@");

  // --- Limpiar alumnos demo previos (re-ejecutable) ---
  await prisma.user.deleteMany({ where: { email: { endsWith: "@demo.com" } } });

  // --- Alumnos de prueba ---
  const studentPass = await bcrypt.hash("demo1234", 12);
  let alDia = 0, morosos = 0, suspendidos = 0;

  for (let i = 0; i < 18; i++) {
    const planInfo = pick(PLANS);
    const createdAt = daysAgo(Math.floor(Math.random() * 150) + 5);
    // ~30% morosos (vencimiento ya pasó), ~12% suspendidos, resto al día
    const r = Math.random();
    const isSuspended = r < 0.12;
    const isMoroso = !isSuspended && r < 0.42;
    const periodEnd = isMoroso ? daysAgo(Math.floor(Math.random() * 25) + 1) : daysFromNow(Math.floor(Math.random() * 60) + 3);

    const first = FIRST[i % FIRST.length];
    const last = LAST[i % LAST.length];

    const user = await prisma.user.create({
      data: {
        email: `alumno${i + 1}@demo.com`,
        password: studentPass,
        firstName: first,
        lastName: last,
        whatsappNumber: `+52155500${String(1000 + i)}`,
        role: "user",
        emailVerified: createdAt,
        status: isSuspended ? "suspended" : "active",
        suspendedReason: isSuspended ? "Falta de pago reiterada" : null,
        suspendedUntil: isSuspended ? daysFromNow(15) : null,
        lastLoginAt: Math.random() > 0.3 ? daysAgo(Math.floor(Math.random() * 20)) : null,
        createdAt,
        subscriptions: {
          create: {
            plan: planInfo.plan,
            amount: planInfo.amount,
            status: isMoroso ? "past_due" : "active",
            startedAt: createdAt,
            currentPeriodEnd: periodEnd,
          },
        },
      },
      include: { subscriptions: true },
    });

    if (isSuspended) suspendidos++;
    else if (isMoroso) morosos++;
    else alDia++;

    // Pagos: 1-4 cobros pasados
    const nPayments = Math.floor(Math.random() * 4) + 1;
    for (let p = 0; p < nPayments; p++) {
      await prisma.payment.create({
        data: {
          userId: user.id,
          subscriptionId: user.subscriptions[0]?.id,
          amount: planInfo.amount,
          currency: "USD",
          method: pick(METHODS),
          status: "paid",
          paidAt: daysAgo(Math.floor(Math.random() * 120) + p * 30),
        },
      });
    }

    // Algo de tracking de navegación (para el módulo de actividad)
    const paths = ["/dashboard", "/cursos", "/dashboard/mis-cursos", "/metodo", "/bots"];
    const nVisits = Math.floor(Math.random() * 6);
    for (let v = 0; v < nVisits; v++) {
      const enteredAt = daysAgo(Math.floor(Math.random() * 30));
      await prisma.pageVisit.create({
        data: {
          userId: user.id,
          path: pick(paths),
          enteredAt,
          leftAt: new Date(enteredAt.getTime() + Math.floor(Math.random() * 600000)),
          durationMs: Math.floor(Math.random() * 600000),
        },
      });
    }
  }

  const totalPayments = await prisma.payment.aggregate({ _sum: { amount: true }, _count: true });
  console.log(`✅ Alumnos: 18  (al día: ${alDia}, morosos: ${morosos}, suspendidos: ${suspendidos})`);
  console.log(`✅ Pagos: ${totalPayments._count} por un total de $${(totalPayments._sum.amount || 0).toFixed(2)}`);
  console.log("🎉 Seed de desarrollo completo.");
}

main()
  .catch((e) => { console.error("❌ Error:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
