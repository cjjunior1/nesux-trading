import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin";

export default async function AdminUsersPage() {
  await requireAdminSession();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
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
            Usuarios y roles
          </h1>
          <p className="text-slate-400">
            Administracion de cuentas y permisos.
          </p>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-800/60">
                <tr className="text-slate-300 text-sm">
                  <th className="px-4 py-3 font-medium">Nombre</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Rol</th>
                  <th className="px-4 py-3 font-medium">Creado</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const fullName = [user.firstName, user.lastName]
                    .filter(Boolean)
                    .join(" ")
                    .trim();
                  return (
                    <tr
                      key={user.id}
                      className="border-t border-slate-800/60 text-slate-200"
                    >
                      <td className="px-4 py-3">
                        {fullName || "Sin nombre"}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {user.email}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-sm">
                        {new Date(user.createdAt).toLocaleDateString("es-ES")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="px-4 py-6 text-slate-400">No hay usuarios.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
