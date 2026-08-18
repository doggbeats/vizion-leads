"use client";

import { useState } from "react";
import Image from "next/image";
import { ImagePlus, Check } from "lucide-react";

export type CategoryItem = {
  slug: string;
  name: string;
  description: string;
  image: string;
};

export function CategoriasManager({ initial }: { initial: CategoryItem[] }) {
  const [categories, setCategories] = useState(initial);
  const [uploading, setUploading] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleImageUpload(slug: string, file: File) {
    setUploading(slug);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Erro ao enviar imagem.");
        return;
      }

      setSaving(slug);
      const patchRes = await fetch("/api/admin/categorias", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, image: data.url }),
      });
      const patchData = await patchRes.json().catch(() => ({}));
      if (!patchRes.ok) {
        setError(patchData.error ?? "Erro ao salvar categoria.");
        return;
      }

      setCategories((prev) =>
        prev.map((c) => (c.slug === slug ? { ...c, image: data.url } : c)),
      );
      setSaved(slug);
      setTimeout(() => setSaved(null), 2000);
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setUploading(null);
      setSaving(null);
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {categories.map((category) => {
          const busy = uploading === category.slug || saving === category.slug;
          const justSaved = saved === category.slug;

          return (
            <div
              key={category.slug}
              className="overflow-hidden rounded-2xl border border-graphite-border bg-graphite"
            >
              <div className="relative aspect-[3/4] bg-graphite-light">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center text-neutral-600">
                    Sem imagem
                  </div>
                )}
                {justSaved && (
                  <div className="absolute inset-0 flex items-center justify-center bg-ink/60">
                    <span className="flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-bold text-ink">
                      <Check size={16} />
                      Salvo!
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-display text-xl tracking-wide text-white">
                  {category.name}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs text-neutral-500">
                  {category.description}
                </p>

                <label
                  className={`mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-graphite-border px-4 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-400 transition-colors hover:border-brand hover:text-brand ${
                    busy ? "pointer-events-none opacity-50" : ""
                  }`}
                >
                  <ImagePlus size={16} />
                  {busy ? "Enviando..." : "Alterar imagem"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                    disabled={busy}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = "";
                      if (file) handleImageUpload(category.slug, file);
                    }}
                    className="hidden"
                  />
                </label>

                <p className="mt-2 truncate text-[11px] text-neutral-600">
                  {category.image}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
