"use client";

import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { useState } from "react";
import { useSession } from "@/lib/session";

export function FloatingPromo() {
  const { user, loading } = useSession();
  const [visible, setVisible] = useState(true);

  if (loading) return null;
  if (user) return null;
  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 sm:bottom-3">
      <div className="relative mx-2 mb-2 max-w-[560px] overflow-hidden rounded-xl border border-graphite-border bg-graphite shadow-xl shadow-black/50 sm:mx-auto sm:rounded-2xl sm:mb-0">
        <button
          type="button"
          onClick={() => setVisible(false)}
          aria-label="Fechar"
          className="absolute right-1.5 top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:bg-black"
        >
          <X size={14} />
        </button>

        <Link href="/cadastro" className="block">
          <Image
            src="/images/5%off.png"
            alt="5% OFF VIZION STORE"
            width={1693}
            height={929}
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