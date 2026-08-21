import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, adminUnauthorized } from "@/lib/admin";

const ALLOWED_SIZES = new Set(["PP", "P", "M", "G", "GG", "XG", "U", "38", "40", "42", "44"]);

function parseImages(raw: unknown): string[] | null {
  if (raw === undefined) return null;
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
  if (typeof raw === "string") {
    return raw.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return null;
}

function parseSizes(raw: unknown): string[] | null {
  if (raw === undefined) return null;
  const parsed = Array.isArray(raw)
    ? raw.map(String).filter((s) => ALLOWED_SIZES.has(s))
    : typeof raw === "string"
      ? raw.split(",").map((s) => s.trim().toUpperCase()).filter((s) => ALLOWED_SIZES.has(s))
      : [];
  return parsed;
}

function parseFloatSafe(value: unknown): number | null | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(",", "."));
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

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
  if (typeof body.name === "string" && body.name.trim() !== "") data.name = body.name.trim();
  if (typeof body.description === "string") data.description = body.description.trim();
  if (typeof body.categorySlug === "string" && body.categorySlug !== "") {
    data.categorySlug = body.categorySlug;
  }
  if (body.price !== undefined) {
    const price = parseFloatSafe(body.price);
    if (price === null) {
      return NextResponse.json({ error: "Preço inválido." }, { status: 400 });
    }
    data.price = price;
  }
  if (body.promotionalPrice !== undefined) {
    const promotionalPrice = parseFloatSafe(body.promotionalPrice);
    data.promotionalPrice = promotionalPrice ?? null;
  }
  if (body.promoQuantity !== undefined) {
    const promoQuantity = parseFloatSafe(body.promoQuantity);
    data.promoQuantity =
      promoQuantity !== null && promoQuantity !== undefined && promoQuantity > 0
        ? Math.round(promoQuantity)
        : null;
  }
  if (body.promoPrice !== undefined) {
    const promoPrice = parseFloatSafe(body.promoPrice);
    data.promoPrice = promoPrice ?? null;
  }
  if (body.subcategory !== undefined) {
    data.subcategory =
      typeof body.subcategory === "string" && body.subcategory.trim() !== ""
        ? body.subcategory.trim()
        : null;
  }
  if (body.images !== undefined) {
    const images = parseImages(body.images);
    if (images === null || images.length === 0) {
      return NextResponse.json({ error: "Informe ao menos uma imagem." }, { status: 400 });
    }
    data.images = images;
  }
  if (body.sizes !== undefined) data.sizes = parseSizes(body.sizes) ?? [];
  if (body.stock !== undefined) {
    const stock = Number(body.stock);
    data.stock = Number.isFinite(stock) ? Math.max(0, Math.round(stock)) : 0;
  }
  for (const field of ["weight", "width", "height", "length"] as const) {
    if (body[field] !== undefined) {
      const value = parseFloatSafe(body[field]);
      if (value === undefined || value === null || value < 0) {
        return NextResponse.json(
          { error: `Valor inválido para ${field}.` },
          { status: 400 },
        );
      }
      data[field] = value;
    }
  }
  if (typeof body.featured === "boolean") data.featured = body.featured;
  if (typeof body.active === "boolean") data.active = body.active;

  try {
    const product = await db.product.update({ where: { id }, data });
    return NextResponse.json({ product });
  } catch (error) {
    console.error("Erro ao atualizar produto:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
  }
}

export async function DELETE(_request: Request, { params }: RouteProps) {
  if (!(await requireAdmin())) return adminUnauthorized();

  const { id } = await params;
  try {
    await db.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
  }
}
