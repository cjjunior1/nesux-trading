import Link from "next/link";
import { requireAdminSession } from "@/lib/admin";

export default async function AdminSettingsPage() {
  await requireAdminSession();

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-8">
          <Link href="/dashboard/admin" className="text-sm text-emerald-400">
            Volver al panel
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-2">
            Configuracion general
          </h1>
          <p className="text-slate-400">
            Parametros globales, SEO y preferencias.
          </p>
        </div>

        <div className="grid gap-4">
          <div className="card">
            <p className="text-white font-medium mb-1">Identidad</p>
            <p className="text-sm text-slate-400">
              Nombre del sitio, logo y contacto.
            </p>
          </div>
          <div className="card">
            <p className="text-white font-medium mb-1">SEO</p>
            <p className="text-sm text-slate-400">
              Metadatos y open graph.
            </p>
          </div>
          <div className="card">
            <p className="text-white font-medium mb-1">Preferencias</p>
            <p className="text-sm text-slate-400">
              Idioma, zona horaria y moneda.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
