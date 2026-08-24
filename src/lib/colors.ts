export type ProductColor = {
  slug: string;
  label: string;
  hex: string;
};

export const PRODUCT_COLORS: ProductColor[] = [
  { slug: "branco", label: "Branco", hex: "#FFFFFF" },
  { slug: "preto", label: "Preto", hex: "#1A1A1A" },
  { slug: "cinza", label: "Cinza", hex: "#9CA3AF" },
  { slug: "azul", label: "Azul", hex: "#2563EB" },
  { slug: "vermelho", label: "Vermelho", hex: "#DC2626" },
  { slug: "bege", label: "Bege", hex: "#D9C7A7" },
  { slug: "verde", label: "Verde", hex: "#16A34A" },
  { slug: "marrom", label: "Marrom", hex: "#78503C" },
];

const COLOR_MAP = new Map(PRODUCT_COLORS.map((c) => [c.slug, c]));

export function getColorBySlug(slug: string): ProductColor | undefined {
  return COLOR_MAP.get(slug);
}

export function getColorLabel(slug: string): string {
  return COLOR_MAP.get(slug)?.label ?? slug;
}

export function getColorHex(slug: string): string {
  return COLOR_MAP.get(slug)?.hex ?? "#737373";
}
