import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const userEmail = process.argv[2]; // opcional: email para dar acceso automático

  const course = await prisma.course.upsert({
    where: { slug: "plataforma-especifica" },
    update: {
      title: "Curso de Plataforma Específica",
      description: "Aprende a usar la plataforma con indicadores específicos paso a paso.",
      price: 199.99,
      isPublished: true,
    },
    create: {
      id: "curso-test-123",
      slug: "plataforma-especifica",
      title: "Curso de Plataforma Específica",
      description: "Aprende a usar la plataforma con indicadores específicos paso a paso.",
      price: 199.99,
      isPublished: true,
    },
  });

  const module1 = await prisma.courseModule.upsert({
    where: { id: "modulo-test-1" },
    update: {
      title: "Módulo 1: Introducción",
      description: "Conoce la plataforma y la configuración inicial",
      order: 1,
      courseId: course.id,
    },
    create: {
      id: "modulo-test-1",
      courseId: course.id,
      title: "Módulo 1: Introducción",
      description: "Conoce la plataforma y la configuración inicial",
      order: 1,
    },
  });

  const lesson1 = await prisma.courseLesson.upsert({
    where: { id: "leccion-test-1" },
    update: {
      moduleId: module1.id,
      title: "Lección 1: Configuración Inicial",
      description: "Primeros pasos y ajustes básicos",
      content: "En esta lección aprenderás la configuración inicial de la plataforma.",
      order: 1,
    },
    create: {
      id: "leccion-test-1",
      moduleId: module1.id,
      title: "Lección 1: Configuración Inicial",
      description: "Primeros pasos y ajustes básicos",
      content: "En esta lección aprenderás la configuración inicial de la plataforma.",
      order: 1,
    },
  });

  await prisma.courseResource.upsert({
    where: { id: "recurso-test-1" },
    update: {
      lessonId: lesson1.id,
      type: "image",
      title: "Imagen de ejemplo",
      url: "/images/cursos/plataforma-especifica/modulo-1/ejemplo.png",
      order: 1,
    },
    create: {
      id: "recurso-test-1",
      lessonId: lesson1.id,
      type: "image",
      title: "Imagen de ejemplo",
      url: "/images/cursos/plataforma-especifica/modulo-1/ejemplo.png",
      order: 1,
    },
  });

  if (userEmail) {
    const user = await prisma.user.findUnique({ where: { email: userEmail } });

    if (!user) {
      console.log(`⚠️ Usuario no encontrado: ${userEmail}`);
      console.log("Puedes dar acceso luego desde base de datos.");
    } else {
      await prisma.userCourseAccess.upsert({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId: course.id,
          },
        },
        update: {
          grantedAt: new Date(),
        },
        create: {
          userId: user.id,
          courseId: course.id,
        },
      });

      console.log(`✅ Acceso concedido al curso para: ${user.email}`);
    }
  }

  console.log("✅ Curso de prueba listo:");
  console.log(`   ID: ${course.id}`);
  console.log(`   URL: http://localhost:3000/dashboard/curso/${course.id}`);
  console.log("   Página Mis Cursos: http://localhost:3000/dashboard/mis-cursos");
}

main()
  .catch((e) => {
    console.error("❌ Error creando curso de prueba:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
