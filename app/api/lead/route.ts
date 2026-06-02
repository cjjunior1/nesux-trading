import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, firstName, lastName, whatsappNumber, source } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email es requerido" },
        { status: 400 }
      );
    }

    const lead = await prisma.lead.create({
      data: {
        email: email.toLowerCase(),
        firstName: firstName || null,
        lastName: lastName || null,
        whatsappNumber: whatsappNumber || null,
        source: source || "website",
        status: "new",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Gracias por tu interés. Te contactaremos pronto.",
      leadId: lead.id,
    });
  } catch (error) {
    console.error("Lead capture error:", error);
    return NextResponse.json(
      { error: "Error al registrar tu información" },
      { status: 500 }
    );
  }
}
