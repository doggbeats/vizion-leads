import type { Metadata } from "next";
import { getProducts } from "@/lib/products";
import { Container } from "@/components/ui/Container";
import { ProductGrid } from "@/components/products/ProductGrid";

export const metadata: Metadata = {
  title: "Todos os produtos",
  description:
    "Confira todos os produtos VIZION: camisetas, bermudas, calças e calças jeans com estilo streetwear premium.",
};

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const activeProducts = await getProducts();

  return (
    <section className="bg-ink py-16 sm:py-20">
      <Container>
        <div className="mb-10 sm:mb-12">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-brand">
            Produtos
          </p>
          <h1 className="font-display text-5xl tracking-wide text-white sm:text-6xl">
            Todos os produtos
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-400">
            Camisetas, bermudas, calças e calças jeans com estilo, qualidade e
            bom preço.
          </p>
          <p className="mt-4 text-sm font-medium text-neutral-500">
            {activeProducts.length}{" "}
            {activeProducts.length === 1 ? "produto" : "produtos"}
          </p>
        </div>

        <ProductGrid products={activeProducts} />
      </Container>
    </section>
  );
}
