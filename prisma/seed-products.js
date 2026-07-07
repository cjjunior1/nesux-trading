// Carga inicial del catálogo unificado (cursos + plan + bots). Idempotente (upsert por slug).
// Uso: node prisma/seed-products.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Crea/actualiza el Course real (para el acceso del alumno) y devuelve su id.
async function ensureCourse(slug, title, description, price) {
  const c = await prisma.course.upsert({
    where: { slug },
    update: { title, description, price, isPublished: true },
    create: { slug, title, description, price, isPublished: true },
  });
  return c.id;
}

async function main() {
  // ---------- CURSOS ----------
  const cursos = [
    { slug: "basico", name: "Curso Básico", subtitle: "Fundamentos del Trading", price: 99.99, originalPrice: 197, order: 1,
      description: "Ideal para principiantes. Fundamentos del trading, plataformas y primeros pasos.",
      image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=450&fit=crop" },
    { slug: "intermedio", name: "Curso Intermedio", subtitle: "Estrategias Avanzadas", price: 199.99, originalPrice: 397, order: 2,
      description: "Estrategias avanzadas, gestión de riesgo y herramientas reales de análisis.",
      image: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800&h=450&fit=crop" },
    { slug: "profesional", name: "Curso Profesional", subtitle: "Trading Institucional", price: 499.99, originalPrice: 997, order: 3,
      description: "Nivel institucional: psicología, optimización y trading profesional.",
      image: "https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=800&h=450&fit=crop" },
  ];
  for (const c of cursos) {
    const courseId = await ensureCourse(c.slug, c.name, c.description, c.price);
    const data = {
      kind: "course", name: c.name, subtitle: c.subtitle, description: c.description,
      imageUrl: c.image, price: c.price, originalPrice: c.originalPrice, order: c.order,
      grantsCourseId: courseId, isPublished: true,
    };
    await prisma.product.upsert({ where: { slug: c.slug }, update: data, create: { slug: c.slug, ...data } });
  }

  // ---------- PLAN VIP ----------
  {
    const data = {
      kind: "plan", name: "Membresía VIP", subtitle: "Todo Incluido", price: 999.99, badge: "VIP", order: 10, isPublished: true,
      description: "Acceso completo a todos los cursos, señales y comunidad privada.",
      features: ["Todos los cursos incluidos", "Señales en vivo", "Comunidad privada", "Soporte prioritario"],
    };
    await prisma.product.upsert({ where: { slug: "vip" }, update: data, create: { slug: "vip", ...data } });
  }

  // ---------- BOTS (ejemplos; ajusta nombre/precio en el admin) ----------
  const bots = [
    { slug: "cj-bot", name: "CJ Bot", subtitle: "Automatización de trading", price: 149.99, order: 20, badge: null,
      description: "Bot de trading automatizado CJ. Opera según la estrategia configurada." },
    { slug: "cj-bot-pro", name: "CJ Bot Pro", subtitle: "Versión avanzada", price: 299.99, order: 21, badge: "Más vendido",
      description: "Versión Pro del CJ Bot: más pares, gestión de riesgo y panel de control." },
  ];
  for (const b of bots) {
    const data = { kind: "bot", name: b.name, subtitle: b.subtitle, description: b.description, price: b.price, order: b.order, badge: b.badge, isPublished: true };
    await prisma.product.upsert({ where: { slug: b.slug }, update: data, create: { slug: b.slug, ...data } });
  }

  const total = await prisma.product.count();
  const byKind = await prisma.product.groupBy({ by: ["kind"], _count: true });
  console.log("Catálogo cargado. Total productos:", total);
  console.log(byKind.map((k) => `  ${k.kind}: ${k._count}`).join("\n"));
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
