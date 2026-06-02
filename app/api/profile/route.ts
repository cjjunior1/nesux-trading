import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";

import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WHATSAPP_REGEX = /^\+?[1-9]\d{7,14}$/;
const MIN_PASSWORD_LENGTH = 8;

type ProfilePayload = {
  name?: string;
  email?: string;
  whatsapp?: string;
  password?: string;
  confirmPassword?: string;
  username?: string;
};

function parseName(fullName: string) {
  const cleanedName = fullName.trim().replace(/\s+/g, " ");
  const [firstName = "", ...lastNameParts] = cleanedName.split(" ");

  return {
    firstName,
    lastName: lastNameParts.join(" "),
  };
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email.toLowerCase() },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        whatsappNumber: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      profile: {
        name: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        whatsapp: user.whatsappNumber,
        username: null,
      },
    });
  } catch (error) {
    console.error("GET /api/profile error:", error);
    return NextResponse.json(
      { error: "No se pudo cargar el perfil" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = (await request.json()) as ProfilePayload;

    const name = (body.name ?? "").trim();
    const email = (body.email ?? "").trim().toLowerCase();
    const whatsapp = (body.whatsapp ?? "").trim();
    const password = body.password ?? "";
    const confirmPassword = body.confirmPassword ?? "";

    if (!name || !email || !whatsapp) {
      return NextResponse.json(
        { error: "Nombre, email y WhatsApp son obligatorios" },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: "El formato del email no es válido" },
        { status: 400 }
      );
    }

    const normalizedWhatsapp = whatsapp.replace(/[\s()-]/g, "");
    if (!WHATSAPP_REGEX.test(normalizedWhatsapp)) {
      return NextResponse.json(
        {
          error:
            "El número de WhatsApp debe tener formato internacional (ej: +521234567890)",
        },
        { status: 400 }
      );
    }

    const wantsPasswordChange = password.length > 0 || confirmPassword.length > 0;

    if (wantsPasswordChange) {
      if (password.length < MIN_PASSWORD_LENGTH) {
        return NextResponse.json(
          {
            error: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`,
          },
          { status: 400 }
        );
      }

      if (password !== confirmPassword) {
        return NextResponse.json(
          { error: "La confirmación de contraseña no coincide" },
          { status: 400 }
        );
      }
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email.toLowerCase() },
      select: { id: true, email: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    if (email !== currentUser.email) {
      const userWithEmail = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });

      if (userWithEmail && userWithEmail.id !== currentUser.id) {
        return NextResponse.json(
          { error: "El email ya está en uso por otro usuario" },
          { status: 409 }
        );
      }
    }

    const { firstName, lastName } = parseName(name);

    const updateData: {
      firstName: string;
      lastName: string;
      email: string;
      whatsappNumber: string;
      password?: string;
    } = {
      firstName,
      lastName,
      email,
      whatsappNumber: normalizedWhatsapp,
    };

    if (wantsPasswordChange) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    await prisma.user.update({
      where: { id: currentUser.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: wantsPasswordChange
        ? "Perfil y contraseña actualizados correctamente"
        : "Perfil actualizado correctamente",
    });
  } catch (error) {
    console.error("POST /api/profile error:", error);
    return NextResponse.json(
      { error: "No se pudo actualizar el perfil" },
      { status: 500 }
    );
  }
}
