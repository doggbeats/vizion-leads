
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const promoImages = [
  { src: "/images/products/promo1.png", alt: "Promo 1" },
  { src: "/images/products/promo%202.png", alt: "Promo 2" },
  { src: "/images/products/promo3.png", alt: "Promo 3" },
  { src: "/images/products/promo%204.png", alt: "Promo 4" },
];

export function FeaturedProducts() {
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
          {promoImages.map((image) => (
            <div
              key={image.src}
              className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-graphite-border bg-graphite-light"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw"
                className="object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
