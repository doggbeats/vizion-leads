import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const SERVICES = "1,2,3,4,17";

export async function POST(request: Request) {
  const token = process.env.MELHORENVIO_TOKEN?.trim();
  const fromCep = process.env.MELHORENVIO_FROM_CEP?.trim();
  const apiUrl = process.env.MELHORENVIO_API_URL?.trim() || "https://melhorenvio.com.br";
  const userAgent =
    process.env.MELHORENVIO_USER_AGENT?.trim() || "Vizion Leads (contato@vizion.com)";

  if (!token || !fromCep) {
    return NextResponse.json(
      { error: "Cálculo de frete ainda não configurado." },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => null);
  const cep = typeof body?.cep === "string" ? body.cep.replace(/\D/g, "") : "";

  if (cep.length !== 8) {
    return NextResponse.json({ error: "Informe um CEP válido." }, { status: 400 });
  }

  const rawItems = Array.isArray(body?.items) ? body.items : [];
  const quantityByProduct = new Map<string, number>();
  for (const item of rawItems) {
    const productId = typeof item?.productId === "string" ? item.productId.trim() : "";
    const quantity = Number(item?.quantity);
    if (!productId || !Number.isInteger(quantity) || quantity <= 0) continue;
    quantityByProduct.set(
      productId,
      (quantityByProduct.get(productId) ?? 0) + quantity,
    );
  }

  if (quantityByProduct.size === 0) {
    return NextResponse.json(
      { error: "Seu carrinho está vazio." },
      { status: 400 },
    );
  }

  const productIds = [...quantityByProduct.keys()];
  const products = await db.product.findMany({ where: { id: { in: productIds } } });

  const payloadProducts = products.map((product) => {
    const quantity = quantityByProduct.get(product.id) ?? 1;
    return {
      id: product.id,
      width: product.width,
      height: product.height,
      length: product.length,
      weight: product.weight,
      insurance_value: product.promotionalPrice ?? product.price,
      quantity,
    };
  });

  try {
    const response = await fetch(`${apiUrl}/api/v2/me/shipment/calculate`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "User-Agent": userAgent,
      },
      body: JSON.stringify({
        from: { postal_code: fromCep },
        to: { postal_code: cep },
        products: payloadProducts,
        options: { receipt: false, own_hand: false },
        services: SERVICES,
      }),
      cache: "no-store",
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      console.error("Erro MelhorEnvio:", response.status, data);
      return NextResponse.json(
        { error: "Não foi possível calcular o frete. Tente novamente." },
        { status: 502 },
      );
    }

    const options = Array.isArray(data)
      ? data
          .filter(
            (option) =>
              option &&
              Number(option.price) > 0 &&
              typeof option.name === "string",
          )
          .map((option) => ({
            id: option.id,
            name: option.name,
            price: Number(option.price),
            deliveryTime: Number(option.custom_delivery_time ?? option.delivery_time ?? 0),
            deliveryRange: option.custom_delivery_range ?? option.delivery_range ?? null,
            company: option.company?.name ?? "",
          }))
          .sort((a, b) => a.price - b.price)
      : [];

    if (options.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma opção de frete encontrada para este CEP." },
        { status: 404 },
      );
    }

    return NextResponse.json({ options });
  } catch (error) {
    console.error("Erro ao calcular frete:", error);
    return NextResponse.json(
      { error: "Erro de conexão ao calcular o frete." },
      { status: 502 },
    );
  }
}
