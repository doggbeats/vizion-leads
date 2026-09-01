import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductById, getRelatedProducts } from "@/lib/products";
import { siteConfig } from "@/lib/site";
import { Container } from "@/components/ui/Container";
import { ProductDetail } from "@/components/products/ProductDetail";
import { RelatedProducts } from "@/components/products/RelatedProducts";
import { RecentlyViewedProducts } from "@/components/products/RecentlyViewedProducts";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    return { title: "Produto não encontrado" };
  }

  const title = `${product.name} | ${siteConfig.fullName}`;
  const description =
    product.description ||
    `${product.name} com entrega para todo o Brasil.`;

  return {
    title,
    description,
    alternates: { canonical: `/produto/${product.id}` },
    openGraph: {
      title,
      description,
      url: `${siteConfig.url}/produto/${product.id}`,
      type: "website",
      siteName: siteConfig.fullName,
      locale: "pt_BR",
      images: product.images[0]
        ? [{ url: product.images[0], alt: product.name }]
        : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const related = await getRelatedProducts(product);

  return (
    <>
      <section className="bg-ink py-12 sm:py-16">
        <Container>
          <ProductDetail product={product} />
        </Container>
      </section>
      <RelatedProducts products={related} />
      <RecentlyViewedProducts />
    </>
  );
}
