import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Token de verificación no proporcionado" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { verificationToken: token },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Token de verificación inválido" },
        { status: 400 }
      );
    }

    if (user.tokenExpiry && user.tokenExpiry < new Date()) {
      return NextResponse.json(
        { error: "El token de verificación ha expirado" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null,
        tokenExpiry: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Email verificado exitosamente",
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Error al verificar el email" },
      { status: 500 }
    );
  }
}
