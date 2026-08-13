import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { requireAdmin, adminUnauthorized } from "@/lib/admin";

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: RouteProps) {
  if (!(await requireAdmin())) return adminUnauthorized();

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const data: Record<string, unknown> = {};

  if (body.role !== undefined) {
    if (body.role !== "ADMIN" && body.role !== "CLIENT") {
      return NextResponse.json({ error: "Role inválida." }, { status: 400 });
    }
    data.role = body.role;
  }

  if (body.nome !== undefined) {
    const nome = typeof body.nome === "string" ? body.nome.trim() : "";
    if (!nome) {
      return NextResponse.json({ error: "Nome inválido." }, { status: 400 });
    }
    data.nome = nome;
  }

  if (body.telefone !== undefined) {
    data.telefone =
      typeof body.telefone === "string" && body.telefone.trim() !== ""
        ? body.telefone.trim()
        : null;
  }

  if (body.email !== undefined) {
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
    }
    data.email = email;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nenhum dado para atualizar." }, { status: 400 });
  }

  try {
    const user = await db.user.update({
      where: { id },
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
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Este e-mail já está cadastrado." },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });
  }
}

export async function DELETE(_request: Request, { params }: RouteProps) {
  if (!(await requireAdmin())) return adminUnauthorized();

  const { id } = await params;
  const admin = await requireAdmin();

  if (admin && admin.id === id) {
    return NextResponse.json(
      { error: "Você não pode excluir o próprio usuário." },
      { status: 400 },
    );
  }

  try {
    await db.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });
  }
}
