import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, adminUnauthorized } from "@/lib/admin";

const ALLOWED_SIZES = new Set(["PP", "P", "M", "G", "GG", "XG", "U", "38", "40", "42", "44"]);

function parseImages(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map(String).filter(Boolean);
  }
  if (typeof raw === "string") {
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function parseSizes(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map(String).filter((s) => ALLOWED_SIZES.has(s));
  }
  if (typeof raw === "string") {
    return raw
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter((s) => ALLOWED_SIZES.has(s));
  }
  return [];
}

function parseFloatSafe(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value.replace(",", "."));
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

export async function GET() {
  if (!(await requireAdmin())) return adminUnauthorized();

  const products = await db.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return adminUnauthorized();

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const description = typeof body?.description === "string" ? body.description.trim() : "";
  const categorySlug = typeof body?.categorySlug === "string" ? body.categorySlug : "";
  const price = parseFloatSafe(body?.price);
  const promotionalPrice = parseFloatSafe(body?.promotionalPrice);
  const stock = Number.isInteger(body?.stock) ? body.stock : Number(body?.stock);

  if (!name || !description || !categorySlug || price === null) {
    return NextResponse.json(
      { error: "Nome, descrição, categoria e preço são obrigatórios." },
      { status: 400 },
    );
  }

  const images = parseImages(body?.images);
  if (images.length === 0) {
    return NextResponse.json({ error: "Informe ao menos uma imagem." }, { status: 400 });
  }

  try {
    const product = await db.product.create({
      data: {
        name,
        description,
        categorySlug,
        price,
        promotionalPrice,
        subcategory:
          typeof body?.subcategory === "string" && body.subcategory.trim() !== ""
            ? body.subcategory.trim()
            : null,
        images,
        sizes: parseSizes(body?.sizes),
        stock: Number.isFinite(stock) ? stock : 0,
        weight: parseFloatSafe(body?.weight) ?? 0.5,
        width: parseFloatSafe(body?.width) ?? 30,
        height: parseFloatSafe(body?.height) ?? 5,
        length: parseFloatSafe(body?.length) ?? 30,
        featured: body?.featured === true,
        active: body?.active !== false,
      },
    });
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    return NextResponse.json({ error: "Erro ao criar o produto." }, { status: 500 });
  }
}
