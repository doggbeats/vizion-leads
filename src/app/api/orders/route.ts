import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { isWithinFreeDeliveryRadius } from "@/lib/distance";

type OrderItemInput = {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  size: string;
  color?: string | null;
};

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Faça login para finalizar o pedido." },
      { status: 401 },
    );
  }

  const body = await request.json().catch(() => null);
  const customerName =
    typeof body?.customerName === "string" ? body.customerName.trim() : "";
  const customerPhone =
    typeof body?.customerPhone === "string" ? body.customerPhone.trim() : "";
  const customerEmail =
    typeof body?.customerEmail === "string" ? body.customerEmail.trim() : "";
  const cep = typeof body?.cep === "string" && body.cep.trim() !== "" ? body.cep.trim() : null;
  const endereco = typeof body?.endereco === "string" && body.endereco.trim() !== "" ? body.endereco.trim() : null;
  const numero = typeof body?.numero === "string" && body.numero.trim() !== "" ? body.numero.trim() : null;
  const complemento = typeof body?.complemento === "string" && body.complemento.trim() !== "" ? body.complemento.trim() : null;
  const bairro = typeof body?.bairro === "string" && body.bairro.trim() !== "" ? body.bairro.trim() : null;
  const cidade = typeof body?.cidade === "string" && body.cidade.trim() !== "" ? body.cidade.trim() : null;
  const estado = typeof body?.estado === "string" && body.estado.trim() !== "" ? body.estado.trim() : null;
  const retirada = body?.retirada === true;

  const rawItems = Array.isArray(body?.items) ? body.items : [];
  const items: OrderItemInput[] = rawItems
    .map((item: Record<string, unknown>) => {
      const productId =
        typeof item?.productId === "string" ? item.productId.trim() : "";
      const productName =
        typeof item?.productName === "string" ? item.productName.trim() : "";
      const price = Number(item?.price);
      const quantity = Number(item?.quantity);
      const size = typeof item?.size === "string" ? item.size.trim() : "";
      const color = typeof item?.color === "string" && item.color.trim() !== "" ? item.color.trim() : null;
      if (
        !productId ||
        !productName ||
        !Number.isFinite(price) ||
        !Number.isInteger(quantity) ||
        quantity <= 0 ||
        !size
      ) {
        return null;
      }
      return { productId, productName, price, quantity, size, color };
    })
    .filter(
      (item: OrderItemInput | null): item is OrderItemInput => item !== null,
    );

  if (!customerName || !customerPhone) {
    return NextResponse.json(
      { error: "Informe seu nome e telefone para o pedido." },
      { status: 400 },
    );
  }

  if (!retirada) {
    if (!cep || cep.replace(/\D/g, "").length !== 8) {
      return NextResponse.json(
        { error: "Informe um CEP válido." },
        { status: 400 },
      );
    }

    if (!endereco || !numero || !bairro || !cidade || !estado) {
      return NextResponse.json(
        { error: "Informe o endereço completo para a entrega." },
        { status: 400 },
      );
    }
  }

  if (items.length === 0) {
    return NextResponse.json(
      { error: "Seu carrinho está vazio." },
      { status: 400 },
    );
  }

  const productIds = [...new Set(items.map((item) => item.productId))];
  const products = await db.product.findMany({
    where: { id: { in: productIds } },
  });
  const productMap = new Map(products.map((product) => [product.id, product]));

  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product || !product.active) {
      return NextResponse.json(
        { error: `O produto "${item.productName}" não está mais disponível.` },
        { status: 400 },
      );
    }
    if (product.stock < item.quantity) {
      return NextResponse.json(
        {
          error: `Estoque insuficiente para "${product.name}" (tamanho ${item.size}).`,
        },
        { status: 400 },
      );
    }
  }

  const computedItems = items.map((item) => {
    const product = productMap.get(item.productId)!;
    return {
      productId: product.id,
      productName: product.name,
      price: product.promotionalPrice ?? product.price,
      promoQuantity: product.promoQuantity ?? null,
      promoPrice: product.promoPrice ?? null,
      quantity: item.quantity,
      size: item.size,
      color: item.color ?? null,
    };
  });

  let subtotal = 0;

  for (const item of computedItems) {
    if (item.promoQuantity && item.promoQuantity > 1 && item.promoPrice && item.promoPrice > 0) {
      const groups = Math.floor(item.quantity / item.promoQuantity);
      const remaining = item.quantity % item.promoQuantity;
      subtotal += groups * item.promoPrice + remaining * item.price;
    } else {
      subtotal += item.price * item.quantity;
    }
  }

  const cepDigits = cep ? cep.replace(/\D/g, "") : "";
  const dentroRaio = cepDigits.length === 8 ? await isWithinFreeDeliveryRadius(cepDigits) : false;
  const freteGratis = dentroRaio || subtotal >= 200;

  const frete = retirada || freteGratis
    ? 0
    : typeof body?.frete === "number" && Number.isFinite(body.frete)
      ? Math.min(Math.max(0, body.frete), 10000)
      : 0;
  const totalComFrete = subtotal + frete;

  try {
    const order = await db.$transaction(async (tx) => {
      const lastOrder = await tx.order.findFirst({
        orderBy: { orderNumber: "desc" },
        select: { orderNumber: true },
      });
      const nextOrderNumber = (lastOrder?.orderNumber ?? 0) + 1;

      const created = await tx.order.create({
        data: {
          user: { connect: { id: session.userId } },
          orderNumber: nextOrderNumber,
          customerName,
          customerPhone,
          customerEmail: customerEmail || null,
          status: "PENDENTE",
          cep,
          endereco: endereco || null,
          numero: numero || null,
          complemento: complemento || null,
          bairro: bairro || null,
          cidade: cidade || null,
          estado: estado || null,
          frete,
          retirada,
          total: totalComFrete,
          items: {
            create: computedItems.map(
              ({ productId, productName, price, quantity, size, color }) => ({
                productId,
                productName,
                price,
                quantity,
                size,
                color: color ?? null,
              }),
            ),
          },
        },
        include: { items: true },
      });

      for (const item of computedItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return created;
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json(
      { error: "Erro ao finalizar o pedido. Tente novamente.", details: msg },
      { status: 500 },
    );
  }
}
