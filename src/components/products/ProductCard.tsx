"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShoppingCart, Eye } from "lucide-react";
import type { Product } from "@/lib/types";
import { getCategoryBySlug } from "@/lib/catalog";
import { formatCurrency } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { useSession } from "@/lib/session";
import { useToast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/Badge";
import { QuickViewModal } from "./QuickViewModal";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { user } = useSession();
  const { showToast } = useToast();
  const router = useRouter();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] ?? "");

  const category = getCategoryBySlug(product.category);
  const hasPromotion =
    product.promotionalPrice !== undefined &&
    product.promotionalPrice < product.price;
  const price = hasPromotion ? product.promotionalPrice! : product.price;
  const soldOut = product.stock <= 0;
  const lowStock = product.stock > 0 && product.stock <= 5;

  const handleAddToCart = async () => {
    if (soldOut || product.sizes.length === 0) return;

    let loggedUser = user;
    if (!loggedUser) {
      const response = await fetch("/api/auth/me");
      const data = await response.json().catch(() => ({}));
      loggedUser = data.user ?? null;
    }

    if (!loggedUser) {
      const redirect = encodeURIComponent(
        window.location.pathname + window.location.search,
      );
      showToast("Faça login ou cadastre-se para comprar");
      router.push(`/login?redirect=${redirect}`);
      return;
    }

    addItem(product, selectedSize);
    showToast(`${product.name} adicionado ao carrinho`);
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-graphite-border bg-graphite transition-all duration-300 hover:border-brand/60 hover:shadow-xl hover:shadow-black/40">
      <button
        type="button"
        onClick={() => setQuickViewOpen(true)}
        className="relative block aspect-square w-full overflow-hidden bg-graphite-light"
        aria-label={`Ampliar foto de ${product.name}`}
      >
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {hasPromotion ? (
          <Badge className="absolute left-3 top-3">Oferta</Badge>
        ) : null}
        {soldOut ? (
          <span className="absolute right-3 top-3 rounded-full bg-ink/80 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white backdrop-blur">
            Esgotado
          </span>
        ) : null}
        <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="rounded-full bg-brand px-4 py-2 text-xs font-bold uppercase tracking-wider text-ink">
            Ampliar foto
          </span>
        </span>
      </button>

      <div className="flex flex-1 flex-col gap-1 p-3">
        {category ? (
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500">
            {category.name}
          </p>
        ) : null}
        <h3 className="line-clamp-1 font-semibold text-white">
          {product.name}
        </h3>

        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-lg font-bold text-brand">{formatCurrency(price)}</span>
          {hasPromotion ? (
            <span className="text-sm text-neutral-500 line-through">
              {formatCurrency(product.price)}
            </span>
          ) : null}
        </div>

        <p
          className={`mt-1 text-xs font-medium ${
            soldOut ? "text-red-400" : lowStock ? "text-amber-400" : "text-neutral-500"
          }`}
        >
          {soldOut ? "Sem estoque" : lowStock ? `Últimas unidades (${product.stock})` : "Em estoque"}
        </p>

        {product.sizes.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {product.sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={`min-w-[2rem] rounded-md px-2 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                  selectedSize === size
                    ? "bg-brand text-ink"
                    : "border border-graphite-border text-neutral-400 hover:border-neutral-500 hover:text-white"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        ) : null}

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={soldOut || product.sizes.length === 0}
            aria-label={`Adicionar ${product.name} ao carrinho`}
            className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-graphite-light text-xs font-semibold uppercase tracking-wider text-white transition-all duration-300 hover:bg-brand hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ShoppingCart size={15} />
            Adicionar
          </button>
          <button
            type="button"
            onClick={() => setQuickViewOpen(true)}
            aria-label={`Ver ${product.name}`}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-graphite-border text-neutral-400 transition-all duration-300 hover:border-brand hover:text-brand"
          >
            <Eye size={16} />
          </button>
        </div>
      </div>

      <QuickViewModal
        product={product}
        open={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
      />
    </article>
  );
}
