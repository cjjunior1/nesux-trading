import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function POST(req: NextRequest) {
  try {
    const { authOptions } = await import("@/lib/auth-options");
    const { prisma } = await import("@/lib/db");
    
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { lessonId, completed } = body;

    if (!lessonId) {
      return NextResponse.json({ error: "Lesson ID required" }, { status: 400 });
    }

    const progress = await prisma.userProgress.upsert({
      where: { userId_lessonId: { userId: user.id, lessonId: lessonId } },
      update: { completed: completed, completedAt: completed ? new Date() : null },
      create: { userId: user.id, lessonId: lessonId, completed: completed, completedAt: completed ? new Date() : null },
    });

    return NextResponse.json({ success: true, progress });
  } catch (error) {
    console.error("Error updating progress:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { authOptions } = await import("@/lib/auth-options");
    const { prisma } = await import("@/lib/db");
    
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json({ error: "Course ID required" }, { status: 400 });
    }

    const progress = await prisma.userProgress.findMany({
      where: { userId: user.id, lesson: { module: { courseId: courseId } } },
      include: { lesson: { include: { module: true } } },
    });

    return NextResponse.json({ progress });
  } catch (error) {
    console.error("Error getting progress:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
