"use client";

import type { ProductSize } from "@/lib/types";
import { useRecentlyViewed } from "@/lib/recently-viewed";
import { ProductCard } from "./ProductCard";
import { Container } from "@/components/ui/Container";

export function RecentlyViewedProducts() {
  const { items } = useRecentlyViewed();

  if (items.length === 0) return null;

  return (
    <section className="border-t border-white/[0.05] bg-ink py-14">
      <Container>
        <div className="mb-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-brand">
            Continue comprando
          </p>
          <h2 className="font-display text-3xl tracking-wide text-white sm:text-4xl">
            Vistos recentemente
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
          {items.slice(0, 5).map((item) => (
            <ProductCard
              key={item.id}
              product={{
                id: item.id,
                name: item.name,
                description: "",
                price: item.price,
                promotionalPrice: item.promotionalPrice,
                category: item.category,
                images: item.images,
                sizes: item.sizes as ProductSize[],
                colors: item.colors,
                stock: item.stock,
                active: true,
              }}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
