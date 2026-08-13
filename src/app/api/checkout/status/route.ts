import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

const INFINITEPAY_CHECK = "https://api.checkout.infinitepay.io/payment_check";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Faça login para consultar o pagamento." },
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
  const transactionNsu =
    typeof body?.transactionNsu === "string" ? body.transactionNsu.trim() : "";
  const slug = typeof body?.slug === "string" ? body.slug.trim() : "";

  if (!orderId) {
    return NextResponse.json(
      { error: "Identificador do pedido não informado." },
      { status: 400 },
    );
  }

  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order || order.userId !== session.userId) {
    return NextResponse.json(
      { error: "Pedido não encontrado." },
      { status: 404 },
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

    if (!response.ok) {
      return NextResponse.json(
        { error: "Não foi possível consultar o pagamento." },
        { status: 502 },
      );
    }

    if (data?.paid === true && order.status !== "PAGO") {
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
    }

    return NextResponse.json({
      paid: data?.paid === true,
      captureMethod: data?.capture_method ?? null,
      amount: data?.amount ?? null,
    });
  } catch (error) {
    console.error("Erro ao consultar pagamento:", error);
    return NextResponse.json(
      { error: "Erro de conexão ao consultar o pagamento." },
      { status: 502 },
    );
  }
}
