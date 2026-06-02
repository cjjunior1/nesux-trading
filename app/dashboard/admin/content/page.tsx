import Link from "next/link";
import { requireAdminSession } from "@/lib/admin";

export default async function AdminContentPage() {
  await requireAdminSession();

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-8">
          <Link href="/dashboard/admin" className="text-sm text-emerald-400">
            Volver al panel
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-2">
            Contenido
          </h1>
          <p className="text-slate-400">
            Edita secciones del sitio, testimonios y FAQ.
          </p>
        </div>

        <div className="grid gap-4">
          <div className="card">
            <p className="text-white font-medium mb-1">Home</p>
            <p className="text-sm text-slate-400">
              Hero, beneficios, cursos y CTA.
            </p>
          </div>
          <div className="card">
            <p className="text-white font-medium mb-1">Testimonios</p>
            <p className="text-sm text-slate-400">
              Gestiona historias y calificaciones.
            </p>
          </div>
          <div className="card">
            <p className="text-white font-medium mb-1">FAQ</p>
            <p className="text-sm text-slate-400">
              Preguntas frecuentes y respuestas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}




export const dynamic = 'force-dynamic';
