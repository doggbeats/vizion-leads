"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartItem, Product, ProductSize } from "./types";

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (product: Product, size: ProductSize, quantity?: number) => void;
  removeItem: (productId: string, size: ProductSize) => void;
  updateQuantity: (productId: string, size: ProductSize, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "vizion-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const stored = JSON.parse(raw) as CartItem[];
        window.setTimeout(() => setItems(stored), 0);
      }
    } catch {
      // storage indisponível ou dado corrompido
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage indisponível
    }
  }, [items]);

  const addItem = useCallback(
    (product: Product, size: ProductSize, quantity = 1) => {
      setItems((prev) => {
        const index = prev.findIndex(
          (item) => item.product.id === product.id && item.size === size,
        );
        if (index >= 0) {
          const next = [...prev];
          next[index] = {
            ...next[index],
            quantity: next[index].quantity + quantity,
          };
          return next;
        }
        return [...prev, { product, size, quantity }];
      });
    },
    [],
  );

  const removeItem = useCallback((productId: string, size: ProductSize) => {
    setItems((prev) =>
      prev.filter(
        (item) => !(item.product.id === productId && item.size === size),
      ),
    );
  }, []);

  const updateQuantity = useCallback(
    (productId: string, size: ProductSize, quantity: number) => {
      setItems((prev) =>
        prev.map((item) =>
          item.product.id === productId && item.size === size
            ? { ...item, quantity: Math.max(1, quantity) }
            : item,
        ),
      );
    },
    [],
  );

  const clear = useCallback(() => setItems([]), []);

  const count = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items],
  );

  const subtotal = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total +
          item.quantity *
            (item.product.promotionalPrice ?? item.product.price),
        0,
      ),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      count,
      subtotal,
      addItem,
      removeItem,
      updateQuantity,
      clear,
    }),
    [items, count, subtotal, addItem, removeItem, updateQuantity, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart deve ser usado dentro de <CartProvider>");
  }
  return context;
}
