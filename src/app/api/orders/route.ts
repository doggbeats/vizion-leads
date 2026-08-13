import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

type OrderItemInput = {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  size: string;
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
  const cep = typeof body?.cep === "string" ? body.cep.trim() : "";
  const endereco = typeof body?.endereco === "string" ? body.endereco.trim() : "";
  const numero = typeof body?.numero === "string" ? body.numero.trim() : "";
  const complemento = typeof body?.complemento === "string" ? body.complemento.trim() : "";
  const bairro = typeof body?.bairro === "string" ? body.bairro.trim() : "";
  const cidade = typeof body?.cidade === "string" ? body.cidade.trim() : "";
  const estado = typeof body?.estado === "string" ? body.estado.trim() : "";
  const documento = typeof body?.documento === "string" ? body.documento.trim() : "";
  const documentoTipo = body?.documentoTipo === "CNPJ" ? "CNPJ" : "CPF";
  const documentoDigits = documento.replace(/\D/g, "");

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
      return { productId, productName, price, quantity, size };
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

  if (cep.replace(/\D/g, "").length !== 8) {
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

  if (
    (documentoTipo === "CPF" && documentoDigits.length !== 11) ||
    (documentoTipo === "CNPJ" && documentoDigits.length !== 14)
  ) {
    return NextResponse.json(
      { error: `Informe um ${documentoTipo} válido para a nota fiscal.` },
      { status: 400 },
    );
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
      quantity: item.quantity,
      size: item.size,
    };
  });

  const total = computedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const frete =
    typeof body?.frete === "number" && Number.isFinite(body.frete)
      ? Math.min(Math.max(0, body.frete), 10000)
      : 0;
  const totalComFrete = total + frete;

  try {
    const order = await db.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId: session.userId,
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
          documento: documentoDigits,
          documentoTipo,
          frete,
          total: totalComFrete,
          items: {
            create: computedItems.map(
              ({ productId, productName, price, quantity, size }) => ({
                productId,
                productName,
                price,
                quantity,
                size,
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
    return NextResponse.json(
      { error: "Erro ao finalizar o pedido. Tente novamente." },
      { status: 500 },
    );
  }
}
