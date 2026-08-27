"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShoppingCart, Eye, Tag } from "lucide-react";
import type { Product } from "@/lib/types";
import { getCategoryBySlug } from "@/lib/catalog";
import { formatCurrency } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { useSession } from "@/lib/session";
import { useToast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/Badge";
import { getColorHex, getColorLabel } from "@/lib/colors";
import { trackAddToCart } from "@/lib/meta-pixel";
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
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] ?? "");

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

    addItem(product, selectedSize, 1, selectedColor || undefined);
    trackAddToCart({
      id: product.id,
      name: product.name,
      price,
      category: category?.name,
    });
    showToast(`${product.name} adicionado ao carrinho`);
  };

  const handleImageClick = async () => {
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

    addItem(product, selectedSize, 1, selectedColor || undefined);
    showToast(`${product.name} adicionado ao carrinho`);
    router.push("/carrinho");
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-graphite-border bg-graphite transition-all duration-300 hover:border-brand/60 hover:shadow-xl hover:shadow-black/40">
      <button
        type="button"
        onClick={handleImageClick}
        disabled={soldOut || product.sizes.length === 0}
        className="relative block aspect-square w-full overflow-hidden bg-graphite-light disabled:opacity-40"
        aria-label={`Adicionar ${product.name} ao carrinho`}
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
            Comprar
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
          <span
            className="text-lg font-bold text-brand"
            aria-label={`Preço: ${formatCurrency(price)}`}
          >
            {formatCurrency(price)}
            <span className="sr-only">{formatCurrency(price)}</span>
          </span>
          {hasPromotion ? (
            <span className="text-sm text-neutral-500 line-through" aria-label={`Preço original: ${formatCurrency(product.price)}`}>
              {formatCurrency(product.price)}
            </span>
          ) : null}
        </div>

        <p
          className={`mt-1 text-xs font-medium ${
            soldOut ? "text-red-400" : lowStock ? "text-amber-400" : "text-neutral-500"
          }`}
          aria-label={soldOut ? "Sem estoque" : lowStock ? `Últimas unidades: ${product.stock} em estoque` : `${product.stock} unidades em estoque`}
        >
          {soldOut ? "Sem estoque" : lowStock ? `Últimas unidades (${product.stock})` : "Em estoque"}
        </p>

        {hasPromotion && product.promoQuantity && product.promoPrice ? (
          <p className="mt-1 inline-flex w-fit items-center gap-1 rounded-md bg-brand/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-brand">
            <Tag size={12} aria-hidden="true" />
            <span aria-label={`Promoção: leve ${product.promoQuantity} por ${formatCurrency(product.promoPrice)}`}>
              Leve {product.promoQuantity} por {formatCurrency(product.promoPrice)}
            </span>
          </p>
        ) : null}

        {(product.colors?.length ?? 0) > 0 ? (
          <div className="mt-2 flex items-center gap-1.5" role="radiogroup" aria-label="Cores disponíveis">
            {product.colors!.map((slug) => {
              const isSelected = selectedColor === slug;
              return (
                <button
                  key={slug}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={`Cor: ${getColorLabel(slug)}${isSelected ? " (selecionada)" : ""}`}
                  onClick={() => setSelectedColor(slug)}
                  className={`h-4 w-4 rounded-full border-2 transition-all ${
                    isSelected
                      ? "ring-2 ring-brand ring-offset-1 ring-offset-graphite scale-110"
                      : "hover:scale-110"
                  } ${
                    getColorHex(slug).toLowerCase() === "#ffffff"
                      ? "border-graphite-border"
                      : "border-white/20"
                  }`}
                  style={{ backgroundColor: getColorHex(slug) }}
                />
              );
            })}
          </div>
        ) : null}

        {product.sizes.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1.5" role="radiogroup" aria-label="Tamanhos disponíveis">
            {product.sizes.map((size) => {
              const isSelected = selectedSize === size;
              return (
                <button
                  key={size}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={`Tamanho ${size}${isSelected ? " (selecionado)" : ""}`}
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-[2rem] rounded-md px-2 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                    isSelected
                      ? "bg-brand text-ink"
                      : "border border-graphite-border text-neutral-400 hover:border-neutral-500 hover:text-white"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        ) : null}

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={soldOut || product.sizes.length === 0}
            aria-label={`Adicionar ${product.name}${selectedColor ? ` na cor ${getColorLabel(selectedColor)}` : ""} tamanho ${selectedSize} ao carrinho`}
            className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-graphite-light text-xs font-semibold uppercase tracking-wider text-white transition-all duration-300 hover:bg-brand hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ShoppingCart size={15} aria-hidden="true" />
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
