import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const codigo = typeof body?.codigo === "string" ? body.codigo.trim() : "";
  const novaSenha = typeof body?.novaSenha === "string" ? body.novaSenha : "";

  if (!codigo) {
    return NextResponse.json({ error: "Informe o código de recuperação." }, { status: 400 });
  }

  if (novaSenha.length < 8) {
    return NextResponse.json(
      { error: "A nova senha deve ter no mínimo 8 caracteres." },
      { status: 400 },
    );
  }

  const tokens = await db.passwordResetToken.findMany({
    where: { used: false, expiresAt: { gt: new Date() } },
    select: { id: true, userId: true, tokenHash: true },
  });

  let match: { id: string; userId: string } | null = null;
  for (const token of tokens) {
    const ok = await bcrypt.compare(codigo, token.tokenHash);
    if (ok) {
      match = token;
      break;
    }
  }

  if (!match) {
    return NextResponse.json(
      { error: "Código inválido ou expirado. Solicite um novo código." },
      { status: 400 },
    );
  }

  const senhaHash = await bcrypt.hash(novaSenha, 10);

  await db.$transaction([
    db.user.update({ where: { id: match.userId }, data: { senha: senhaHash } }),
    db.passwordResetToken.update({ where: { id: match.id }, data: { used: true } }),
  ]);

  return NextResponse.json({ ok: true });
}
