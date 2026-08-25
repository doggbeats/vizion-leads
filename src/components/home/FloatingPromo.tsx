"use client";

import { useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { useSession } from "@/lib/session";

const STORAGE_KEY = "floating-sorteio-fechado";
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
  return sessionStorage.getItem(STORAGE_KEY) === "1";
}

export function FloatingPromo() {
  const { user, loading } = useSession();
  const fechado = useSyncExternalStore(inscrever, estaFechado, () => false);

  function fechar() {
    sessionStorage.setItem(STORAGE_KEY, "1");
    window.dispatchEvent(new Event(EVENTO));
  }

  if (loading) return null;
  if (user) return null;
  if (fechado) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 sm:bottom-3">
      <div className="relative mx-2 mb-2 max-w-[480px] overflow-hidden rounded-xl border border-graphite-border bg-graphite shadow-xl shadow-black/50 sm:mx-auto sm:rounded-2xl sm:mb-0">
        <button
          type="button"
          onClick={fechar}
          aria-label="Fechar"
          className="absolute right-1.5 top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:bg-black"
        >
          <X size={14} />
        </button>

        <Link href="/cadastro" className="block">
          <Image
            src="/images/banner_sorteio.jpg"
            alt="Sorteio VIZION STORE"
            width={1024}
            height={968}
            className="w-full h-auto"
            priority
          />
        </Link>

        <div className="p-2 pt-0">
          <Link
            href="/cadastro"
            className="block w-full rounded-lg bg-brand py-2 text-center text-[11px] font-bold uppercase tracking-wider text-black transition hover:bg-brand-dark"
          >
            Cadastre-se
          </Link>
        </div>
      </div>
    </div>
  );
}
