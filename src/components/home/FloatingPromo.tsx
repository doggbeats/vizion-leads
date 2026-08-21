"use client";

import { Percent, Truck } from "lucide-react";
import { useSession } from "@/lib/session";

export function FloatingPromo() {
  const { user, loading } = useSession();

  if (loading) return null;
  if (user) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 sm:bottom-3">
      <div className="relative mx-2 mb-2 max-w-[calc(100vw-1rem)] overflow-hidden rounded-xl border border-graphite-border bg-graphite shadow-xl shadow-black/50 sm:mx-auto sm:max-w-sm sm:rounded-2xl sm:mb-0">
        <div className="bg-brand px-2 py-0.5 text-center sm:px-3 sm:py-1">
          <p className="text-[8px] font-bold uppercase tracking-widest text-black sm:text-[9px] md:text-[10px]">
            Oferta por tempo limitado
          </p>
        </div>

        <div className="p-2.5 sm:p-4">
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
