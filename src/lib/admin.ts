import { NextResponse } from "next/server";
import { getSession } from "./auth";
import { db } from "./db";

export async function requireAdmin() {
  const session = await getSession();
  if (!session) return null;

  const user = await db.user.findUnique({ where: { id: session.userId } });
  if (!user || user.role !== "ADMIN") return null;

  return user;
}

export function adminUnauthorized() {
  return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
}
