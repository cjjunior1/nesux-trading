import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { getPasswordChangeDays } from "@/lib/account";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        // Acepta email o ID de usuario (ej: JH1001)
        email: { label: "Email o ID", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Credenciales inválidas");
        }

        const id = credentials.email.trim();
        // Busca por email (minúsculas) o por clientId (mayúsculas)
        const user = await prisma.user.findFirst({
          where: { OR: [{ email: id.toLowerCase() }, { clientId: id.toUpperCase() }] },
        });

        if (!user) throw new Error("Usuario no encontrado");
        if (user.deletedAt || user.status === "deleted") throw new Error("Esta cuenta no está disponible");
        if (user.status === "suspended") throw new Error("Tu cuenta está suspendida. Contacta a soporte.");
        if (!user.emailVerified) throw new Error("Por favor verifica tu email antes de iniciar sesión");

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) throw new Error("Contraseña incorrecta");

        // Registrar último acceso
        await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } }).catch(() => {});

        // ¿Debe cambiar la contraseña? (al registrarse, o pasados N días configurables)
        const days = await getPasswordChangeDays();
        const expiredByAge = user.passwordChangedAt
          ? Date.now() - user.passwordChangedAt.getTime() > days * 86400000
          : true;
        const mustChangePassword = user.mustChangePassword || expiredByAge;

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
          mustChangePassword,
        } as any;
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.mustChangePassword = (user as any).mustChangePassword;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).mustChangePassword = (token as any).mustChangePassword;
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
};
