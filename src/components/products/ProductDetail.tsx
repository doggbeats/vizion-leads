"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import type { Product } from "@/lib/types";
import { getCategoryBySlug } from "@/lib/catalog";
import { formatCurrency } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { useSession } from "@/lib/session";
import { useToast } from "@/components/ui/toast";

type ProductDetailProps = {
  product: Product;
};

export function ProductDetail({ product }: ProductDetailProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] ?? "");
  const { addItem } = useCart();
  const { user } = useSession();
  const { showToast } = useToast();
  const router = useRouter();

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
    <div>
      <Link
        href="/produtos"
        className="mb-8 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-neutral-500 transition-colors hover:text-brand"
      >
        <ArrowLeft size={14} />
        Voltar para produtos
      </Link>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-graphite-border bg-graphite-light">
            <Image
              src={product.images[activeIndex] ?? product.images[0] ?? ""}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
            {hasPromotion ? (
              <span className="absolute left-4 top-4 z-10 rounded-full bg-brand px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-ink">
                Oferta
              </span>
            ) : null}
          </div>

          {product.images.length > 1 ? (
            <div className="mt-4 flex gap-3">
              {product.images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Ver foto ${index + 1}`}
                  className={`relative aspect-square w-20 overflow-hidden rounded-lg border-2 transition-colors ${
                    activeIndex === index
                      ? "border-brand"
                      : "border-graphite-border hover:border-neutral-500"
                  }`}
                >
                  <Image
                    src={image}
                    alt=""
                    fill
                    sizes="80px"
              className="object-cover"
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col">
          {category ? (
            <Link
              href={`/produtos/${category.slug}`}
              className="text-[11px] font-bold uppercase tracking-[0.25em] text-brand transition-colors hover:text-brand-dark"
            >
              {category.name}
            </Link>
          ) : null}

          <h1 className="mt-3 font-display text-3xl tracking-wide text-white sm:text-4xl">
            {product.name}
          </h1>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-brand">
              {formatCurrency(price)}
            </span>
            {hasPromotion ? (
              <span className="text-lg text-neutral-500 line-through">
                {formatCurrency(product.price)}
              </span>
            ) : null}
          </div>

          <p
            className={`mt-2 text-sm font-medium ${
              soldOut
                ? "text-red-400"
                : lowStock
                  ? "text-amber-400"
                  : "text-neutral-500"
            }`}
          >
            {soldOut
              ? "Sem estoque"
              : lowStock
                ? `Últimas unidades (${product.stock})`
                : "Em estoque"}
          </p>

          {product.description ? (
            <p className="mt-6 text-sm leading-relaxed text-neutral-400">
              {product.description}
            </p>
          ) : null}

          {product.sizes.length > 0 ? (
            <div className="mt-8">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-neutral-500">
                Tamanho
              </p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[3rem] rounded-lg px-3 py-2 text-sm font-bold uppercase tracking-wider transition-colors ${
                      selectedSize === size
                        ? "bg-brand text-ink"
                        : "border border-graphite-border text-neutral-400 hover:border-neutral-500 hover:text-white"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={soldOut || product.sizes.length === 0}
            className="mt-8 flex w-full max-w-md items-center justify-center gap-2 rounded-xl bg-brand py-4 text-sm font-bold uppercase tracking-wider text-ink transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ShoppingCart size={18} />
            Adicionar ao carrinho
          </button>
        </div>
      </div>
    </div>
  );
}
