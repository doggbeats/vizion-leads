import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const INFINITEPAY_CHECK = "https://api.checkout.infinitepay.io/payment_check";

const INFINITEPAY_IPS = [
  "18.228.0.0/12",
  "18.230.0.0/12",
  "13.34.0.0/14",
  "15.160.0.0/13",
];

function isAllowedIP(ip: string): boolean {
  for (const cidr of INFINITEPAY_IPS) {
    const [network, bits] = cidr.split("/");
    const mask = ~(2 ** (32 - Number(bits)) - 1);
    const ipNum = ipToNum(ip);
    const netNum = ipToNum(network);
    if ((ipNum & mask) === (netNum & mask)) return true;
  }
  return false;
}

function ipToNum(ip: string): number {
  return ip.split(".").reduce((acc, octet) => (acc << 8) + Number(octet), 0) >>> 0;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export async function POST(request: Request) {
  const webhookSecret = process.env.INFINITEPAY_WEBHOOK_SECRET?.trim();
  
  if (!webhookSecret) {
    console.error("INFINITEPAY_WEBHOOK_SECRET não configurado");
    return NextResponse.json({ error: "Configuração inválida" }, { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const token = authHeader.slice(7);
  if (!timingSafeEqual(token, webhookSecret)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const forwarded = request.headers.get("x-forwarded-for");
  const clientIP = forwarded?.split(",")[0]?.trim() || "0.0.0.0";
  
  if (!isAllowedIP(clientIP)) {
    console.warn(`Webhook rejeitado de IP não autorizado: ${clientIP}`);
    return NextResponse.json({ error: "IP não autorizado" }, { status: 403 });
  }

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

    const transaction = data.transaction_nsu ?? transactionNsu ?? "-";
    const receiptUrl =
      typeof data.receipt_url === "string" && data.receipt_url
        ? ` Comprovante: ${data.receipt_url}`
        : "";

    if (order.status === "PAGO") {
      return NextResponse.json({ ok: true, already: true });
    }

    await db.order.update({
      where: { id: order.id },
      data: {
        status: "PAGO",
        notes: `Pagamento confirmado via InfinitPay (${paymentMethod}). Transação: ${transaction}.${receiptUrl}`,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro no webhook InfinitPay:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 400 });
  }
}
