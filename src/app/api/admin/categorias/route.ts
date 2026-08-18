import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, adminUnauthorized } from "@/lib/admin";

export async function GET() {
  if (!(await requireAdmin())) return adminUnauthorized();

  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ categories });
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) return adminUnauthorized();

  const body = await request.json().catch(() => null);
  if (!body || typeof body.slug !== "string" || typeof body.image !== "string") {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  try {
    const category = await db.category.update({
      where: { slug: body.slug },
      data: { image: body.image },
    });
    return NextResponse.json({ category });
  } catch {
    return NextResponse.json(
      { error: "Categoria não encontrada." },
      { status: 404 },
    );
  }
}
