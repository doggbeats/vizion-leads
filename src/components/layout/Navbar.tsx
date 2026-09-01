"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ChevronDown,
  Flame,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
  ShoppingBag,
  User,
  UserPlus,
  UserRound,
  X,
} from "lucide-react";
import { categories, getCategoryBySlug } from "@/lib/catalog";
import { formatCurrency } from "@/lib/format";
import type { Product } from "@/lib/types";
import { useCart } from "@/lib/cart";
import { useSession } from "@/lib/session";

const navLinks = [
  { label: "Inicio", href: "/" },
  { label: "Produtos", href: "/produtos" },
  { label: "Promoção", href: "/promocao", icon: true },
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
  "moletom",
  "corta-vento",
  "regatas",
];

const navbarCategories = categoryOrder
  .map((slug) => categories.find((category) => category.slug === slug))
  .filter((category) => category !== undefined);

const categoryIcons: Record<string, string> = {
  bermudas: "🩳",
  calcas: "👖",
  camisetas: "👕",
  meias: "🧦",
  cuecas: "🩲",
  acessorios: "⌚",
  moletom: "🧥",
  "corta-vento": "🌬️",
  regatas: "🎽",
};

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { user, refresh } = useSession();
  const { count } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setProductsOpen(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!searchOpen || trimmed.length < 2) {
      return;
    }

    let active = true;
    const timeout = window.setTimeout(async () => {
      setSearching(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        const data = await response.json().catch(() => ({}));
        if (active && searchQuery.trim() === trimmed) {
          setSearchResults(data.products ?? []);
        }
      } catch {
        if (active) setSearchResults([]);
      } finally {
        if (active) setSearching(false);
      }
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [searchQuery, searchOpen]);

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    refresh();
    router.refresh();
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/produtos?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  }

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
    setProductsOpen(false);
  }, [pathname]);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <>
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-500 ${
        scrolled || menuOpen
          ? "border-white/[0.06] bg-black/70 shadow-[0_1px_40px_-12px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
          : "border-transparent bg-black/40 backdrop-blur-md"
      }`}
    >
      <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-6 px-5 sm:px-8 lg:px-10">
        {/* Logo */}
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-3"
          aria-label="VIZION STORE"
        >
          <Image
            src="/images/logo.svg"
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 transition-all duration-500 group-hover:rotate-6 group-hover:scale-110"
            priority
          />
          <span className="font-display text-[1.65rem] leading-none tracking-[0.2em]">
            <span className="text-white transition-colors duration-300 group-hover:text-white">
              VIZI
            </span>
            <span className="text-brand transition-colors duration-300 group-hover:text-white">
              ON
            </span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden items-center gap-0.5 lg:flex">
          {navLinks.map((link) =>
            link.label === "Produtos" ? (
              <li key={link.label} className="group relative">
                <Link
                  href={link.href}
                  className={`relative flex items-center gap-1.5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] transition-all duration-300 ${
                    isActive(link.href)
                      ? "text-brand"
                      : "text-[#888] hover:text-white"
                  }`}
                >
                  {link.label}
                  <ChevronDown
                    size={12}
                    className="transition-transform duration-300 group-hover:rotate-180"
                  />
                  <span
                    className={`absolute -bottom-1 left-4 right-4 h-px transition-all duration-300 ${
                      isActive(link.href)
                        ? "scale-x-100 bg-brand"
                        : "scale-x-0 bg-white group-hover:scale-x-100"
                    }`}
                  />
                </Link>

                {/* Mega Menu */}
                <div className="invisible absolute left-1/2 top-full z-50 -translate-x-1/2 pt-5 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <div className="w-[480px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111]/95 p-5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] backdrop-blur-2xl">
                    <p className="mb-3 px-1 text-[10px] font-bold uppercase tracking-[0.25em] text-[#555]">
                      Categorias
                    </p>

                    <Link
                      href="/produtos"
                      className="mb-3 flex items-center justify-between rounded-xl border border-brand/20 bg-brand/[0.07] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-brand transition-all duration-200 hover:border-brand/40 hover:bg-brand/[0.12]"
                    >
                      Ver todos os produtos
                      <span className="text-sm">→</span>
                    </Link>

                    <div className="grid grid-cols-2 gap-1">
                      {navbarCategories.map((category) => (
                        <Link
                          key={category.slug}
                          href={`/produtos/${category.slug}`}
                          className="group/item flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#aaa] transition-all duration-200 hover:bg-white/[0.04] hover:text-white"
                        >
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04] text-sm transition-all duration-200 group-hover/item:bg-white/[0.08] group-hover/item:text-brand">
                            {categoryIcons[category.slug] || "📦"}
                          </span>
                          <span className="font-medium tracking-wide">
                            {category.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </li>
            ) : (
              <li key={link.label} className="relative">
                <Link
                  href={link.href}
                  className={`relative flex items-center gap-1.5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] transition-all duration-300 ${
                    isActive(link.href)
                      ? "text-brand"
                      : link.icon
                        ? "text-red-400 hover:text-red-300"
                        : "text-[#888] hover:text-white"
                  }`}
                >
                  {link.icon && <Flame size={12} />}
                  {link.label}
                  <span
                    className={`absolute -bottom-1 left-4 right-4 h-px transition-all duration-300 ${
                      isActive(link.href)
                        ? "scale-x-100 bg-brand"
                        : "scale-x-0 bg-white group-hover:scale-x-100"
                    }`}
                  />
                </Link>
              </li>
            ),
          )}
        </ul>

        {/* Right Section */}
        <div className="flex items-center gap-1">
          {/* Search Toggle */}
          <button
            type="button"
            onClick={() => setSearchOpen((prev) => !prev)}
            aria-label="Buscar produtos"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#666] transition-all duration-200 hover:bg-white/[0.05] hover:text-white"
          >
            <Search size={17} />
          </button>

          {/* Auth */}
          <div className="hidden items-center gap-0.5 sm:flex">
            {user ? (
              <>
                <Link
                  href="/conta"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#999] transition-all duration-200 hover:bg-white/[0.05] hover:text-white"
                >
                  <User size={15} />
                  <span className="hidden xl:inline">Minha Conta</span>
                </Link>
                {user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-brand transition-all duration-200 hover:bg-brand/[0.08]"
                  >
                    <ShieldCheck size={15} />
                    <span className="hidden xl:inline">Admin</span>
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#666] transition-all duration-200 hover:bg-white/[0.05] hover:text-white"
                >
                  <LogOut size={15} />
                  <span className="hidden xl:inline">Sair</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#999] transition-all duration-200 hover:bg-white/[0.05] hover:text-white"
                >
                  <UserRound size={15} />
                  <span className="hidden xl:inline">Entrar</span>
                </Link>
                <Link
                  href="/cadastro"
                  className="ml-1 flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-[0.15em] text-black transition-all duration-300 hover:bg-brand hover:shadow-[0_0_24px_-4px_rgba(182,255,0,0.35)]"
                >
                  <UserPlus size={14} />
                  <span className="hidden xl:inline">Cadastrar</span>
                </Link>
              </>
            )}
          </div>

          {/* Cart */}
          <Link
            href="/carrinho"
            aria-label={`Carrinho, ${count} ${count === 1 ? "item" : "itens"}`}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-[#666] transition-all duration-200 hover:bg-white/[0.05] hover:text-brand"
          >
            <ShoppingBag size={18} />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand px-1 text-[9px] font-bold text-black">
                {count}
              </span>
            )}
          </Link>

          {/* Mobile Toggle */}
          <button
            type="button"
            onClick={() => {
              setProductsOpen(false);
              setMenuOpen((prev) => !prev);
            }}
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white transition-all duration-200 hover:bg-white/[0.05] lg:hidden"
          >
            <span className="relative flex h-5 w-5 items-center justify-center">
              <Menu
                size={20}
                className={`absolute transition-all duration-300 ${
                  menuOpen
                    ? "rotate-90 scale-0 opacity-0"
                    : "rotate-0 scale-100 opacity-100"
                }`}
              />
              <X
                size={20}
                className={`absolute transition-all duration-300 ${
                  menuOpen
                    ? "rotate-0 scale-100 opacity-100"
                    : "-rotate-90 scale-0 opacity-0"
                }`}
              />
            </span>
          </button>
        </div>
      </nav>

      {/* Search Bar Overlay */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          searchOpen ? "max-h-[28rem] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-t border-white/[0.05] bg-black/90 backdrop-blur-2xl">
          <form
            onSubmit={handleSearch}
            className="mx-auto flex max-w-7xl items-center gap-3 px-5 py-3 sm:px-8 lg:px-10"
          >
            <Search size={16} className="shrink-0 text-[#555]" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                setSearchQuery(val);
                if (val.trim().length < 2) {
                  setSearchResults([]);
                  setSearching(false);
                }
              }}
              placeholder="Buscar produtos..."
              className="flex-1 bg-transparent text-[13px] tracking-wide text-white placeholder-[#555] outline-none"
            />
            {searching ? (
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-brand border-t-transparent" />
            ) : null}
            <kbd className="hidden rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-[#555] sm:inline">
              ESC
            </kbd>
          </form>

          <div className="mx-auto max-w-7xl border-t border-white/[0.04] px-5 pb-4 sm:px-8 lg:px-10">
            <p className="py-3 text-[10px] font-bold uppercase tracking-[0.25em] text-[#555]">
              Resultados da busca
            </p>
            <ul className="-mx-2 max-h-64 space-y-1 overflow-y-auto px-2">
              {searchResults.map((result) => {
                const hasPromo =
                  result.promotionalPrice !== undefined &&
                  result.promotionalPrice < result.price;
                const p = hasPromo ? result.promotionalPrice! : result.price;
                return (
                  <li key={result.id}>
                    <Link
                      href={`/produto/${result.id}`}
                      onClick={() => {
                        setSearchOpen(false);
                        setSearchQuery("");
                        setSearchResults([]);
                      }}
                      className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-white/[0.04]"
                    >
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-graphite-light">
                        <Image
                          src={result.images[0]}
                          alt=""
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-white">
                          {result.name}
                        </p>
                        <p className="text-[11px] uppercase tracking-wider text-[#666]">
                          {getCategoryBySlug(result.category)?.name ??
                            result.category}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-brand">
                        {formatCurrency(p)}
                      </span>
                    </Link>
                  </li>
                );
              })}
              {searchQuery.trim().length >= 2 && searchResults.length === 0 && !searching ? (
                <li className="px-2 py-4 text-sm text-neutral-500">
                  Nenhum produto encontrado para{" "}
                  <span className="text-neutral-300">&ldquo;{searchQuery.trim()}&rdquo;</span>
                </li>
              ) : null}
              {searchQuery.trim().length < 2 ? (
                <li className="px-2 py-4 text-sm text-neutral-500">
                  Digite ao menos 2 caracteres para buscar.
                </li>
              ) : null}
            </ul>
            {searchResults.length > 0 ? (
              <button
                type="button"
                onClick={handleSearch}
                className="mt-1 w-full rounded-xl border border-brand/20 bg-brand/[0.07] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.15em] text-brand transition-colors hover:bg-brand/[0.12]"
              >
                Ver todos os resultados para &ldquo;{searchQuery.trim()}&rdquo;
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </header>

      {/* Mobile Menu - outside header to avoid stacking context */}
      <div
        className={`lg:hidden ${
          menuOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          className={`fixed inset-0 top-16 z-[55] overflow-y-auto border-t border-white/[0.05] bg-black/95 backdrop-blur-3xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            menuOpen
              ? "translate-x-0 opacity-100"
              : "translate-x-[110%] opacity-0"
          }`}
        >
          <ul className="mx-auto flex w-full max-w-7xl flex-col gap-0.5 px-5 py-8 sm:px-8">
            {navLinks.map((link) =>
              link.label === "Produtos" ? (
                <li key={link.label}>
                  <button
                    type="button"
                    onClick={() => setProductsOpen((prev) => !prev)}
                    aria-expanded={productsOpen}
                    className={`flex w-full items-center justify-between rounded-xl px-4 py-4 text-sm font-semibold uppercase tracking-[0.2em] transition-all duration-200 ${
                      isActive(link.href)
                        ? "bg-brand/[0.08] text-brand"
                        : "text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    {link.label}
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-300 ${
                        productsOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      productsOpen
                        ? "max-h-[600px] opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <ul className="mt-1 ml-4 space-y-0.5 border-l border-white/[0.06] pl-4">
                      <li>
                        <Link
                          href="/produtos"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-brand transition-colors hover:bg-white/[0.04]"
                        >
                          Todos os produtos
                        </Link>
                      </li>
                      {navbarCategories.map((category) => (
                        <li key={category.slug}>
                          <Link
                            href={`/produtos/${category.slug}`}
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] text-[#aaa] transition-colors hover:bg-white/[0.04] hover:text-white"
                          >
                            <span className="text-sm">
                              {categoryIcons[category.slug] || "📦"}
                            </span>
                            {category.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ) : (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-2 rounded-xl px-4 py-4 text-sm font-semibold uppercase tracking-[0.2em] transition-all duration-200 ${
                      isActive(link.href)
                        ? "bg-brand/[0.08] text-brand"
                        : link.icon
                          ? "text-red-400 hover:bg-white/[0.04]"
                          : "text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    {link.icon && <Flame size={16} />}
                    {link.label}
                  </Link>
                </li>
              ),
            )}

            {/* Mobile Auth Section */}
            <li className="mt-6 border-t border-white/[0.06] pt-6">
              {user ? (
                <div className="flex flex-col gap-1">
                  <Link
                    href="/conta"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-white/[0.04]"
                  >
                    <User size={18} />
                    Minha Conta
                  </Link>
                  {user.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold uppercase tracking-[0.15em] text-brand transition-colors hover:bg-white/[0.04]"
                    >
                      <ShieldCheck size={18} />
                      Painel Admin
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      handleLogout();
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold uppercase tracking-[0.15em] text-[#888] transition-colors hover:bg-white/[0.04] hover:text-white"
                  >
                    <LogOut size={18} />
                    Sair da conta
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3.5 text-sm font-semibold uppercase tracking-[0.15em] text-white transition-all duration-200 hover:border-white/20 hover:bg-white/[0.04]"
                  >
                    <UserRound size={18} />
                    Entrar
                  </Link>
                  <Link
                    href="/cadastro"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3.5 text-sm font-bold uppercase tracking-[0.15em] text-black transition-all duration-300 hover:bg-brand hover:shadow-[0_0_30px_-6px_rgba(182,255,0,0.3)]"
                  >
                    <UserPlus size={18} />
                    Criar conta
                  </Link>
                </div>
              )}
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
