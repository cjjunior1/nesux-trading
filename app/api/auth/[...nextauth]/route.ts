import NextAuth from "next-auth";

export async function GET(request: Request) {
  const { authOptions } = await import("@/lib/auth-options");
  const handler = NextAuth(authOptions);
  return handler(request);
}

export async function POST(request: Request) {
  const { authOptions } = await import("@/lib/auth-options");
  const handler = NextAuth(authOptions);
  return handler(request);
}

export const dynamic = 'force-dynamic';
