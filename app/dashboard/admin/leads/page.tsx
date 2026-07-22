import Link from "next/link";
import { prisma } from "@/lib/db";
import { bizWhere } from "@/lib/business";
import { requireAdminSession } from "@/lib/admin";

export default async function AdminLeadsPage() {
  await requireAdminSession();

  const leads = await prisma.lead.findMany({
    where: await bizWhere(),
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      whatsappNumber: true,
      source: true,
      status: true,
      createdAt: true,
    },
  });

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <Link href="/dashboard/admin" className="text-sm text-emerald-400">
            Volver al panel
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-2">
            Leads y contactos
          </h1>
          <p className="text-slate-400">
            Seguimiento de registros y contactos del sitio.
          </p>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-800/60">
                <tr className="text-slate-300 text-sm">
                  <th className="px-4 py-3 font-medium">Nombre</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">WhatsApp</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Fuente</th>
                  <th className="px-4 py-3 font-medium">Creado</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => {
                  const fullName = [lead.firstName, lead.lastName]
                    .filter(Boolean)
                    .join(" ")
                    .trim();
                  return (
                    <tr
                      key={lead.id}
                      className="border-t border-slate-800/60 text-slate-200"
                    >
                      <td className="px-4 py-3">
                        {fullName || "Sin nombre"}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {lead.email}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {lead.whatsappNumber || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full bg-slate-700/60 px-2.5 py-0.5 text-xs font-medium text-slate-200">
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-sm">
                        {lead.source || "-"}
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-sm">
                        {new Date(lead.createdAt).toLocaleDateString("es-ES")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {leads.length === 0 && (
            <div className="px-4 py-6 text-slate-400">No hay leads.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
