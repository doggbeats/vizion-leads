import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, adminUnauthorized } from "@/lib/admin";

const STATUSES = ["PENDENTE", "PAGO", "ENVIADO", "ENTREGUE", "CANCELADO"];

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
  if (typeof body.customerName === "string" && body.customerName.trim() !== "") {
    data.customerName = body.customerName.trim();
  }
  if (typeof body.customerPhone === "string" && body.customerPhone.trim() !== "") {
    data.customerPhone = body.customerPhone.trim();
  }
  if (body.customerEmail !== undefined) {
    data.customerEmail =
      typeof body.customerEmail === "string" && body.customerEmail.trim() !== ""
        ? body.customerEmail.trim()
        : null;
  }
  if (body.notes !== undefined) {
    data.notes = typeof body.notes === "string" && body.notes.trim() !== "" ? body.notes.trim() : null;
  }
  if (STATUSES.includes(body.status)) data.status = body.status;

  if (body.documentoTipo === "CPF" || body.documentoTipo === "CNPJ") {
    data.documentoTipo = body.documentoTipo;
  }
  if (body.documento !== undefined) {
    data.documento =
      typeof body.documento === "string" && body.documento.trim() !== ""
        ? body.documento.replace(/\D/g, "")
        : null;
  }

  const addressFields = ["cep"];
  for (const field of addressFields) {
    if (body[field] !== undefined) {
      data[field] =
        typeof body[field] === "string" && body[field].trim() !== ""
          ? body[field].trim()
          : null;
    }
  }

  try {
    const order = await db.order.update({
      where: { id },
      data,
      include: {
        items: true,
        user: { select: { id: true, nome: true, email: true, telefone: true } },
      },
    });
    return NextResponse.json({ order });
  } catch {
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  }
}

export async function DELETE(_request: Request, { params }: RouteProps) {
  if (!(await requireAdmin())) return adminUnauthorized();

  const { id } = await params;
  try {
    await db.order.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  }
}
