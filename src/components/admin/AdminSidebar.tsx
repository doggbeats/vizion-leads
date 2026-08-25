"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingBag,
  Star,
  LayoutGrid,
  LogOut,
  ExternalLink,
  Key,
} from "lucide-react";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag },
  { href: "/admin/produtos", label: "Produtos", icon: Package },
  { href: "/admin/destaques", label: "Destaques", icon: Star },
  { href: "/admin/categorias", label: "Categorias", icon: LayoutGrid },
  { href: "/admin/alterar-senha", label: "Alterar Senha", icon: Key },
];

export function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <aside className="hidden w-64 shrink-0 flex-col border-r border-graphite-border bg-graphite lg:flex">
        <div className="border-b border-graphite-border p-6">
          <Link href="/admin" className="font-display text-3xl tracking-widest">
            <span className="text-white">VIZI</span>
            <span className="text-brand">ON</span>
          </Link>
          <p className="mt-1 text-xs uppercase tracking-[0.3em] text-neutral-500">
            Painel Admin
          </p>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-brand text-ink"
                    : "text-neutral-400 hover:bg-graphite-light hover:text-white"
                }`}
              >
                <link.icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-1 border-t border-graphite-border p-4">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-neutral-400 transition-colors hover:bg-graphite-light hover:text-white"
          >
            <ExternalLink size={18} />
            Ver loja
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-neutral-400 transition-colors hover:bg-graphite-light hover:text-white"
          >
            <LogOut size={18} />
            Sair
          </button>
          <p className="px-4 pt-2 text-xs text-neutral-500">{adminName}</p>
        </div>
      </aside>

      <div className="flex flex-col border-b border-graphite-border bg-graphite lg:hidden">
        <div className="flex items-center justify-between p-4">
          <Link href="/admin" className="font-display text-2xl tracking-widest">
            <span className="text-white">VIZI</span>
            <span className="text-brand">ON</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-neutral-400 transition-colors hover:text-white"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
        <nav className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-4">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  active
                    ? "bg-brand text-ink"
                    : "border border-graphite-border text-neutral-400 hover:text-white"
                }`}
              >
                <link.icon size={15} />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
