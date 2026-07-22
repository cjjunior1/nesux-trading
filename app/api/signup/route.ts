import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { parseFullName, generateTempPassword, nextClientId } from "@/lib/account";
import { sendNewAccountCredentials } from "@/lib/notify";
import { getBusinessId, vincularANegocio } from "@/lib/business";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email: string = (body.email || "").trim();
    const whatsappNumber: string = (body.whatsappNumber || "").trim();

    // --- Nombre y apellido ---
    // El formulario los manda separados. Se respetan tal cual: recomponerlos y
    // volver a partirlos rompía los nombres compuestos ("Juan Carlos" + "Pérez"
    // daba apellido "Carlos Pérez"). Se mantiene fullName por compatibilidad
    // con clientes viejos que aún lo envíen.
    let firstName: string = (body.firstName || "").trim();
    let lastName: string = (body.lastName || "").trim();

    if (!firstName || !lastName) {
      const parsed = parseFullName(body.fullName || "");
      if (!parsed) {
        return NextResponse.json(
          { error: "Por favor, ingresa tu nombre y apellido completos. Necesitamos ambos para generar tu ID de usuario." },
          { status: 400 }
        );
      }
      firstName = parsed.firstName;
      lastName = parsed.lastName;
    }

    // El ID se forma con la inicial del nombre y la del apellido (ej. Juan Hernández -> JH1001)
    const initials = (firstName[0] + lastName[0]).toUpperCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "El formato del email no es válido" }, { status: 400 });
    }
    const cleanWhats = whatsappNumber.replace(/[\s-]/g, "");
    if (!/^\+?[1-9]\d{7,14}$/.test(cleanWhats)) {
      return NextResponse.json({ error: "El número de WhatsApp debe incluir el código de país (ej: +521234567890)" }, { status: 400 });
    }

    // La cuenta es ÚNICA en todo Nesux. Se busca por correo Y por WhatsApp: son
    // los dos datos con los que una persona se identifica, y permitir que repita
    // cualquiera de ellos crearía dos cuentas para el mismo ser humano.
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: email.toLowerCase() }, { whatsappNumber: cleanWhats }] },
      include: { businesses: { select: { businessId: true } } },
    });

    if (existing) {
      // Ya es cliente de Nesux. NO se crea otro usuario ni se toca su contraseña:
      // se le añade a este negocio y entra con las credenciales que ya tiene.
      const { yaPertenecia } = await vincularANegocio(existing.id);
      const porWhatsapp = existing.email !== email.toLowerCase();

      return NextResponse.json({
        success: true,
        alreadyRegistered: true,
        linked: !yaPertenecia,
        clientId: existing.clientId,
        email: existing.email,
        message: yaPertenecia
          ? `Ya estabas inscrito con este ${porWhatsapp ? "número de WhatsApp" : "correo"}. ` +
            `Inicia sesión con tu ID ${existing.clientId ?? "de usuario"} o tu correo ${existing.email}, ` +
            `y la contraseña que ya usas.`
          : `¡Listo! Ya tenías cuenta en Nesux, así que te sumamos a Trading Academy con ella. ` +
            `Entra con tu ID ${existing.clientId ?? "de usuario"} o tu correo ${existing.email}, ` +
            `y la misma contraseña de siempre.`,
      });
    }

    const businessId = await getBusinessId();

    // --- Generar ID y contraseña temporal ALEATORIA ---
    const clientId = await nextClientId(initials);
    const tempPassword = generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    const user = await prisma.user.create({
      data: {
        // businessId = por dónde entró; la pertenencia real va en `businesses`,
        // para que mañana pueda estar también en otro negocio sin duplicarse.
        businessId,
        businesses: { create: { businessId } },
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName,
        whatsappNumber: cleanWhats,
        clientId,
        tempPassword,             // visible para admin hasta el primer cambio de clave
        mustChangePassword: true, // obliga a cambiarla al ingresar
        // La entrega de credenciales por email sirve como verificación del correo.
        emailVerified: new Date(),
      },
    });

    await prisma.lead.create({
      data: {
        businessId,
        email: email.toLowerCase(),
        firstName,
        lastName,
        whatsappNumber: cleanWhats,
        source: "registro",
        status: "registered",
      },
    }).catch(() => {});

    // --- Entrega de credenciales por canales separados ---
    // Contraseña + ID por correo; WhatsApp avisa y nombra el correo destino.
    // Nunca se devuelven al navegador: quien no reciba el correo usa "olvidé mi contraseña".
    await sendNewAccountCredentials({
      email: email.toLowerCase(),
      whatsapp: cleanWhats,
      firstName,
      clientId,
      tempPassword,
    }).catch((e) => console.warn("[signup] envío de credenciales", e));

    return NextResponse.json({ success: true, email: email.toLowerCase() });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Error al crear la cuenta. Intenta nuevamente." }, { status: 500 });
  }
}
