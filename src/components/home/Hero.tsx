import Image from "next/image";
import Link from "next/link";
import { buttonClassName } from "@/components/ui/Button";

const heroContent = {
  brand: "VIZION STORE",
  title: "STREETWEAR",
  titleAccent: "PREMIUM",
  subtitle: "Vista sua visão.",
  description:
    "Peças premium de moda masculina para quem vive a rua com estilo, atitude e qualidade.",
  ctaPrimary: "Comprar agora",
  ctaSecondary: "Ver coleção",
  ctaPrimaryHref: "/produtos",
  ctaSecondaryHref: "/#categorias",
};

export function Hero() {
  return (
    <section className="relative flex min-h-[calc(80svh-4rem)] items-center overflow-hidden lg:min-h-[calc(100svh-5rem)]">
      <Image
        src="/images/hero.svg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/60" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl animate-fade-up">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.4em] text-brand">
            {heroContent.brand}
          </p>
          <h1 className="font-display text-7xl leading-[0.9] tracking-wide text-white sm:text-8xl lg:text-9xl">
            {heroContent.title}
            <span className="block text-brand">{heroContent.titleAccent}</span>
          </h1>
          <p className="mt-6 text-2xl font-light italic text-neutral-200 sm:text-3xl">
            {heroContent.subtitle}
          </p>
          <p className="mt-4 max-w-md text-base leading-relaxed text-neutral-400">
            {heroContent.description}
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href={heroContent.ctaPrimaryHref} className={buttonClassName("primary", "lg")}>
              {heroContent.ctaPrimary}
            </Link>
            <Link href={heroContent.ctaSecondaryHref} className={buttonClassName("outline", "lg")}>
              {heroContent.ctaSecondary}
            </Link>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent" />
    </section>
  );
}
