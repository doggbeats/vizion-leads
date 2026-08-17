import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, adminUnauthorized } from "@/lib/admin";

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) return adminUnauthorized();

  const body = await request.json().catch(() => null);
  if (!body || typeof body.id !== "string" || typeof body.featured !== "boolean") {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  try {
    const product = await db.product.update({
      where: { id: body.id },
      data: { featured: body.featured },
    });
    return NextResponse.json({ product });
  } catch {
    return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
  }
}
