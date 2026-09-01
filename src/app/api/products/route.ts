import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const idsParam = request.nextUrl.searchParams.get("ids") ?? "";
  const ids = idsParam.split(",").map((id) => id.trim()).filter(Boolean);
  if (ids.length === 0) {
    return NextResponse.json({ products: [] });
  }

  const products = await db.product.findMany({
    where: { id: { in: ids }, active: true },
  });

  const mapped = products.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    promotionalPrice: p.promotionalPrice,
    promoQuantity: p.promoQuantity,
    promoPrice: p.promoPrice,
    category: p.categorySlug,
    subcategory: p.subcategory,
    images: p.images,
    sizes: p.sizes,
    colors: p.colors,
    stock: p.stock,
    featured: p.featured,
    active: p.active,
  }));

  return NextResponse.json({ products: mapped });
}
