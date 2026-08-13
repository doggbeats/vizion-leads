import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const INFINITEPAY_CHECK = "https://api.checkout.infinitepay.io/payment_check";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const orderId =
    typeof body?.order_nsu === "string" ? body.order_nsu.trim() : "";
  const transactionNsu =
    typeof body?.transaction_nsu === "string" ? body.transaction_nsu.trim() : "";
  const slug =
    typeof body?.invoice_slug === "string" ? body.invoice_slug.trim() : "";
  const amount = Number(body?.amount);

  if (!orderId) {
    return NextResponse.json({ error: "order_nsu ausente" }, { status: 400 });
  }

  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) {
    return NextResponse.json({ error: "Pedido não encontrado" }, { status: 400 });
  }

  const handle = process.env.INFINITEPAY_HANDLE?.trim();
  if (!handle) {
    return NextResponse.json(
      { error: "InfinitPay não configurado" },
      { status: 503 },
    );
  }

  try {
    const response = await fetch(INFINITEPAY_CHECK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        handle,
        order_nsu: order.id,
        transaction_nsu: transactionNsu || undefined,
        slug: slug || undefined,
      }),
      cache: "no-store",
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || data?.paid !== true) {
      return NextResponse.json({ error: "Pagamento não confirmado" }, { status: 400 });
    }

    if (Number.isFinite(amount) && Math.round(amount) !== Math.round(order.total * 100)) {
      return NextResponse.json({ error: "Valor divergente" }, { status: 400 });
    }

    const paymentMethod =
      data.capture_method === "pix"
        ? "PIX"
        : data.capture_method === "credit_card"
          ? "Cartão de crédito"
          : data.capture_method === "debit_card"
            ? "Cartão de débito"
            : data.capture_method ?? "";

    await db.order.update({
      where: { id: order.id },
      data: {
        status: "PAGO",
        notes: `Pagamento confirmado via InfinitPay (${paymentMethod}). Transação: ${data.transaction_nsu ?? transactionNsu ?? "-"}`,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro no webhook InfinitPay:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 400 });
  }
}
