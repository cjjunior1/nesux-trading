import { requireAdminSession } from "@/lib/admin";
import { AdminPanel } from "@/components/admin/AdminPanel";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // En producción exige sesión admin; en local se permite para desarrollar.
  if (process.env.NODE_ENV === "production") {
    await requireAdminSession();
  }
  return <AdminPanel />;
}
