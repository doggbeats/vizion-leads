import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { categories } from "@/lib/products";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Categories() {
  return (
    <section id="categorias" className="scroll-mt-20 bg-ink py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Categorias"
          title="Escolha seu estilo"
          description="Coleções pensadas para cada momento da sua rotina urbana."
          align="center"
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/produtos/${category.slug}`}
              className="group relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-2xl border border-graphite-border bg-graphite"
            >
              <Image
                src={category.image}
                alt={category.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
              <div className="relative z-10 p-5">
                <h3 className="font-display text-3xl tracking-wide text-white">
                  {category.name}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm text-neutral-400">
                  {category.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-brand transition-transform duration-300 group-hover:translate-x-1">
                  Ver produtos <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
