import crypto from "crypto";
import { prisma } from "@/lib/db";

// ---- PURAS (testeables) ----

/**
 * Separa "Nombre y Apellido" en partes y calcula las iniciales para el ID.
 * Requiere AL MENOS dos palabras. Devuelve null si no cumple.
 * - firstName: primera palabra
 * - lastName: el resto
 * - initials: 1ª letra de la 1ª palabra + 1ª letra de la 2ª palabra (mayúsculas)
 */
export function parseFullName(fullName: string): { firstName: string; lastName: string; initials: string } | null {
  const words = (fullName || "").trim().split(/\s+/).filter(Boolean);
  if (words.length < 2) return null;
  const firstName = words[0];
  const lastName = words.slice(1).join(" ");
  const initials = (words[0][0] + words[1][0]).toUpperCase();
  return { firstName, lastName, initials };
}

/** Contraseña temporal ALEATORIA (no derivada del ID). 8 caracteres. */
export function generateTempPassword(): string {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}

// ---- CON BD ----

/** Genera un ID de cliente único: iniciales + correlativo global (ej: JH1001). */
export async function nextClientId(initials: string): Promise<string> {
  const seq = await prisma.$transaction(async (tx) => {
    const current = await tx.appSetting.findUnique({ where: { key: "client_seq" } });
    const base = current ? parseInt(current.value, 10) : 1000;
    const next = base + 1;
    await tx.appSetting.upsert({
      where: { key: "client_seq" },
      create: { key: "client_seq", value: String(next) },
      update: { value: String(next) },
    });
    return next;
  });
  return `${initials}${seq}`;
}

/** Días configurables para forzar el cambio de contraseña (por defecto 15). */
export async function getPasswordChangeDays(): Promise<number> {
  const s = await prisma.appSetting.findUnique({ where: { key: "password_change_days" } });
  const n = s ? parseInt(s.value, 10) : 15;
  return Number.isFinite(n) && n > 0 ? n : 15;
}
