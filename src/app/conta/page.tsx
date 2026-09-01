"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/session";
import { ContaPerfil } from "@/components/conta/ContaPerfil";
import { ContaSenha } from "@/components/conta/ContaSenha";
import { ContaPedidos } from "@/components/conta/ContaPedidos";
import { ContaFavoritos } from "@/components/conta/ContaFavoritos";
import {
  User,
  Lock,
  ShoppingBag,
  LogOut,
  Heart,
} from "lucide-react";

type Tab = "perfil" | "senha" | "pedidos" | "favoritos";

export default function ContaPage() {
  const router = useRouter();
  const { user, loading, refresh } = useSession();
  const [tab, setTab] = useState<Tab>("perfil");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/conta");
    }
  }, [loading, user, router]);

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    refresh();
    router.push("/");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black">
        <p className="text-zinc-400">Carregando...</p>
      </main>
    );
  }

  if (!user) return null;

  const tabs: { key: Tab; label: string; icon: typeof User }[] = [
    { key: "perfil", label: "Meus Dados", icon: User },
    { key: "senha", label: "Alterar Senha", icon: Lock },
    { key: "pedidos", label: "Meus Pedidos", icon: ShoppingBag },
    { key: "favoritos", label: "Favoritos", icon: Heart },
  ];

  return (
    <main className="min-h-screen bg-black px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">MINHA CONTA</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Gerencie seus dados e acompanhe seus pedidos.
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${
                tab === t.key
                  ? "bg-[#B6FF00] text-black"
                  : "border border-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              <t.icon size={16} />
              {t.label}
            </button>
          ))}
          <button
            type="button"
            onClick={handleLogout}
            className="flex shrink-0 items-center gap-2 rounded-lg border border-zinc-800 px-4 py-3 text-sm font-semibold text-zinc-400 transition-colors hover:text-red-400"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8">
          {tab === "perfil" && <ContaPerfil />}
          {tab === "senha" && <ContaSenha />}
          {tab === "pedidos" && <ContaPedidos />}
          {tab === "favoritos" && <ContaFavoritos />}
        </div>
      </div>
    </main>
  );
}
