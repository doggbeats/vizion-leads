import type { Category } from "./types";

export const categories: Category[] = [
  {
    slug: "camisetas",
    name: "Camisetas",
    description: "Camisetas premium para compor seu estilo urbano.",
    image: "/images/categories/camisetas.jpg",
  },
  {
    slug: "bermudas",
    name: "Bermudas",
    description: "Bermudas masculinas para um visual casual e moderno.",
    image: "/images/categories/bermudas.jpg",
  },
  {
    slug: "calcas",
    name: "Calças",
    description: "Calças masculinas com estética streetwear.",
    image: "/images/categories/calcas.jpg",
  },
  {
    slug: "calcas-jeans",
    name: "Calças Jeans",
    description: "Jeans premium para combinações urbanas.",
    image: "/images/categories/calcas-jeans.jpg",
  },
  {
    slug: "acessorios",
    name: "Acessórios",
    description: "Óculos, bonés e cintos para completar o visual.",
    image: "/images/categories/camisetas.jpg",
  },
  {
    slug: "meias",
    name: "Meias",
    description: "Meias confortáveis e estilosas para o dia a dia.",
    image: "/images/categories/camisetas.jpg",
  },
  {
    slug: "cuecas",
    name: "Cuecas",
    description: "Cuecas confortáveis com caimento perfeito.",
    image: "/images/categories/camisetas.jpg",
  },
  {
    slug: "agasalhos",
    name: "Agasalhos",
    description: "Moletons e corta ventos para o frio com estilo.",
    image: "/images/categories/camisetas.jpg",
  },
  {
    slug: "regatas",
    name: "Regatas",
    description: "Regatas masculinas para um visual marcante.",
    image: "/images/categories/camisetas.jpg",
  },
];

export const categorySubcategories: Record<string, string[]> = {
  camisetas: ["oversize", "gola-polo", "peruanas"],
  bermudas: ["bermudas-drifit", "bermudas-jeans"],
  acessorios: ["oculos", "bone", "cinto"],
  agasalhos: ["moletons", "corta-vento"],
  regatas: ["regatas-machao", "regatas-nba"],
};

export const subcategoryLabels: Record<string, string> = {
  oversize: "Oversize",
  "gola-polo": "Gola Polo",
  peruanas: "Peruanas",
  oculos: "Óculos",
  bone: "Boné",
  cinto: "Cinto",
};

export function getSubcategories(categorySlug: string): string[] {
  return categorySubcategories[categorySlug] ?? [];
}

export function getSubcategoryLabel(subcategory: string): string {
  return subcategoryLabels[subcategory] ?? subcategory;
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
