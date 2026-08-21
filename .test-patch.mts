import "dotenv/config";
import { PrismaClient } from "./src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const ALLOWED_SIZES = new Set(["PP", "P", "M", "G", "GG", "XG", "U", "38", "40", "42", "44"]);

function parseFloatSafe(value: unknown): number | null | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(",", "."));
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function parseSizes(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map(String).filter((s) => ALLOWED_SIZES.has(s));
  if (typeof raw === "string")
    return raw.split(",").map((s) => s.trim().toUpperCase()).filter((s) => ALLOWED_SIZES.has(s));
  return [];
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

const products = await db.product.findMany({ take: 1, orderBy: { createdAt: "desc" } });
const p = products[0];
console.log("Produto:", p.id, "|", p.name);

const body = {
  name: p.name,
  description: p.description,
  price: String(p.price),
  promotionalPrice: p.promotionalPrice === null ? "" : String(p.promotionalPrice),
  promoQuantity: "3",
  promoPrice: "150.90",
  categorySlug: p.categorySlug,
  subcategory: p.subcategory ?? "",
  images: p.images.join(", "),
  sizes: p.sizes.join(", "),
  stock: String(p.stock),
  weight: String(p.weight),
  width: String(p.width),
  height: String(p.height),
  length: String(p.length),
  featured: p.featured,
  active: p.active,
};

const data: Record<string, unknown> = {};
if (typeof body.name === "string" && body.name.trim() !== "") data.name = body.name.trim();
if (typeof body.description === "string") data.description = body.description.trim();
if (body.price !== undefined) data.price = parseFloatSafe(body.price);
if (body.promotionalPrice !== undefined) data.promotionalPrice = parseFloatSafe(body.promotionalPrice) ?? null;
if (body.promoQuantity !== undefined) {
  const q = parseFloatSafe(body.promoQuantity);
  data.promoQuantity = q !== null && q !== undefined && q > 0 ? Math.round(q) : null;
}
if (body.promoPrice !== undefined) data.promoPrice = parseFloatSafe(body.promoPrice) ?? null;
data.sizes = parseSizes(body.sizes);
data.stock = Math.max(0, Math.round(Number(body.stock)));

try {
  const updated = await db.product.update({ where: { id: p.id }, data });
  console.log("UPDATE OK:", JSON.stringify({
    name: updated.name,
    price: updated.price,
    promotionalPrice: updated.promotionalPrice,
    promoQuantity: updated.promoQuantity,
    promoPrice: updated.promoPrice,
    sizes: updated.sizes,
    stock: updated.stock,
  }));
} catch (error) {
  console.error("UPDATE FALHOU:", error);
} finally {
  await db.$disconnect();
}
