import Link from "next/link";
import { requireAdminSession } from "@/lib/admin";

export default async function AdminCoursesPage() {
  await requireAdminSession();

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-8">
          <Link href="/dashboard/admin" className="text-sm text-emerald-400">
            Volver al panel
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-2">
            Cursos
          </h1>
          <p className="text-slate-400">
            Configura catalogo, precios, modulos y publicaciones.
          </p>
        </div>

        <div className="card">
          <p className="text-slate-300 mb-2">
            No hay cursos configurados en la plataforma.
          </p>
          <p className="text-sm text-slate-400">
            Aqui se crearan cursos, niveles y acceso por plan.
          </p>
        </div>
      </div>
    </div>
  );
}


export const dynamic = 'force-dynamic';
