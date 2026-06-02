import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export const dynamic = "force-dynamic";

function generatePassword(): string {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, firstName, lastName, whatsappNumber } = body;

    if (!email || !firstName || !lastName || !whatsappNumber) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios: nombre, apellido, email y WhatsApp" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "El formato del email no es válido" },
        { status: 400 }
      );
    }

    const whatsappRegex = /^\+?[1-9]\d{7,14}$/;
    if (!whatsappRegex.test(whatsappNumber.replace(/[\s-]/g, ""))) {
      return NextResponse.json(
        { error: "El número de WhatsApp debe tener formato internacional (ej: +521234567890)" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con este email" },
        { status: 400 }
      );
    }

    const generatedPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(generatedPassword, 12);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName,
        whatsappNumber: whatsappNumber.replace(/[\s-]/g, ""),
        verificationToken,
        tokenExpiry,
      },
    });

    await prisma.lead.create({
      data: {
        email: email.toLowerCase(),
        firstName,
        lastName,
        whatsappNumber: whatsappNumber.replace(/[\s-]/g, ""),
        source: "registro",
        status: "registered",
      },
    });

    const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const verificationLink = `${appUrl}/verify-email?token=${verificationToken}`;
    const appName = "Trading Academy";

    const htmlBody = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(90deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">¡Bienvenido a Trading Academy!</h1>
        </div>
        <div style="padding: 40px; color: #e2e8f0;">
          <p style="font-size: 18px; margin-bottom: 20px;">Hola <strong style="color: #10b981;">${firstName}</strong>,</p>
          <p style="font-size: 16px; line-height: 1.6;">Gracias por registrarte en Trading Academy. Estás a un paso de comenzar tu camino hacia la libertad financiera.</p>
          <p style="font-size: 16px; line-height: 1.6;">Por favor, verifica tu email haciendo clic en el siguiente botón:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="background: linear-gradient(90deg, #10b981 0%, #059669 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Verificar Email</a>
          </div>
          <div style="background: rgba(16, 185, 129, 0.1); border-left: 4px solid #10b981; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #fbbf24;"><strong>📱 Tu contraseña será enviada por WhatsApp</strong></p>
            <p style="margin: 10px 0 0; font-size: 14px;">Una vez verificado tu email, recibirás tu contraseña de acceso al número: <strong>${whatsappNumber}</strong></p>
          </div>
          <p style="font-size: 14px; color: #94a3b8;">Este enlace expira en 24 horas. Si no solicitaste esta cuenta, ignora este mensaje.</p>
        </div>
        <div style="background: #0f172a; padding: 20px; text-align: center; border-top: 1px solid #334155;">
          <p style="color: #64748b; font-size: 12px; margin: 0;">© 2026 Trading Academy - Tu camino hacia la libertad financiera</p>
        </div>
      </div>
    `;

    try {
      await fetch("https://apps.abacus.ai/api/sendNotificationEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deployment_token: process.env.ABACUSAI_API_KEY,
          app_id: process.env.WEB_APP_ID,
          notification_id: process.env.NOTIF_ID_VERIFICACIN_DE_EMAIL,
          subject: "Verifica tu email - Trading Academy",
          body: htmlBody,
          is_html: true,
          recipient_email: email.toLowerCase(),
          sender_email: `noreply@${new URL(appUrl).hostname}`,
          sender_alias: appName,
        }),
      });
    } catch (emailError) {
      console.error("Error sending verification email:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "Registro exitoso. Revisa tu email para verificar tu cuenta.",
      userId: user.id,
      tempPassword: generatedPassword,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Error al crear la cuenta. Intenta nuevamente." },
      { status: 500 }
    );
  }
}
