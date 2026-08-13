import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

const INFINITEPAY_API = "https://api.checkout.infinitepay.io/links";

function toCents(value: number): number {
  return Math.round(value * 100);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Faça login para continuar o pagamento." },
      { status: 401 },
    );
  }

  const handle = process.env.INFINITEPAY_HANDLE?.trim();
  if (!handle) {
    return NextResponse.json(
      { error: "Pagamento por InfinitPay ainda não configurado." },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => null);
  const orderId = typeof body?.orderId === "string" ? body.orderId.trim() : "";

  if (!orderId) {
    return NextResponse.json(
      { error: "Identificador do pedido não informado." },
      { status: 400 },
    );
  }

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order || order.userId !== session.userId) {
    return NextResponse.json(
      { error: "Pedido não encontrado." },
      { status: 404 },
    );
  }

  if (order.status === "PAGO") {
    return NextResponse.json(
      { error: "Este pedido já foi pago." },
      { status: 400 },
    );
  }

  if (order.items.length === 0) {
    return NextResponse.json(
      { error: "Pedido sem itens." },
      { status: 400 },
    );
  }

  const origin = new URL(request.url).origin;

  const payload = {
    handle,
    order_nsu: order.id,
    redirect_url: `${origin}/carrinho/pagamento/status?pedido=${order.id}`,
    webhook_url: `${origin}/api/webhooks/infinitepay`,
    customer: {
      name: order.customerName,
      email: order.customerEmail ?? undefined,
      phone_number: order.customerPhone
        ? `+55${order.customerPhone.replace(/\D/g, "")}`
        : undefined,
    },
    address: {
      cep: order.cep?.replace(/\D/g, "") ?? "",
      street: order.endereco ?? "",
      neighborhood: order.bairro ?? "",
      number: order.numero ?? "",
      complement: order.complemento ?? "",
    },
    items: order.items.map((item) => ({
      quantity: item.quantity,
      price: toCents(item.price),
      description: `${item.productName}${item.size ? ` - Tam ${item.size}` : ""}`,
    })),
  };

  try {
    const response = await fetch(INFINITEPAY_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || !data?.url) {
      console.error("Erro InfinitPay:", response.status, data);
      return NextResponse.json(
        { error: "Não foi possível gerar o link de pagamento. Tente novamente." },
        { status: 502 },
      );
    }

    return NextResponse.json({ url: data.url });
  } catch (error) {
    console.error("Erro ao gerar checkout:", error);
    return NextResponse.json(
      { error: "Erro de conexão ao gerar o pagamento. Tente novamente." },
      { status: 502 },
    );
  }
}
