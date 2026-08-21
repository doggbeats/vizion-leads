import type { Product, ProductSize } from "./types";
import { db } from "./db";
import {
  categories,
  getCategoryBySlug,
  getSubcategories,
  getSubcategoryLabel,
} from "./catalog";

export {
  categories,
  getCategoryBySlug,
  getSubcategories,
  getSubcategoryLabel,
};

export type { Category } from "./types";

function mapProduct(row: {
  id: string;
  name: string;
  description: string;
  price: number;
  promotionalPrice: number | null;
  promoQuantity: number | null;
  promoPrice: number | null;
  categorySlug: string;
  subcategory: string | null;
  images: string[];
  sizes: string[];
  stock: number;
  featured: boolean;
  active: boolean;
}): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    promotionalPrice: row.promotionalPrice ?? undefined,
    promoQuantity: row.promoQuantity ?? undefined,
    promoPrice: row.promoPrice ?? undefined,
    category: row.categorySlug,
    subcategory: row.subcategory ?? undefined,
    images: row.images,
    sizes: row.sizes as ProductSize[],
    stock: row.stock,
    featured: row.featured,
    active: row.active,
  };
}

export async function getProducts(): Promise<Product[]> {
  const rows = await db.product.findMany({
    where: { active: true },
    orderBy: { createdAt: "asc" },
  });
  return rows.map(mapProduct);
}

export async function getProductById(id: string): Promise<Product | null> {
  const row = await db.product.findFirst({
    where: { id, active: true },
  });
  return row ? mapProduct(row) : null;
}

export async function getProductsByCategory(slug: string): Promise<Product[]> {
  const rows = await db.product.findMany({
    where: { active: true, categorySlug: slug },
    orderBy: { createdAt: "asc" },
  });
  return rows.map(mapProduct);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const rows = await db.product.findMany({
    where: { active: true, featured: true },
    orderBy: { createdAt: "asc" },
  });
  return rows.map(mapProduct);
}

export async function getPromotionalProducts(): Promise<Product[]> {
  const rows = await db.product.findMany({
    where: { active: true, promotionalPrice: { not: null } },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapProduct);
}

export async function getRelatedProducts(product: Product): Promise<Product[]> {
  const rows = await db.product.findMany({
    where: {
      active: true,
      categorySlug: product.category,
      id: { not: product.id },
    },
    orderBy: { createdAt: "asc" },
    take: 4,
  });
  return rows.map(mapProduct);
}
