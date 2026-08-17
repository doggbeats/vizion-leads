"use client";

import { useState } from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import { formatCurrency } from "@/lib/format";

export type DestaqueProduct = {
  id: string;
  name: string;
  price: number;
  promotionalPrice: number | null;
  images: string[];
  featured: boolean;
  active: boolean;
};

export function DestaquesManager({ initial }: { initial: DestaqueProduct[] }) {
  const [products, setProducts] = useState(initial);
  const [loading, setLoading] = useState<string | null>(null);

  async function toggleFeatured(id: string, current: boolean) {
    setLoading(id);
    try {
      const res = await fetch("/api/admin/destaques", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, featured: !current }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, featured: !current } : p)),
        );
      }
    } finally {
      setLoading(null);
    }
  }

  const featured = products.filter((p) => p.featured);
  const others = products.filter((p) => !p.featured);

  return (
    <div className="space-y-10">
      {featured.length > 0 && (
        <div>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-brand">
            Seleção da semana ({featured.length})
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                loading={loading === product.id}
                onToggle={toggleFeatured}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-neutral-400">
          Todos os produtos ({others.length})
        </h2>
        {others.length === 0 ? (
          <p className="text-sm text-neutral-500">
            Todos os produtos ativos já estão em destaque.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {others.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                loading={loading === product.id}
                onToggle={toggleFeatured}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({
  product,
  loading,
  onToggle,
}: {
  product: DestaqueProduct;
  loading: boolean;
  onToggle: (id: string, current: boolean) => void;
}) {
  const displayPrice = product.promotionalPrice ?? product.price;

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border transition-colors ${
        product.featured
          ? "border-brand bg-brand/5"
          : "border-graphite-border bg-graphite"
      }`}
    >
      <div className="relative aspect-[2/3] bg-graphite-light">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-600">
            Sem imagem
          </div>
        )}
        {product.featured && (
          <span className="absolute left-2 top-2 flex h-7 items-center gap-1 rounded-full bg-brand px-2 text-xs font-bold text-ink">
            <Star size={12} fill="currentColor" />
            Destaque
          </span>
        )}
      </div>

      <div className="p-3">
        <p className="truncate text-sm font-medium text-white">{product.name}</p>
        <p className="mt-1 text-sm font-bold text-brand">
          {formatCurrency(displayPrice)}
        </p>
      </div>

      <button
        type="button"
        disabled={loading}
        onClick={() => onToggle(product.id, product.featured)}
        className={`flex w-full items-center justify-center gap-2 border-t border-graphite-border py-2.5 text-xs font-bold uppercase tracking-wider transition-colors ${
          product.featured
            ? "text-brand hover:bg-brand/10"
            : "text-neutral-400 hover:bg-graphite-light hover:text-white"
        } disabled:opacity-50`}
      >
        <Star
          size={14}
          fill={product.featured ? "currentColor" : "none"}
        />
        {product.featured ? "Remover destaque" : "Destacar"}
      </button>
    </div>
  );
}
