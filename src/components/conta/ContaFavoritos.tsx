"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import type { Product } from "@/lib/types";
import { useFavorites } from "@/lib/favorites";
import { ProductCard } from "@/components/products/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";

export function ContaFavoritos() {
  const { ids } = useFavorites();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ids.length === 0) {
      return;
    }
    let active = true;
    (async () => {
      try {
        const response = await fetch(
          `/api/products?ids=${encodeURIComponent(ids.join(","))}`,
        );
        const data = await response.json().catch(() => ({}));
        if (active) {
          const orderMap = new Map(ids.map((id, index) => [id, index]));
          const sorted = (data.products ?? []).sort(
            (a: Product, b: Product) =>
              (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0),
          );
          setProducts(sorted);
        }
      } catch {
        if (active) setProducts([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [ids]);

  if (ids.length === 0) {
    return (
      <EmptyState
        title="Nenhum favorito ainda"
        description="Toque no coração de um produto para salvá-lo aqui."
      />
    );
  }

  if (loading) {
    return <p className="py-8 text-center text-sm text-zinc-400">Carregando favoritos...</p>;
  }

  if (products.length === 0) {
    return (
      <EmptyState
        title="Nenhum favorito ainda"
        description="Toque no coração de um produto para salvá-lo aqui."
      />
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-brand">
          <Heart size={16} />
          {products.length} {products.length === 1 ? "produto salvo" : "produtos salvos"}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
