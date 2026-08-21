
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getFeaturedProducts } from "@/lib/products";
import { FeaturedProductsGrid } from "./FeaturedProductsGrid";

export async function FeaturedProducts() {
  const products = await getFeaturedProducts();

  if (products.length === 0) return null;

  return (
    <section className="border-t border-graphite-border bg-graphite py-20 sm:py-24">
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Destaques"
            title="Seleção da semana"
            description="As peças mais desejadas da temporada, escolhidas a dedo para você."
          />
          <Link
            href="/produtos"
            className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-bold uppercase tracking-widest text-brand transition-colors hover:text-brand-dark"
          >
            Ver todos os produtos
            <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
        <FeaturedProductsGrid products={products} />
      </Container>
    </section>
  );
}
