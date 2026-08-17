"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Percent, Truck } from "lucide-react";

export function FloatingPromo() {
  const router = useRouter();
  const [aberto, setAberto] = useState(true);

  if (!aberto) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 sm:bottom-6">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-graphite-border bg-graphite shadow-2xl shadow-black/50">
        <button
          onClick={() => setAberto(false)}
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-graphite-light text-neutral-400 transition hover:text-white"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="bg-brand px-4 py-2 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-black">
            Oferta por tempo limitado
          </p>
        </div>

        <div className="p-5">
          <h3 className="mb-4 text-center font-display text-2xl leading-tight tracking-wide text-white sm:text-3xl">
            PAGUE PELO<br />
            <span className="text-brand">PIX E GANHE 5% OFF</span>
          </h3>

          <div className="mb-5 space-y-2.5">
            <div className="flex items-center gap-3 rounded-lg bg-graphite-light/50 px-3.5 py-2.5">
              <Percent className="h-5 w-5 shrink-0 text-brand" />
              <p className="text-sm text-neutral-300">
                <span className="font-semibold text-white">5% de desconto</span>{" "}
                ao pagar pelo PIX
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-graphite-light/50 px-3.5 py-2.5">
              <Truck className="h-5 w-5 shrink-0 text-brand" />
              <p className="text-sm text-neutral-300">
                <span className="font-semibold text-white">Frete grátis</span>{" "}
                em compras acima de R$ 200
              </p>
            </div>
          </div>

          <button
            onClick={() => setAberto(false)}
            className="block w-full rounded-lg bg-brand py-3 text-center text-sm font-bold uppercase tracking-wider text-black transition hover:bg-brand-dark"
          >
            ENTENDI
          </button>
        </div>
      </div>
    </div>
  );
}
