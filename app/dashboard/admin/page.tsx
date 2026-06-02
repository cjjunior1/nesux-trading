import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin";

export default async function AdminDashboardPage() {
  if (process.env.NODE_ENV === "production") {
    await requireAdminSession();
  }

  let userCount = 0;
  let leadCount = 0;
  let contactCount = 0;

  try {
    [userCount, leadCount, contactCount] = await Promise.all([
      prisma.user.count(),
      prisma.lead.count(),
      prisma.contactSubmission.count(),
    ]);
  } catch {
    // Si la BD no está disponible en desarrollo, mantiene contadores en 0
  }

  const modules = [
    {
      href: "/dashboard/admin/users",
      title: "Usuarios y roles",
      description: "Gestion de cuentas, permisos y accesos.",
    },
    {
      href: "/dashboard/admin/leads",
      title: "Leads y contactos",
      description: "Seguimiento de registros y formularios.",
    },
    {
      href: "/dashboard/admin/courses",
      title: "Cursos",
      description: "Catalogo, precios y publicaciones.",
    },
    {
      href: "/dashboard/admin/bots",
      title: "Bots",
      description: "Planes, activaciones y controles.",
    },
    {
      href: "/dashboard/admin/content",
      title: "Contenido",
      description: "Secciones del sitio, testimonios y FAQ.",
    },
    {
      href: "/dashboard/admin/payments",
      title: "Pagos y suscripciones",
      description: "Planes, cobros y estado de cuentas.",
    },
    {
      href: "/dashboard/admin/notifications",
      title: "Notificaciones",
      description: "Emails, WhatsApp y plantillas.",
    },
    {
      href: "/dashboard/admin/security",
      title: "Seguridad",
      description: "Accesos, auditoria y bloqueos.",
    },
    {
      href: "/dashboard/admin/settings",
      title: "Configuracion general",
      description: "Parametros globales y metadatos.",
    },
    {
      href: "/dashboard/perfil",
      title: "Mi perfil",
      description: "Actualiza tu nombre, email, WhatsApp y contraseña.",
    },
  ];

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Administracion General
          </h1>
          <p className="text-slate-400">
            Vista de usuarios y roles. Solo administradores.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="card">
            <p className="text-sm text-slate-400">Usuarios</p>
            <p className="text-2xl font-semibold text-white">{userCount}</p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-400">Leads</p>
            <p className="text-2xl font-semibold text-white">{leadCount}</p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-400">Contactos</p>
            <p className="text-2xl font-semibold text-white">{contactCount}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <Link
              key={module.href}
              href={module.href}
              className="card hover:border-emerald-500/40 transition-colors"
            >
              <h2 className="text-lg font-semibold text-white mb-2">
                {module.title}
              </h2>
              <p className="text-sm text-slate-400">{module.description}</p>
              <p className="text-xs text-emerald-400 mt-3">
                Configuracion pendiente
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
