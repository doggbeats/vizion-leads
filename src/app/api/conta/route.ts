import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      nome: true,
      email: true,
      telefone: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }

  return NextResponse.json({ user });
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const data: Record<string, unknown> = {};

  if (body.nome !== undefined) {
    const nome = typeof body.nome === "string" ? body.nome.trim() : "";
    if (!nome) {
      return NextResponse.json({ error: "Nome inválido." }, { status: 400 });
    }
    data.nome = nome;
  }

  if (body.email !== undefined) {
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
    }
    data.email = email;
  }

  if (body.telefone !== undefined) {
    data.telefone =
      typeof body.telefone === "string" && body.telefone.trim() !== ""
        ? body.telefone.trim()
        : null;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nenhum dado para atualizar." }, { status: 400 });
  }

  try {
    const user = await db.user.update({
      where: { id: session.userId },
      data,
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        role: true,
      },
    });
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json(
      { error: "Este e-mail já está em uso." },
      { status: 409 },
    );
  }
}
