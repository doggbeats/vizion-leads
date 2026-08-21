"use client";

import { useSyncExternalStore } from "react";
import { Percent, Truck, X } from "lucide-react";
import { useSession } from "@/lib/session";

const STORAGE_KEY = "floating-promo-fechado";
const EVENTO = "floating-promo-change";

function inscrever(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(EVENTO, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(EVENTO, callback);
  };
}

function estaFechado() {
  return window.localStorage.getItem(STORAGE_KEY) === "1";
}

export function FloatingPromo() {
  const { user, loading } = useSession();
  const fechado = useSyncExternalStore(inscrever, estaFechado, () => true);

  function fechar() {
    window.localStorage.setItem(STORAGE_KEY, "1");
    window.dispatchEvent(new Event(EVENTO));
  }

  if (loading) return null;
  if (user) return null;
  if (fechado) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 sm:bottom-3">
      <div className="relative mx-2 mb-2 max-w-[calc(100vw-1rem)] overflow-hidden rounded-xl border border-graphite-border bg-graphite shadow-xl shadow-black/50 sm:mx-auto sm:max-w-sm sm:rounded-2xl sm:mb-0">
        <div className="bg-brand px-2 py-0.5 text-center sm:px-3 sm:py-1">
          <p className="text-[8px] font-bold uppercase tracking-widest text-black sm:text-[9px] md:text-[10px]">
            Oferta por tempo limitado
          </p>
        </div>

        <button
          type="button"
          onClick={fechar}
          aria-label="Fechar promoção"
          className="absolute right-1.5 top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:bg-black sm:h-7 sm:w-7"
        >
          <X size={14} />
        </button>

        <div className="p-2.5 pt-4 sm:p-4">
          <h3 className="mb-1.5 text-center font-display text-base leading-tight tracking-wide text-white sm:mb-3 sm:text-lg md:text-xl">
            PAGUE PELO<br />
            <span className="text-brand">PIX E GANHE 5% OFF</span>
          </h3>

          <div className="mb-2 space-y-1 sm:mb-3 sm:space-y-1.5">
            <div className="flex items-center gap-1.5 rounded-lg bg-graphite-light/50 px-2 py-1.5 sm:gap-2 sm:px-3 sm:py-2">
              <Percent className="h-3 w-3 shrink-0 text-brand sm:h-4 sm:w-4" />
              <p className="text-[10px] text-neutral-300 sm:text-xs">
                <span className="font-semibold text-white">5% de desconto</span>{" "}
                ao pagar pelo PIX
              </p>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-graphite-light/50 px-2 py-1.5 sm:gap-2 sm:px-3 sm:py-2">
              <Truck className="h-3 w-3 shrink-0 text-brand sm:h-4 sm:w-4" />
              <p className="text-[10px] text-neutral-300 sm:text-xs">
                <span className="font-semibold text-white">Frete grátis</span>{" "}
                em compras acima de R$ 199,90
              </p>
            </div>
          </div>

          <a
            href="/cadastro"
            className="block w-full rounded-lg bg-brand py-1.5 text-center text-[10px] font-bold uppercase tracking-wider text-black transition hover:bg-brand-dark sm:py-2.5 sm:text-xs"
          >
            QUERO MEU DESCONTO
          </a>
        </div>
      </div>
    </div>
  );
}
