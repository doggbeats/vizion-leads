"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import {
  getSubcategories,
  getSubcategoryLabel,
} from "@/lib/catalog";
import { CatalogProducts } from "./CatalogProducts";

type CategoryProductsProps = {
  products: Product[];
  categorySlug: string;
};

export function CategoryProducts({
  products,
  categorySlug,
}: CategoryProductsProps) {
  const subcategories = getSubcategories(categorySlug);
  const [activeSubcategory, setActiveSubcategory] = useState("all");

  const filteredProducts =
    activeSubcategory === "all"
      ? products
      : products.filter(
          (product) => product.subcategory === activeSubcategory,
        );

  return (
    <div>
      {subcategories.length > 0 ? (
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveSubcategory("all")}
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
              activeSubcategory === "all"
                ? "border-brand bg-brand text-ink"
                : "border-graphite-border bg-graphite text-neutral-300 hover:border-brand/60 hover:text-white"
            }`}
          >
            Todos
          </button>
          {subcategories.map((subcategory) => (
            <button
              key={subcategory}
              type="button"
              onClick={() => setActiveSubcategory(subcategory)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeSubcategory === subcategory
                  ? "border-brand bg-brand text-ink"
                  : "border-graphite-border bg-graphite text-neutral-300 hover:border-brand/60 hover:text-white"
              }`}
            >
              {getSubcategoryLabel(subcategory)}
            </button>
          ))}
        </div>
      ) : null}

      <CatalogProducts products={filteredProducts} />
    </div>
  );
}
