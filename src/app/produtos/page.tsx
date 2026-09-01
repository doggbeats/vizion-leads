import type { Metadata } from "next";
import { getProducts } from "@/lib/products";
import { siteConfig } from "@/lib/site";
import { Container } from "@/components/ui/Container";
import { CatalogProducts } from "@/components/products/CatalogProducts";

export const metadata: Metadata = {
  title: "Todos os produtos | Moda Masculina Streetwear",
  description:
    "Confira todos os produtos VIZION: camisetas oversize, bermudas, calças jeans e acessórios com estilo streetwear premium. Enviamos para todo o Brasil.",
  alternates: { canonical: "/produtos" },
  openGraph: {
    title: "Todos os produtos | Moda Masculina Streetwear",
    description:
      "Confira todos os produtos VIZION: camisetas oversize, bermudas, calças jeans e acessórios com estilo streetwear premium.",
    url: `${siteConfig.url}/produtos`,
    type: "website",
    siteName: siteConfig.fullName,
    locale: "pt_BR",
    images: [
      {
        url: "/images/hero.svg",
        width: 1200,
        height: 630,
        alt: "Produtos VIZION — moda masculina streetwear",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Todos os produtos | VIZION",
    description:
      "Camisetas oversize, bermudas, calças jeans e acessórios streetwear premium.",
    images: ["/images/hero.svg"],
  },
};

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const initialQuery = q?.trim() ?? "";
  const activeProducts = await getProducts();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Todos os produtos VIZION",
    url: `${siteConfig.url}/produtos`,
    inLanguage: "pt-BR",
    mainEntity: {
      "@type": "ItemList",
      name: "Produtos VIZION",
      itemListElement: activeProducts.slice(0, 50).map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: product.name,
        description: product.description,
      })),
    },
    isPartOf: { "@id": `${siteConfig.url}/#website` },
  };

  return (
    <section className="bg-ink py-16 sm:py-20">
      <Container>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div className="mb-10 sm:mb-12">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-brand">
            Produtos
          </p>
          <h1 className="font-display text-5xl tracking-wide text-white sm:text-6xl">
            {initialQuery ? `Busca: "${initialQuery}"` : "Todos os produtos"}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-400">
            Camisetas oversize, bermudas, calças jeans e acessórios com estilo
            streetwear premium, qualidade e bom preço.
          </p>
        </div>

        <CatalogProducts products={activeProducts} initialQuery={initialQuery} />
      </Container>
    </section>
  );
}
