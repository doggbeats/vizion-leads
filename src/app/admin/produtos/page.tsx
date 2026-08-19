import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { redirect } from "next/navigation";
import { categories } from "@/lib/catalog";
import {
  ProdutosManager,
  type AdminProduct,
  type AdminCategory,
} from "@/components/admin/ProdutosManager";

export const dynamic = "force-dynamic";

export default async function AdminProdutosPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/login");

  const products = await db.product.findMany({ orderBy: { createdAt: "desc" } });

  const produtos: AdminProduct[] = products.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    promotionalPrice: product.promotionalPrice,
    categorySlug: product.categorySlug,
    subcategory: product.subcategory,
    images: product.images,
    sizes: product.sizes,
    stock: product.stock,
    weight: product.weight,
    width: product.width,
    height: product.height,
    length: product.length,
    featured: product.featured,
    active: product.active,
  }));

  const categorias: AdminCategory[] = categories.map((category) => ({
    slug: category.slug,
    name: category.name,
  }));

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-brand">
          Administração
        </p>
        <h1 className="font-display text-3xl tracking-wide text-white sm:text-4xl lg:text-5xl">
          Produtos
        </h1>
        <p className="mt-2 text-sm text-neutral-400">
          Cadastre, edite e gerencie o estoque da loja.
        </p>
      </div>

      <ProdutosManager initial={produtos} categories={categorias} />
    </div>
  );
}
