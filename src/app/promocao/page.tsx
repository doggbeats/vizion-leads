import type { Metadata } from "next";
import { Flame } from "lucide-react";
import { getPromotionalProducts } from "@/lib/products";
import { siteConfig } from "@/lib/site";
import { Container } from "@/components/ui/Container";
import { ProductGrid } from "@/components/products/ProductGrid";

export const metadata: Metadata = {
  title: "Promoções e Liquidação | VIZION Store",
  description:
    "Aproveite as melhores ofertas da VIZION: liquidação e queima de estoque com até 30% OFF em peças streetwear premium masculinas.",
  alternates: { canonical: "/promocao" },
  openGraph: {
    title: "Promoções e Liquidação | VIZION Store",
    description:
      "Liquidação e queima de estoque com até 30% OFF em peças streetwear premium masculinas.",
    url: `${siteConfig.url}/promocao`,
    type: "website",
    siteName: siteConfig.fullName,
    locale: "pt_BR",
    images: [
      {
        url: "/images/hero.svg",
        width: 1200,
        height: 630,
        alt: "Promoções VIZION — liquidação streetwear",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Promoções | VIZION Store",
    description: "Liquidação com até 30% OFF em streetwear premium.",
    images: ["/images/hero.svg"],
  },
};

export const dynamic = "force-dynamic";

export default async function PromocaoPage() {
  const products = await getPromotionalProducts();

  return (
    <section className="bg-ink py-16 sm:py-20">
      <Container>
        <div className="mb-10 sm:mb-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15 text-red-400">
              <Flame size={22} />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-400">
              Promoções
            </p>
          </div>
          <h1 className="font-display text-5xl tracking-wide text-white sm:text-6xl">
            Liquidação
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-400">
            Aproveite a queima de estoque com preços imperdíveis. Peças
            selecionadas com descontos de até{" "}
            <span className="font-bold text-brand">30% OFF</span>.
          </p>
          <p className="mt-4 text-sm font-medium text-neutral-500">
            {products.length}{" "}
            {products.length === 1 ? "produto em promoção" : "produtos em promoção"}
          </p>
        </div>

        {products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-graphite-border bg-graphite py-20 text-center">
            <Flame size={48} className="mb-4 text-neutral-600" />
            <p className="text-lg font-semibold text-white">
              Nenhuma promoção ativa no momento
            </p>
            <p className="mt-2 text-sm text-neutral-500">
              Volte em breve para conferir nossas ofertas.
            </p>
          </div>
        )}
      </Container>
    </section>
  );
}
