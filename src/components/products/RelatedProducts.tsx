import type { Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";
import { Container } from "@/components/ui/Container";

export function RelatedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section className="border-t border-white/[0.05] bg-ink py-14">
      <Container>
        <div className="mb-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-brand">
            Você também pode gostar
          </p>
          <h2 className="font-display text-3xl tracking-wide text-white sm:text-4xl">
            Produtos relacionados
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Container>
    </section>
  );
}
