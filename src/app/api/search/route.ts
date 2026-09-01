import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json({ products: [] });
  }

  const products = await db.product.findMany({
    where: {
      active: true,
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { categorySlug: { contains: q, mode: "insensitive" } },
        { subcategory: { contains: q, mode: "insensitive" } },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 8,
    select: {
      id: true,
      name: true,
      price: true,
      promotionalPrice: true,
      images: true,
      categorySlug: true,
      stock: true,
    },
  });

  const mapped = products.map((p) => ({
    ...p,
    category: p.categorySlug,
  }));

  return NextResponse.json({ products: mapped });
}
