import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, adminUnauthorized } from "@/lib/admin";

const STATUSES = ["PENDENTE", "PAGO", "EM_PRODUCAO", "ENVIADO", "ENTREGUE", "CANCELADO"];

export async function GET() {
  if (!(await requireAdmin())) return adminUnauthorized();

  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
      user: { select: { id: true, nome: true, email: true, telefone: true } },
    },
  });

  return NextResponse.json({ orders });
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return adminUnauthorized();

  const body = await request.json().catch(() => null);
  const customerName =
    typeof body?.customerName === "string" ? body.customerName.trim() : "";
  const customerPhone =
    typeof body?.customerPhone === "string" ? body.customerPhone.trim() : "";
  const customerEmail =
    typeof body?.customerEmail === "string" ? body.customerEmail.trim() : "";
  const notes = typeof body?.notes === "string" ? body.notes.trim() : "";
  const status = STATUSES.includes(body?.status) ? body.status : "PENDENTE";

  const cep = typeof body?.cep === "string" ? body.cep.trim() : "";
  const endereco = typeof body?.endereco === "string" ? body.endereco.trim() : "";
  const numero = typeof body?.numero === "string" ? body.numero.trim() : "";
  const complemento = typeof body?.complemento === "string" ? body.complemento.trim() : "";
  const bairro = typeof body?.bairro === "string" ? body.bairro.trim() : "";
  const cidade = typeof body?.cidade === "string" ? body.cidade.trim() : "";
  const estado = typeof body?.estado === "string" ? body.estado.trim() : "";

  const rawItems = Array.isArray(body?.items) ? body.items : [];
  const items = rawItems
    .map((item: Record<string, unknown>) => {
      const productName = typeof item?.productName === "string" ? item.productName.trim() : "";
      const price = Number(item?.price);
      const quantity = Number(item?.quantity);
      const size = typeof item?.size === "string" ? item.size : "";
      if (!productName || !Number.isFinite(price) || !Number.isInteger(quantity) || quantity <= 0) {
        return null;
      }
      return {
        productId: typeof item?.productId === "string" ? item.productId : null,
        productName,
        price,
        quantity,
        size,
      };
    })
    .filter((item: unknown): item is NonNullable<typeof item> => item !== null);

  if (!customerName || !customerPhone) {
    return NextResponse.json(
      { error: "Nome e telefone do cliente são obrigatórios." },
      { status: 400 },
    );
  }

  if (items.length === 0) {
    return NextResponse.json(
      { error: "Adicione ao menos um item ao pedido." },
      { status: 400 },
    );
  }

  const total = items.reduce(
    (sum: number, item: { price: number; quantity: number }) =>
      sum + item.price * item.quantity,
    0,
  );

  const userId =
    typeof body?.userId === "string" && body.userId.trim() !== "" ? body.userId : null;

  try {
    const lastOrder = await db.order.findFirst({
      orderBy: { orderNumber: "desc" },
      select: { orderNumber: true },
    });
    const nextOrderNumber = (lastOrder?.orderNumber ?? 0) + 1;

    const order = await db.order.create({
      data: {
        userId,
        orderNumber: nextOrderNumber,
        customerName,
        customerPhone,
        customerEmail: customerEmail || null,
        status,
        notes: notes || null,
        cep: cep || null,
        endereco: endereco || null,
        numero: numero || null,
        complemento: complemento || null,
        bairro: bairro || null,
        cidade: cidade || null,
        estado: estado || null,
        total,
        items: { create: items },
      },
      include: {
        items: true,
        user: { select: { id: true, nome: true, email: true } },
      },
    });
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    return NextResponse.json({ error: "Erro ao criar o pedido." }, { status: 500 });
  }
}
