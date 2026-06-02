import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(req: NextRequest) {
  try {
    const { authOptions } = await import("@/lib/auth-options");
    const { prisma } = await import("@/lib/db");
    
    const session = await getServerSession(authOptions);
    
    let userId: string | undefined;
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({ where: { email: session.user.email } });
      userId = user?.id;
    }

    const courses = await prisma.course.findMany({
      where: { isPublished: true },
      include: { modules: { select: { id: true } } },
    });

    const formattedCourses = courses.map((course) => ({
      id: course.id,
      slug: course.slug,
      title: course.title,
      description: course.description,
      imageUrl: course.imageUrl,
      price: course.price,
      moduleCount: course.modules.length,
      hasAccess: false,
    }));

    return NextResponse.json({ courses: formattedCourses });
  } catch (error) {
    console.error("Error listing courses:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { authOptions } = await import("@/lib/auth-options");
    const { prisma } = await import("@/lib/db");
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { slug, title, description, imageUrl, price } = body;
    if (!slug || !title) {
      return NextResponse.json({ error: "Slug and title are required" }, { status: 400 });
    }

    const course = await prisma.course.create({
      data: { slug, title, description: description || "", imageUrl: imageUrl || null, price: price || 0, isPublished: false },
    });

    return NextResponse.json({ course });
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
