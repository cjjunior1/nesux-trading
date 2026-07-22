// Filtro por negocio.
//
// Esta app comparte la base de datos con Nesux y los demás negocios, así que
// cualquier consulta sin filtrar devolvería también clientes de IA Para Todos,
// Litio, etc. Este helper resuelve una vez el id del negocio y da los "where"
// para reutilizarlos en vez de repetir el filtro a mano en cada consulta.
//
// El LOGIN no usa esto a propósito: la cuenta es única para todos los negocios
// (ver lib/auth-options.ts). Lo que se filtra son los listados de administración.
//
// Una persona puede pertenecer a VARIOS negocios a la vez (tabla UserBusiness),
// así que los usuarios se filtran por pertenencia, no por el campo businessId,
// que solo indica por dónde entró la primera vez.

import { prisma } from "@/lib/db";

export const BUSINESS_SLUG = process.env.BUSINESS_SLUG || "trading";

let cached: Promise<string> | null = null;

/**
 * Id del negocio de esta app.
 *
 * Lanza si el negocio no existe, a propósito: devolver undefined haría que el
 * `where` quedara vacío y el panel mostrase en silencio los clientes de todos
 * los negocios — justo el fallo que este helper existe para evitar. Es mejor
 * una pantalla de error que una fuga de datos silenciosa.
 */
export function getBusinessId(): Promise<string> {
  if (!cached) {
    cached = prisma.business
      .findUnique({ where: { slug: BUSINESS_SLUG }, select: { id: true } })
      .then((b) => {
        if (!b) {
          cached = null; // permite reintentar si el negocio se crea después
          throw new Error(
            `No existe el negocio "${BUSINESS_SLUG}" en la base de datos. ` +
              `Ejecuta prisma/ensure-businesses.js desde la app de Nesux.`
          );
        }
        return b.id;
      })
      .catch((e) => {
        cached = null;
        throw e;
      });
  }
  return cached;
}

/**
 * Filtro de USUARIOS de este negocio.
 * Por pertenencia: alguien que se inscribió primero en Litio y luego aquí
 * también es alumno nuestro, aunque su businessId original sea el de Litio.
 */
export async function bizUsersWhere(): Promise<{ businesses: { some: { businessId: string } } }> {
  return { businesses: { some: { businessId: await getBusinessId() } } };
}

/** Filtro para lo que SÍ pertenece a un solo negocio: Lead, Payment, Course, Subscription. */
export async function bizWhere(): Promise<{ businessId: string }> {
  return { businessId: await getBusinessId() };
}

/**
 * Para los modelos que cuelgan de un usuario y no tienen negocio propio
 * (UserCourseAccess, UserProgress, ChatSession).
 */
export async function bizUserWhere(): Promise<{ user: { businesses: { some: { businessId: string } } } }> {
  return { user: await bizUsersWhere() };
}

/**
 * Vincula a una persona con este negocio. Idempotente: si ya pertenecía, no
 * hace nada. Es lo que se llama cuando alguien que YA tiene cuenta Nesux se
 * inscribe aquí — en vez de crearle un usuario nuevo.
 */
export async function vincularANegocio(userId: string): Promise<{ yaPertenecia: boolean }> {
  const businessId = await getBusinessId();
  const ya = await prisma.userBusiness.findUnique({
    where: { userId_businessId: { userId, businessId } },
    select: { id: true },
  });
  if (ya) return { yaPertenecia: true };
  await prisma.userBusiness.create({ data: { userId, businessId } });
  return { yaPertenecia: false };
}
