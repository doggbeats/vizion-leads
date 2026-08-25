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
import { calculateCartTotal } from "./promo";

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  promoResult: import("./promo").PromoResult;
  loaded: boolean;
  addItem: (product: Product, size: ProductSize, quantity?: number, color?: string) => void;
  removeItem: (productId: string, size: ProductSize, color?: string) => void;
  updateQuantity: (productId: string, size: ProductSize, quantity: number, color?: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "vizion-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const stored = JSON.parse(raw) as CartItem[];
        window.setTimeout(() => {
          setItems(stored);
          setLoaded(true);
        }, 0);
        return;
      }
    } catch {
      // storage indisponível ou dado corrompido
    }
    window.setTimeout(() => setLoaded(true), 0);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage indisponível
    }
  }, [items]);

  const addItem = useCallback(
    (product: Product, size: ProductSize, quantity = 1, color?: string) => {
      setItems((prev) => {
        const index = prev.findIndex(
          (item) =>
            item.product.id === product.id &&
            item.size === size &&
            (item.color ?? "") === (color ?? ""),
        );
        if (index >= 0) {
          const next = [...prev];
          next[index] = {
            ...next[index],
            quantity: next[index].quantity + quantity,
          };
          return next;
        }
        return [...prev, { product, size, quantity, color }];
      });
    },
    [],
  );

  const removeItem = useCallback((productId: string, size: ProductSize, color?: string) => {
    setItems((prev) =>
      prev.filter(
        (item) =>
          !(
            item.product.id === productId &&
            item.size === size &&
            (item.color ?? "") === (color ?? "")
          ),
      ),
    );
  }, []);

  const updateQuantity = useCallback(
    (productId: string, size: ProductSize, quantity: number, color?: string) => {
      setItems((prev) =>
        prev.map((item) =>
          item.product.id === productId &&
          item.size === size &&
          (item.color ?? "") === (color ?? "")
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

  const promoResult = useMemo(() => calculateCartTotal(items), [items]);

  const subtotal = useMemo(() => promoResult.total, [promoResult]);

  const value = useMemo(
    () => ({
      items,
      count,
      subtotal,
      promoResult,
      loaded,
      addItem,
      removeItem,
      updateQuantity,
      clear,
    }),
    [items, count, subtotal, promoResult, loaded, addItem, removeItem, updateQuantity, clear],
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
