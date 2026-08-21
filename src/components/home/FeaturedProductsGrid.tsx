"use client";

import type { Product } from "@/lib/types";
import { FeaturedProductCard } from "./FeaturedProductCard";

type Props = { products: Product[] };

export function FeaturedProductsGrid({ products }: Props) {
  return (
    <div className="mx-auto mt-12 grid w-full max-w-5xl grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
      {products.slice(0, 4).map((product) => (
        <FeaturedProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
