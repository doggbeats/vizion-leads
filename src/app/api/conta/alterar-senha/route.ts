import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const senhaAtual = typeof body?.senhaAtual === "string" ? body.senhaAtual : "";
  const novaSenha = typeof body?.novaSenha === "string" ? body.novaSenha : "";

  if (!senhaAtual || !novaSenha) {
    return NextResponse.json(
      { error: "Informe a senha atual e a nova senha." },
      { status: 400 },
    );
  }

  if (novaSenha.length < 8) {
    return NextResponse.json(
      { error: "A nova senha deve ter no mínimo 8 caracteres." },
      { status: 400 },
    );
  }

  if (senhaAtual === novaSenha) {
    return NextResponse.json(
      { error: "A nova senha deve ser diferente da atual." },
      { status: 400 },
    );
  }

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { id: true, senha: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }

  const senhaValida = await bcrypt.compare(senhaAtual, user.senha);
  if (!senhaValida) {
    return NextResponse.json(
      { error: "A senha atual está incorreta." },
      { status: 401 },
    );
  }

  const novaSenhaHash = await bcrypt.hash(novaSenha, 10);
  await db.user.update({
    where: { id: user.id },
    data: { senha: novaSenhaHash },
  });

  return NextResponse.json({ ok: true, mensagem: "Senha alterada com sucesso." });
}
