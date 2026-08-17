import { NextResponse } from "next/server";
import { randomInt } from "node:crypto";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const identificador =
    typeof body?.identificador === "string" ? body.identificador.trim() : "";

  if (!identificador) {
    return NextResponse.json(
      { error: "Informe seu e-mail ou WhatsApp cadastrado." },
      { status: 400 },
    );
  }

  const digitos = identificador.replace(/\D/g, "");
  const isPhone = digitos.length >= 10;
  const email = !isPhone ? identificador.toLowerCase() : "";

  const user = await db.user.findFirst({
    where: isPhone ? { telefone: { contains: digitos } } : { email },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Nenhuma conta encontrada com essas informações." },
      { status: 404 },
    );
  }

  const codigo = String(randomInt(100000, 1000000));
  const tokenHash = await bcrypt.hash(codigo, 10);

  await db.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    },
  });

  return NextResponse.json({
    ok: true,
    codigo,
    mensagem: `Código gerado para ${
      isPhone ? `o WhatsApp ${identificador}` : `o e-mail ${email}`
    }. Anote o código abaixo e use para redefinir sua senha.`,
  });
}
