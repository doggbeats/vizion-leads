"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, Star, ImagePlus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency } from "@/lib/format";

export type AdminProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  promotionalPrice: number | null;
  categorySlug: string;
  subcategory: string | null;
  images: string[];
  sizes: string[];
  stock: number;
  weight: number;
  width: number;
  height: number;
  length: number;
  featured: boolean;
  active: boolean;
};

export type AdminCategory = { slug: string; name: string };

type FormState = {
  id: string | null;
  name: string;
  description: string;
  price: string;
  promotionalPrice: string;
  categorySlug: string;
  subcategory: string;
  images: string;
  sizes: string;
  stock: string;
  weight: string;
  width: string;
  height: string;
  length: string;
  featured: boolean;
  active: boolean;
};

const emptyForm: FormState = {
  id: null,
  name: "",
  description: "",
  price: "",
  promotionalPrice: "",
  categorySlug: "",
  subcategory: "",
  images: "",
  sizes: "",
  stock: "0",
  weight: "0.5",
  width: "30",
  height: "5",
  length: "30",
  featured: false,
  active: true,
};

export function ProdutosManager({
  initial,
  categories,
}: {
  initial: AdminProduct[];
  categories: AdminCategory[];
}) {
  const [produtos, setProdutos] = useState(initial);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [enviandoImagem, setEnviandoImagem] = useState(false);
  const [erroImagem, setErroImagem] = useState("");

  function openNew() {
    setForm({ ...emptyForm, categorySlug: categories[0]?.slug ?? "" });
    setErro("");
    setModalOpen(true);
  }

  function openEdit(product: AdminProduct) {
    setForm({
      id: product.id,
      name: product.name,
      description: product.description,
      price: String(product.price),
      promotionalPrice:
        product.promotionalPrice === null ? "" : String(product.promotionalPrice),
      categorySlug: product.categorySlug,
      subcategory: product.subcategory ?? "",
      images: product.images.join(", "),
      sizes: product.sizes.join(", "),
      stock: String(product.stock),
      weight: String(product.weight),
      width: String(product.width),
      height: String(product.height),
      length: String(product.length),
      featured: product.featured,
      active: product.active,
    });
    setErro("");
    setModalOpen(true);
  }

  async function salvar(e: FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro("");

    const payload = {
      name: form.name,
      description: form.description,
      price: form.price,
      promotionalPrice: form.promotionalPrice,
      categorySlug: form.categorySlug,
      subcategory: form.subcategory,
      images: form.images,
      sizes: form.sizes,
      stock: form.stock,
      weight: form.weight,
      width: form.width,
      height: form.height,
      length: form.length,
      featured: form.featured,
      active: form.active,
    };

    try {
      const response = form.id
        ? await fetch(`/api/admin/produtos/${form.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/admin/produtos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setErro(data.error ?? "Erro ao salvar o produto.");
        return;
      }

      if (form.id) {
        setProdutos((prev) =>
          prev.map((p) =>
            p.id === form.id ? { ...p, ...data.product } : p,
          ),
        );
      } else {
        setProdutos((prev) => [data.product, ...prev]);
      }
      setModalOpen(false);
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  function formImageUrls(): string[] {
    return form.images
      .split(",")
      .map((url) => url.trim())
      .filter(Boolean);
  }

  function setFormImages(urls: string[]) {
    setForm({ ...form, images: urls.join(", ") });
  }

  function removerImagem(url: string) {
    setFormImages(formImageUrls().filter((item) => item !== url));
  }

  async function enviarImagens(files: File[]) {
    if (files.length === 0) return;
    setEnviandoImagem(true);
    setErroImagem("");

    const novasUrls: string[] = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const response = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          setErroImagem(data.error ?? "Falha ao enviar imagem.");
          continue;
        }
        novasUrls.push(data.url);
      } catch {
        setErroImagem("Erro de conexão ao enviar a imagem.");
      }
    }

    if (novasUrls.length > 0) {
      setFormImages([...formImageUrls(), ...novasUrls]);
    }
    setEnviandoImagem(false);
  }

  async function toggleAtivo(product: AdminProduct) {
    setBusyId(product.id);
    try {
      const response = await fetch(`/api/admin/produtos/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !product.active }),
      });
      if (!response.ok) return;
      setProdutos((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, active: !p.active } : p)),
      );
    } catch {
      // ignore
    } finally {
      setBusyId(null);
    }
  }

  async function excluir(product: AdminProduct) {
    if (!confirm(`Excluir o produto "${product.name}"?`)) return;
    setBusyId(product.id);
    try {
      const response = await fetch(`/api/admin/produtos/${product.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setProdutos((prev) => prev.filter((p) => p.id !== product.id));
      }
    } catch {
      // ignore
    } finally {
      setBusyId(null);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-graphite-border bg-graphite px-4 py-3 text-sm text-white placeholder:text-neutral-500 outline-none transition-colors focus:border-brand";

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <button
          type="button"
          onClick={openNew}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-ink transition-colors hover:bg-brand-dark sm:w-auto"
        >
          <Plus size={16} />
          Novo produto
        </button>
      </div>

      {produtos.length === 0 ? (
        <p className="rounded-2xl border border-graphite-border bg-graphite p-8 text-sm text-neutral-500">
          Nenhum produto cadastrado ainda.
        </p>
      ) : (
        <>
          <div className="space-y-4 lg:hidden">
            {produtos.map((product) => (
              <div
                key={product.id}
                className="rounded-2xl border border-graphite-border bg-graphite p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-graphite-light">
                    <Image
                      src={product.images[0] ?? "/images/logo.svg"}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 font-semibold text-white">
                      <span className="truncate">{product.name}</span>
                      {product.featured ? (
                        <Star size={14} className="shrink-0 text-brand" />
                      ) : null}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {categories.find((c) => c.slug === product.categorySlug)?.name ??
                        product.categorySlug}
                    </p>
                    <p className="mt-1">
                      {product.promotionalPrice !== null ? (
                        <span className="text-sm">
                          <span className="font-semibold text-brand">
                            {formatCurrency(product.promotionalPrice)}
                          </span>{" "}
                          <span className="text-xs text-neutral-500 line-through">
                            {formatCurrency(product.price)}
                          </span>
                        </span>
                      ) : (
                        <span className="font-semibold text-white">
                          {formatCurrency(product.price)}
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleAtivo(product)}
                    disabled={busyId === product.id}
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 ${
                      product.active
                        ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                        : "bg-neutral-500/15 text-neutral-400 hover:bg-neutral-500/25"
                    }`}
                  >
                    {product.active ? "Ativo" : "Inativo"}
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-neutral-300">
                    Estoque:{" "}
                    <span
                      className={
                        product.stock <= 0
                          ? "font-semibold text-red-400"
                          : product.stock <= 5
                            ? "font-semibold text-amber-400"
                            : "font-semibold text-white"
                      }
                    >
                      {product.stock}
                    </span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(product)}
                      title="Editar"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-graphite-border text-neutral-400 transition-colors hover:border-brand hover:text-brand"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => excluir(product)}
                      disabled={busyId === product.id}
                      title="Excluir"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-graphite-border text-neutral-400 transition-colors hover:border-red-500 hover:text-red-400 disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-2xl border border-graphite-border bg-graphite lg:block">
            <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-graphite-border text-xs uppercase tracking-wider text-neutral-500">
                <th className="px-5 py-4 font-semibold">Produto</th>
                <th className="px-5 py-4 font-semibold">Categoria</th>
                <th className="px-5 py-4 font-semibold">Preço</th>
                <th className="px-5 py-4 font-semibold">Estoque</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graphite-border">
              {produtos.map((product) => (
                <tr key={product.id} className="text-neutral-300">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-graphite-light">
                        <Image
                          src={product.images[0] ?? "/images/logo.svg"}
                          alt=""
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 font-semibold text-white">
                          <span className="truncate">{product.name}</span>
                          {product.featured ? (
                            <Star size={14} className="shrink-0 text-brand" />
                          ) : null}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {product.sizes.join(", ") || "Sem tamanhos"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {categories.find((c) => c.slug === product.categorySlug)?.name ??
                      product.categorySlug}
                  </td>
                  <td className="px-5 py-4">
                    {product.promotionalPrice !== null ? (
                      <div>
                        <span className="font-semibold text-brand">
                          {formatCurrency(product.promotionalPrice)}
                        </span>
                        <span className="ml-2 text-xs text-neutral-500 line-through">
                          {formatCurrency(product.price)}
                        </span>
                      </div>
                    ) : (
                      <span className="font-semibold text-white">
                        {formatCurrency(product.price)}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={
                        product.stock <= 0
                          ? "text-red-400"
                          : product.stock <= 5
                            ? "text-amber-400"
                            : "text-neutral-300"
                      }
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => toggleAtivo(product)}
                      disabled={busyId === product.id}
                      className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 ${
                        product.active
                          ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                          : "bg-neutral-500/15 text-neutral-400 hover:bg-neutral-500/25"
                      }`}
                    >
                      {product.active ? "Ativo" : "Inativo"}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(product)}
                        title="Editar"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-graphite-border text-neutral-400 transition-colors hover:border-brand hover:text-brand"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => excluir(product)}
                        disabled={busyId === product.id}
                        title="Excluir"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-graphite-border text-neutral-400 transition-colors hover:border-red-500 hover:text-red-400 disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={form.id ? "Editar produto" : "Novo produto"}
        className="max-w-2xl"
      >
        <form onSubmit={salvar} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-300">
              Nome
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-300">
              Descrição
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className={`${inputClass} resize-none`}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-300">
                Preço (R$)
              </label>
              <input
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="129.90"
                inputMode="decimal"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-300">
                Preço promocional
              </label>
              <input
                value={form.promotionalPrice}
                onChange={(e) =>
                  setForm({ ...form, promotionalPrice: e.target.value })
                }
                placeholder="99.90"
                inputMode="decimal"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-300">
                Estoque
              </label>
              <input
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                type="number"
                min={0}
                className={inputClass}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-300">
                Peso (kg)
              </label>
              <input
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: e.target.value })}
                type="number"
                step="0.01"
                min={0}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-300">
                Altura (cm)
              </label>
              <input
                value={form.height}
                onChange={(e) => setForm({ ...form, height: e.target.value })}
                type="number"
                step="0.1"
                min={0}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-300">
                Largura (cm)
              </label>
              <input
                value={form.width}
                onChange={(e) => setForm({ ...form, width: e.target.value })}
                type="number"
                step="0.1"
                min={0}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-300">
                Comprimento (cm)
              </label>
              <input
                value={form.length}
                onChange={(e) => setForm({ ...form, length: e.target.value })}
                type="number"
                step="0.1"
                min={0}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-300">
                Categoria
              </label>
              <select
                value={form.categorySlug}
                onChange={(e) =>
                  setForm({ ...form, categorySlug: e.target.value })
                }
                className={inputClass}
                required
              >
                {categories.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-300">
                Subcategoria (opcional)
              </label>
              <input
                value={form.subcategory}
                onChange={(e) =>
                  setForm({ ...form, subcategory: e.target.value })
                }
                placeholder="ex: oversize, gola-polo"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-300">
              Imagens
            </label>

            <div className="flex flex-wrap gap-3">
              {formImageUrls().map((url) => (
                <div key={url} className="relative">
                  <Image
                    src={url}
                    alt=""
                    width={80}
                    height={80}
                    className="h-20 w-20 rounded-lg border border-graphite-border bg-graphite object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removerImagem(url)}
                    aria-label={`Remover imagem ${url}`}
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white transition-colors hover:bg-red-600"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>

            <label className="mt-3 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-graphite-border bg-graphite px-4 py-6 text-sm text-neutral-400 transition-colors hover:border-brand hover:text-brand">
              <ImagePlus size={20} />
              {enviandoImagem ? "Enviando imagens..." : "Clique para anexar imagens"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                multiple
                disabled={enviandoImagem}
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  e.target.value = "";
                  enviarImagens(files);
                }}
                className="hidden"
              />
            </label>

            {erroImagem ? (
              <p className="mt-2 text-sm text-red-400">{erroImagem}</p>
            ) : null}

            <p className="mt-2 text-xs text-neutral-500">
              JPG, PNG, WEBP, GIF ou AVIF — até 5 MB por imagem.
            </p>

            <label className="mt-3 block text-xs font-medium text-neutral-500">
              Ou cole URLs (separadas por vírgula)
            </label>
            <input
              value={form.images}
              onChange={(e) => setForm({ ...form, images: e.target.value })}
              placeholder="/images/products/camisetaf.jpg"
              className={`${inputClass} mt-1`}
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-300">
              Tamanhos (separados por vírgula)
            </label>
            <input
              value={form.sizes}
              onChange={(e) => setForm({ ...form, sizes: e.target.value })}
              placeholder="P, M, G, GG"
              className={inputClass}
            />
            <p className="mt-1 text-xs text-neutral-500">
              Permitidos: PP, P, M, G, GG, XG, 38, 40, 42, 44
            </p>
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-300">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                className="h-4 w-4 accent-[#B6FF00]"
              />
              Destaque da semana
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-300">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="h-4 w-4 accent-[#B6FF00]"
              />
              Ativo na loja
            </label>
          </div>

          {erro ? <p className="text-sm text-red-400">{erro}</p> : null}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-lg border border-graphite-border px-4 py-2.5 text-sm font-semibold text-neutral-300 transition-colors hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="rounded-lg bg-brand px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-ink transition-colors hover:bg-brand-dark disabled:opacity-50"
            >
              {salvando ? "Salvando..." : form.id ? "Salvar" : "Criar"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
