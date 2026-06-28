import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { parseFullName, generateTempPassword, nextClientId } from "@/lib/account";

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

    // --- Email con ID + contraseña temporal ---
    const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const appName = "Trading Academy";
    const htmlBody = `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:linear-gradient(135deg,#0f172a,#1e293b);border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(90deg,#10b981,#059669);padding:30px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:26px;">¡Bienvenido a Trading Academy!</h1>
        </div>
        <div style="padding:36px;color:#e2e8f0;">
          <p style="font-size:18px;">Hola <strong style="color:#10b981;">${firstName}</strong>,</p>
          <p style="font-size:15px;line-height:1.6;">Tu cuenta fue creada. Estos son tus accesos:</p>
          <div style="background:rgba(16,185,129,.1);border-left:4px solid #10b981;padding:18px;border-radius:8px;margin:18px 0;">
            <p style="margin:0 0 8px;font-size:15px;">🆔 <strong>Tu ID de usuario:</strong> <span style="color:#10b981;font-weight:bold;font-size:18px;">${clientId}</span></p>
            <p style="margin:0;font-size:15px;">🔑 <strong>Contraseña temporal:</strong> <span style="color:#fbbf24;font-weight:bold;font-size:18px;">${tempPassword}</span></p>
          </div>
          <p style="font-size:14px;line-height:1.6;">Ingresa con tu <strong>email o tu ID</strong> y esta contraseña en
            <a href="${appUrl}/login" style="color:#10b981;">${appUrl}/login</a>.</p>
          <p style="font-size:13px;color:#fbbf24;">⚠️ Por seguridad, deberás cambiar tu contraseña al iniciar sesión.</p>
        </div>
        <div style="background:#0f172a;padding:18px;text-align:center;border-top:1px solid #334155;">
          <p style="color:#64748b;font-size:12px;margin:0;">© 2026 Trading Academy</p>
        </div>
      </div>`;

    try {
      await fetch("https://apps.abacus.ai/api/sendNotificationEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deployment_token: process.env.ABACUSAI_API_KEY,
          app_id: process.env.WEB_APP_ID,
          notification_id: process.env.NOTIF_ID_VERIFICACIN_DE_EMAIL,
          subject: "Tus accesos - Trading Academy",
          body: htmlBody,
          is_html: true,
          recipient_email: email.toLowerCase(),
          sender_email: `noreply@${new URL(appUrl).hostname}`,
          sender_alias: appName,
        }),
      });
    } catch (emailError) {
      console.error("Error enviando email de credenciales:", emailError);
    }

    // Mostramos ID + contraseña temporal en pantalla (interino: aún no hay
    // entrega real por email/WhatsApp). Cuando esos canales funcionen, se ocultan.
    return NextResponse.json({ success: true, clientId, tempPassword });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Error al crear la cuenta. Intenta nuevamente." }, { status: 500 });
  }
}
