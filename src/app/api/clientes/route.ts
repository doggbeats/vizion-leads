import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const nome = typeof body?.nome === "string" ? body.nome.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const telefone = typeof body?.telefone === "string" ? body.telefone.trim() : "";
  const senha = typeof body?.senha === "string" ? body.senha : "";

  if (!nome || !email || !senha) {
    return NextResponse.json(
      { error: "Nome, e-mail e senha são obrigatórios." },
      { status: 400 },
    );
  }

  if (senha.length < 6) {
    return NextResponse.json(
      { error: "A senha deve ter no mínimo 6 caracteres." },
      { status: 400 },
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
  }

  const senhaHash = await bcrypt.hash(senha, 10);

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const role = adminEmail && email === adminEmail ? "ADMIN" : "CLIENT";

  try {
    const user = await db.user.create({
      data: { nome, email, telefone, senha: senhaHash, role },
    });

    await createSession({ userId: user.id, email: user.email, role: user.role });

    return NextResponse.json(
      { user: { id: user.id, nome: user.nome, email: user.email, telefone: user.telefone, role: user.role } },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: "Este e-mail já está cadastrado." },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Erro ao criar o cadastro." },
      { status: 500 },
    );
  }
}
