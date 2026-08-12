"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronDown, LogOut, Menu, ShieldCheck, ShoppingBag, UserPlus, UserRound, X } from "lucide-react";
import { categories } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { useSession } from "@/lib/session";

const navLinks = [
  { label: "Inicio", href: "/" },
  { label: "Produtos", href: "/produtos" },
  { label: "Contato", href: "/contato" },
  { label: "Sobre", href: "/sobre" },
];

const categoryOrder = [
  "bermudas",
  "calcas",
  "camisetas",
  "meias",
  "cuecas",
  "acessorios",
  "agasalhos",
  "regatas",
];

const navbarCategories = categoryOrder
  .map((slug) => categories.find((category) => category.slug === slug))
  .filter((category) => category !== undefined);

export function Navbar() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, refresh } = useSession();
  const { count } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    refresh();
    router.refresh();
  }

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        scrolled || menuOpen
          ? "border-graphite-border bg-ink/95 backdrop-blur"
          : "border-transparent bg-ink"
      }`}
    >
      <nav className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="VIZION STORE">
          <Image
            src="/images/logo.svg"
            alt=""
            width={36}
            height={36}
            className="h-9 w-9"
            priority
          />
          <span className="font-display text-2xl tracking-widest text-white">
            VIZION<span className="text-brand">.</span>
          </span>
        </Link>

        <ul className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) =>
            link.label === "Produtos" ? (
              <li key={link.label} className="group relative">
                <button
                  type="button"
                  className="flex items-center gap-1 text-sm font-medium uppercase tracking-widest text-neutral-400 transition-colors hover:text-white"
                >
                  {link.label}
                  <ChevronDown size={14} className="transition-transform duration-300 group-hover:rotate-180" />
                </button>
                <div className="invisible absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <div className="w-56 rounded-xl border border-graphite-border bg-graphite p-2 shadow-xl shadow-black/40">
                    <Link
                      href="/produtos"
                      className="block rounded-lg px-4 py-2.5 text-sm font-semibold uppercase tracking-wider text-brand transition-colors hover:bg-graphite-light"
                    >
                      Todos os produtos
                    </Link>
                    {navbarCategories.map((category) => (
                      <Link
                        key={category.slug}
                        href={`/produtos/${category.slug}`}
                        className="block rounded-lg px-4 py-2.5 text-sm text-white transition-colors hover:bg-graphite-light hover:text-brand"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </li>
            ) : (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-sm font-medium uppercase tracking-widest text-neutral-400 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ),
          )}
        </ul>

        <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {user.role === "ADMIN" ? (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 text-sm font-semibold text-[#B6FF00] hover:text-white"
                >
                  <ShieldCheck size={18} />
                  <span className="hidden sm:inline">Painel Admin</span>
                </Link>
              ) : null}
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 text-white hover:text-[#B6FF00]"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                aria-label="Login"
                className="flex items-center gap-2 text-white hover:text-[#B6FF00]"
              >
                <UserRound size={18} />
                <span className="hidden lg:inline">Login</span>
              </Link>

              <Link
                href="/cadastro"
                aria-label="Cadastre-se"
                className="flex items-center gap-2 text-white hover:text-[#B6FF00]"
              >
                <UserPlus size={18} />
                <span className="hidden lg:inline">Cadastre-se</span>
              </Link>
            </>
          )}
        </div>
          <Link
            href="/carrinho"
            aria-label={`Carrinho, ${count} ${count === 1 ? "item" : "itens"}`}
            className="relative flex h-10 w-10 items-center justify-center text-neutral-400 transition-colors hover:text-brand"
          >
            <ShoppingBag size={20} />
            {count > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-ink">
                {count}
              </span>
            ) : null}
          </Link>

          <button
            type="button"
            onClick={() => {
              setProductsOpen(false);
              setMenuOpen((prev) => !prev);
            }}
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
            className="flex h-10 w-10 items-center justify-center text-white transition-colors hover:text-brand lg:hidden"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {menuOpen ? (
        <div className="max-h-[calc(100vh-9rem)] overflow-y-auto border-t border-graphite-border bg-ink lg:hidden">
          <ul className="mx-auto flex w-full max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6">
            {navLinks.map((link) =>
              link.label === "Produtos" ? (
                <li key={link.label}>
                  <button
                    type="button"
                    onClick={() => setProductsOpen((prev) => !prev)}
                    aria-expanded={productsOpen}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-base font-semibold uppercase tracking-widest text-white transition-colors hover:bg-graphite-light hover:text-brand"
                  >
                    {link.label}
                    <ChevronDown
                      size={18}
                      className={`transition-transform duration-300 ${productsOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {productsOpen ? (
                    <ul className="mt-1 space-y-1 border-l border-graphite-border pl-4">
                      <li>
                        <Link
                          href="/produtos"
                          onClick={() => setMenuOpen(false)}
                          className="block rounded-lg px-3 py-2.5 text-sm font-semibold uppercase tracking-wider text-brand transition-colors hover:bg-graphite-light"
                        >
                          Todos os produtos
                        </Link>
                      </li>
                      {navbarCategories.map((category) => (
                        <li key={category.slug}>
                          <Link
                            href={`/produtos/${category.slug}`}
                            onClick={() => setMenuOpen(false)}
                            className="block rounded-lg px-3 py-2.5 text-sm text-white transition-colors hover:bg-graphite-light hover:text-brand"
                          >
                            {category.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ) : (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg px-3 py-3 text-base font-semibold uppercase tracking-widest text-white transition-colors hover:bg-graphite-light hover:text-brand"
                  >
                    {link.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </div>
      ) : null}
    </header>
  );
}
