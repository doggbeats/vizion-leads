import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  categories,
  getCategoryBySlug,
  getProductsByCategory,
} from "@/lib/products";
import { Container } from "@/components/ui/Container";
import { CategoryProducts } from "@/components/products/CategoryProducts";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return categories.map((category) => ({ slug: category.slug }));
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    return { title: "Categoria não encontrada" };
  }

  return {
    title: category.name,
    description: category.description,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const products = await getProductsByCategory(category.slug);

  return (
    <section className="bg-ink py-16 sm:py-20">
      <Container>
        <div className="mb-10 sm:mb-12">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-brand">
            {category.name}
          </p>
          <h1 className="font-display text-5xl tracking-wide text-white sm:text-6xl">
            {category.name}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-400">
            {category.description}
          </p>
          <p className="mt-4 text-sm font-medium text-neutral-500">
            {products.length} {products.length === 1 ? "produto" : "produtos"}
          </p>
        </div>

        <CategoryProducts products={products} categorySlug={category.slug} />
      </Container>
    </section>
  );
}
