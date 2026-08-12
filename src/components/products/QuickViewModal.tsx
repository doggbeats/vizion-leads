"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import type { Product } from "@/lib/types";
import { getCategoryBySlug } from "@/lib/catalog";
import { formatCurrency } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { useSession } from "@/lib/session";
import { useToast } from "@/components/ui/toast";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";

type QuickViewModalProps = {
  product: Product;
  open: boolean;
  onClose: () => void;
};

export function QuickViewModal({ product, open, onClose }: QuickViewModalProps) {
  const [activeIndex, setActiveIndex] = useState(0);
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

    addItem(product, product.sizes[0]);
    showToast(`${product.name} adicionado ao carrinho`);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={product.name}
      className="max-w-md"
    >
      <div>
        <div className="relative aspect-square overflow-hidden rounded-xl bg-graphite-light">
          <Image
            src={product.images[activeIndex] ?? product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
          {hasPromotion ? (
            <Badge className="absolute left-3 top-3">Oferta</Badge>
          ) : null}
        </div>

        {product.images.length > 1 ? (
          <div className="mt-4 flex gap-3">
            {product.images.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={
                  index === 0 ? "Foto da frente" : "Foto das costas"
                }
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

        <div className="mt-5">
          {category ? (
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500">
              {category.name}
            </p>
          ) : null}
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-brand">
              {formatCurrency(price)}
            </span>
            {hasPromotion ? (
              <span className="text-base text-neutral-500 line-through">
                {formatCurrency(product.price)}
              </span>
            ) : null}
          </div>
          <p
            className={`mt-1 text-xs font-medium ${
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
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={soldOut || product.sizes.length === 0}
          className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand text-sm font-bold uppercase tracking-wider text-ink transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ShoppingCart size={18} />
          Adicionar ao carrinho
        </button>
      </div>
    </Modal>
  );
}
