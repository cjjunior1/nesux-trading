import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { parseFullName, generateTempPassword, nextClientId } from "@/lib/account";
import { sendNewAccountCredentials } from "@/lib/notify";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Acepta el nuevo campo "fullName"; con compatibilidad si llegan firstName/lastName.
    const fullName: string = body.fullName || [body.firstName, body.lastName].filter(Boolean).join(" ");
    const email: string = (body.email || "").trim();
    const whatsappNumber: string = (body.whatsappNumber || "").trim();

    // --- Validaciones ---
    const parsed = parseFullName(fullName);
    if (!parsed) {
      return NextResponse.json(
        { error: "Por favor, ingresa tu nombre y apellido completos. Necesitamos ambos para generar tu ID de usuario." },
        { status: 400 }
      );
    }
    const { firstName, lastName, initials } = parsed;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "El formato del email no es válido" }, { status: 400 });
    }
    const cleanWhats = whatsappNumber.replace(/[\s-]/g, "");
    if (!/^\+?[1-9]\d{7,14}$/.test(cleanWhats)) {
      return NextResponse.json({ error: "El número de WhatsApp debe incluir el código de país (ej: +521234567890)" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return NextResponse.json({ error: "Ya existe una cuenta con este email" }, { status: 400 });
    }

    // --- Generar ID y contraseña temporal ALEATORIA ---
    const clientId = await nextClientId(initials);
    const tempPassword = generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    const user = await prisma.user.create({
      data: {
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
