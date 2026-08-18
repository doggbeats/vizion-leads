import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { redirect } from "next/navigation";
import {
  CategoriasManager,
  type CategoryItem,
} from "@/components/admin/CategoriasManager";

export const dynamic = "force-dynamic";

export default async function AdminCategoriasPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/login");

  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
  });

  const items: CategoryItem[] = categories.map((c) => ({
    slug: c.slug,
    name: c.name,
    description: c.description,
    image: c.image,
  }));

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-brand">
          Administração
        </p>
        <h1 className="font-display text-3xl tracking-wide text-white sm:text-4xl lg:text-5xl">
          Categorias
        </h1>
        <p className="mt-2 text-sm text-neutral-400">
          Altere as imagens das categorias que aparecem na página inicial.
        </p>
      </div>

      <CategoriasManager initial={items} />
    </div>
  );
}
