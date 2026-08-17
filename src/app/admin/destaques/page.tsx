import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { redirect } from "next/navigation";
import {
  DestaquesManager,
  type DestaqueProduct,
} from "@/components/admin/DestaquesManager";

export const dynamic = "force-dynamic";

export default async function AdminDestaquesPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/login");

  const products = await db.product.findMany({
    where: { active: true },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  const items: DestaqueProduct[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    promotionalPrice: p.promotionalPrice,
    images: p.images,
    featured: p.featured,
    active: p.active,
  }));

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-brand">
          Administração
        </p>
        <h1 className="font-display text-3xl tracking-wide text-white sm:text-4xl lg:text-5xl">
          Destaques
        </h1>
        <p className="mt-2 text-sm text-neutral-400">
          Escolha os produtos que aparecem na &quot;Seleção da semana&quot; da página inicial.
        </p>
      </div>

      <DestaquesManager initial={items} />
    </div>
  );
}
