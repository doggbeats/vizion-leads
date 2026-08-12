import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, adminUnauthorized } from "@/lib/admin";

export async function GET() {
  if (!(await requireAdmin())) return adminUnauthorized();

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      nome: true,
      email: true,
      telefone: true,
      role: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
  });

  return NextResponse.json({ users });
}
