
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getFeaturedProducts } from "@/lib/products";

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
        <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {products.slice(0, 4).map((product) => (
            <div
              key={product.id}
              className="group relative aspect-[2/3] overflow-hidden rounded-2xl border border-graphite-border bg-graphite-light"
            >
              {product.images[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : null}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent p-4 pt-10">
                <p className="text-sm font-bold text-white">{product.name}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
