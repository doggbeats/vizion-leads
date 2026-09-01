"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type ProductMini = {
  id: string;
  name: string;
  price: number;
  promotionalPrice?: number;
  images: string[];
  category: string;
  stock: number;
  sizes: string[];
  colors?: string[];
};

type RecentlyViewedContextValue = {
  items: ProductMini[];
  add: (product: ProductMini) => void;
};

const STORAGE_KEY = "vizion-recently-viewed";
const MAX_ITEMS = 12;

function loadItems(): ProductMini[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveItems(items: ProductMini[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

const RecentlyViewedContext = createContext<RecentlyViewedContextValue | null>(null);

export function RecentlyViewedProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ProductMini[]>(() => loadItems());

  useEffect(() => {
    saveItems(items);
  }, [items]);

  const add = useCallback((product: ProductMini) => {
    setItems((prev) => {
      const filtered = prev.filter((i) => i.id !== product.id);
      return [product, ...filtered].slice(0, MAX_ITEMS);
    });
  }, []);

  const value = useMemo(() => ({ items, add }), [items, add]);

  return (
    <RecentlyViewedContext.Provider value={value}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed(): RecentlyViewedContextValue {
  const context = useContext(RecentlyViewedContext);
  if (!context) {
    throw new Error("useRecentlyViewed deve ser usado dentro de <RecentlyViewedProvider>");
  }
  return context;
}
