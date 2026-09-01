"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import type { Product, ProductSize } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { ProductCard } from "./ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";

type CatalogProductsProps = {
  products: Product[];
  initialQuery?: string;
};

type SortOption = "relevancia" | "menor-preco" | "maior-preco" | "novidades" | "nome";

const sortLabels: Record<SortOption, string> = {
  relevancia: "Relevância",
  "menor-preco": "Menor preço",
  "maior-preco": "Maior preço",
  novidades: "Mais recentes",
  nome: "Nome A-Z",
};

const knownSizes: ProductSize[] = ["PP", "P", "M", "G", "GG", "XG", "U", "38", "40", "42", "44", "46", "48", "50"];

export function CatalogProducts({ products, initialQuery = "" }: CatalogProductsProps) {
  const [query, setQuery] = useState(initialQuery);
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [selectedSizes, setSelectedSizes] = useState<ProductSize[]>([]);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [availability, setAvailability] = useState<"all" | "in" | "out">("all");
  const [sort, setSort] = useState<SortOption>("relevancia");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const minPrice = useMemo(
    () => Math.min(0, ...products.map((p) => p.promotionalPrice ?? p.price)),
    [products],
  );
  const maxAvailablePrice = useMemo(
    () => Math.max(...products.map((p) => p.promotionalPrice ?? p.price)),
    [products],
  );

  const allSizes = useMemo(() => {
    const set = new Set<ProductSize>();
    products.forEach((p) => p.sizes.forEach((s) => set.add(s)));
    return knownSizes.filter((s) => set.has(s));
  }, [products]);

  const filtered = useMemo(() => {
    let list = products;

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.subcategory || "").toLowerCase().includes(q),
      );
    }

    if (selectedSizes.length > 0) {
      list = list.filter((p) => p.sizes.some((s) => selectedSizes.includes(s)));
    }

    if (maxPrice !== null) {
      list = list.filter((p) => (p.promotionalPrice ?? p.price) <= maxPrice);
    }

    if (availability === "in") {
      list = list.filter((p) => p.stock > 0);
    } else if (availability === "out") {
      list = list.filter((p) => p.stock <= 0);
    }

    const sorted = [...list];
    switch (sort) {
      case "menor-preco":
        sorted.sort((a, b) => (a.promotionalPrice ?? a.price) - (b.promotionalPrice ?? b.price));
        break;
      case "maior-preco":
        sorted.sort((a, b) => (b.promotionalPrice ?? b.price) - (a.promotionalPrice ?? a.price));
        break;
      case "nome":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }
    return sorted;
  }, [products, query, selectedSizes, maxPrice, availability, sort]);

  function toggleSize(size: ProductSize) {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size],
    );
  }

  function resetFilters() {
    setSelectedSizes([]);
    setMaxPrice(null);
    setAvailability("all");
    setQuery("");
    setSearchInput("");
  }

  const hasActiveFilters =
    selectedSizes.length > 0 || maxPrice !== null || availability !== "all" || query.trim().length > 0;

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setQuery(searchInput);
          }}
          className="order-2 flex-1 sm:order-1 sm:max-w-sm"
        >
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar nesta categoria..."
            className="w-full rounded-xl border border-graphite-border bg-graphite px-4 py-3 text-sm text-white placeholder:text-neutral-500 outline-none transition-colors focus:border-brand"
          />
        </form>

        <div className="order-1 flex items-center gap-2 sm:order-2">
          <button
            type="button"
            onClick={() => setFiltersOpen((prev) => !prev)}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
              filtersOpen || hasActiveFilters
                ? "border-brand bg-brand/10 text-brand"
                : "border-graphite-border text-neutral-400 hover:border-neutral-500 hover:text-white"
            }`}
          >
            <SlidersHorizontal size={15} />
            Filtros
            {hasActiveFilters ? (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand text-[10px] font-black text-ink">
                {selectedSizes.length + (maxPrice !== null ? 1 : 0) + (availability !== "all" ? 1 : 0) + (query.trim() ? 1 : 0)}
              </span>
            ) : null}
          </button>

          <label className="sr-only" htmlFor="sort-select">
            Ordenar produtos
          </label>
          <select
            id="sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="rounded-xl border border-graphite-border bg-graphite px-3 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-300 outline-none transition-colors focus:border-brand"
          >
            {Object.entries(sortLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtersOpen ? (
        <div className="mb-8 rounded-2xl border border-graphite-border bg-graphite p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
              Filtros
            </p>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-neutral-400 transition-colors hover:text-white"
              >
                <X size={13} />
                Limpar
              </button>
            ) : null}
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-neutral-500">
                Preço máximo
              </p>
              <div className="flex flex-col gap-2">
                <input
                  type="range"
                  min={minPrice}
                  max={maxAvailablePrice}
                  step={5}
                  value={maxPrice ?? maxAvailablePrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="accent-brand"
                />
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span>Até {formatCurrency(maxPrice ?? maxAvailablePrice)}</span>
                  {maxPrice !== null && maxPrice < maxAvailablePrice ? (
                    <button
                      type="button"
                      onClick={() => setMaxPrice(null)}
                      className="text-neutral-500 underline hover:text-white"
                    >
                      limpar
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-neutral-500">
                Tamanho
              </p>
              <div className="flex flex-wrap gap-2">
                {allSizes.map((size) => {
                  const selected = selectedSizes.includes(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleSize(size)}
                      className={`min-w-[2.5rem] rounded-lg px-3 py-2 text-sm font-bold uppercase tracking-wider transition-colors ${
                        selected
                          ? "bg-brand text-ink"
                          : "border border-graphite-border text-neutral-400 hover:border-neutral-500 hover:text-white"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-neutral-500">
                Disponibilidade
              </p>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["all", "Todos"],
                    ["in", "Em estoque"],
                    ["out", "Esgotado"],
                  ] as const
                ).map(([value, label]) => {
                  const selected = availability === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setAvailability(value)}
                      className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                        selected
                          ? "border-brand bg-brand text-ink"
                          : "border-graphite-border text-neutral-400 hover:border-neutral-500 hover:text-white"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <p className="mb-6 text-sm font-medium text-neutral-500">
        {filtered.length} {filtered.length === 1 ? "produto" : "produtos"}
      </p>

      {filtered.length === 0 ? (
        <EmptyState
          title="Nenhum produto encontrado"
          description="Tente ajustar os filtros ou buscar por outro termo."
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
