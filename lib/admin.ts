import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";

export async function requireAdminSession() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if ((session.user as any)?.role !== "admin") {
    redirect("/dashboard");
  }

  return session;
}
