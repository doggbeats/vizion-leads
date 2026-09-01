"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type FavoritesContextValue = {
  ids: string[];
  isFavorite: (id: string) => boolean;
  toggle: (id: string) => void;
  remove: (id: string) => void;
};

const STORAGE_KEY = "vizion-favorites";

function loadIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveIds(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>(() => loadIds());

  useEffect(() => {
    saveIds(ids);
  }, [ids]);

  const toggle = useCallback((id: string) => {
    setIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }, []);

  const remove = useCallback((id: string) => {
    setIds((prev) => prev.filter((i) => i !== id));
  }, []);

  const isFavorite = useCallback((id: string) => ids.includes(id), [ids]);

  const value = useMemo(() => ({ ids, isFavorite, toggle, remove }), [ids, isFavorite, toggle, remove]);

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites deve ser usado dentro de <FavoritesProvider>");
  }
  return context;
}
