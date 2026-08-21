"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import type { Product } from "@/lib/types";
import { getCategoryBySlug } from "@/lib/catalog";
import { formatCurrency } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { useSession } from "@/lib/session";
import { useToast } from "@/components/ui/toast";

type Props = { product: Product };

export function FeaturedProductCard({ product }: Props) {
  const { addItem } = useCart();
  const { user } = useSession();
  const { showToast } = useToast();
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] ?? "");

  const category = getCategoryBySlug(product.category);
  const hasPromotion =
    product.promotionalPrice !== undefined &&
    product.promotionalPrice < product.price;
  const price = hasPromotion ? product.promotionalPrice! : product.price;
  const soldOut = product.stock <= 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (soldOut || product.sizes.length === 0) return;

    let loggedUser = user;
    if (!loggedUser) {
      const response = await fetch("/api/auth/me");
      const data = await response.json().catch(() => ({}));
      loggedUser = data.user ?? null;
    }

    if (!loggedUser) {
      showToast("Faça login ou cadastre-se para comprar");
      router.push("/login?redirect=/");
      return;
    }

    addItem(product, selectedSize);
    showToast(`${product.name} adicionado ao carrinho`);
  };

  return (
    <Link
      href={`/produto/${product.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-graphite-border bg-graphite-light transition-all duration-300 hover:border-brand/60 hover:shadow-xl hover:shadow-black/40"
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
        {hasPromotion ? (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-brand px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-ink">
            Oferta
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        {category ? (
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
            {category.name}
          </p>
        ) : null}
        <p className="line-clamp-1 text-sm font-semibold text-white">
          {product.name}
        </p>

        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-base font-bold text-brand">
            {formatCurrency(price)}
          </span>
          {hasPromotion ? (
            <span className="text-xs text-neutral-500 line-through">
              {formatCurrency(product.price)}
            </span>
          ) : null}
        </div>

        {product.sizes.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1">
            {product.sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedSize(size);
                }}
                className={`min-w-[1.75rem] rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
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

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={soldOut || product.sizes.length === 0}
          aria-label={`Adicionar ${product.name} ao carrinho`}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand py-2 text-[11px] font-bold uppercase tracking-wider text-ink transition-all duration-300 hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ShoppingCart size={14} />
          {soldOut ? "Esgotado" : "Comprar"}
        </button>
      </div>
    </Link>
  );
}
