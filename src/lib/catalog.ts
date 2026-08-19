import type { Category } from "./types";

export const categories: Category[] = [
  {
    slug: "camisetas",
    name: "Camisetas",
    description:
      "Camisetas masculinas premium, do oversize ao gola polo, para compor um look urbano com estilo.",
    image: "/images/categories/camisetas.jpg",
    metaTitle: "Camisetas Masculinas | Streetwear Premium VIZION",
    metaDescription:
      "Compre camisetas masculinas VIZION: oversize, gola polo e mais. Tecidos premium, estampas exclusivas e entrega para todo o Brasil.",
  },
  {
    slug: "bermudas",
    name: "Bermudas",
    description:
      "Bermudas masculinas modernas para um visual casual, fresco e cheio de atitude.",
    image: "/images/categories/bermudas.jpg",
    metaTitle: "Bermudas Masculinas | Moda Streetwear VIZION",
    metaDescription:
      "Bermudas masculinas confortáveis e estilosas para o verão: dry fit, jeans e mais. Modelagens modernas e entrega em todo o Brasil.",
  },
  {
    slug: "calcas",
    name: "Calças",
    description:
      "Calças masculinas com estética streetwear e caimento impecável para qualquer ocasião.",
    image: "/images/categories/calcas.jpg",
    metaTitle: "Calças Masculinas | Estilo Streetwear VIZION",
    metaDescription:
      "Calças masculinas com modelagem streetwear, tecidos de qualidade e caimento perfeito. Compre online e receba em todo o Brasil.",
  },
  {
    slug: "acessorios",
    name: "Acessórios",
    description:
      "Óculos, bonés e cintos para completar o visual com a identidade VIZION.",
    image: "/images/categories/camisetas.jpg",
    metaTitle: "Acessórios Streetwear | Bonés, Óculos e Cintos VIZION",
    metaDescription:
      "Complete seu estilo com acessórios masculinos VIZION: bonés, óculos e cintos com acabamento premium.",
  },
  {
    slug: "meias",
    name: "Meias",
    description:
      "Meias confortáveis e estilosas para o dia a dia com acabamento premium.",
    image: "/images/categories/camisetas.jpg",
    metaTitle: "Meias Masculinas | Conforto e Estilo VIZION",
    metaDescription:
      "Meias masculinas com toque premium, cano e cores para combinar com todos os looks do seu guarda-roupa.",
  },
  {
    slug: "cuecas",
    name: "Cuecas",
    description:
      "Cuecas confortáveis, com tecido de qualidade e caimento perfeito.",
    image: "/images/categories/camisetas.jpg",
    metaTitle: "Cuecas Masculinas | Conforto Premium VIZION",
    metaDescription:
      "Cuecas masculinas com tecidos que abraçam e conforto que dura o dia inteiro. Qualidade VIZION com bom preço.",
  },
  {
    slug: "moletom",
    name: "Moletom",
    description:
      "Moletons masculinos com forro macio e estética streetwear para o dia mais frio.",
    image: "/images/categories/camisetas.jpg",
    metaTitle: "Moletons Masculinos | Streetwear Premium VIZION",
    metaDescription:
      "Moletons masculinos com forro macio e estilo streetwear. Esquente seu estilo com a VIZION.",
  },
  {
    slug: "corta-vento",
    name: "Corta-Vento",
    description:
      "Corta ventos masculinos leves e estilosos para se proteger do vento e chuva.",
    image: "/images/categories/camisetas.jpg",
    metaTitle: "Corta Ventos Masculinos | VIZION",
    metaDescription:
      "Corta ventos masculinos com acabamento premium e estética streetwear. Proteção e estilo em uma peça.",
  },
  {
    slug: "regatas",
    name: "Regatas",
    description:
      "Regatas masculinas para um visual marcante no treino e na rua.",
    image: "/images/categories/camisetas.jpg",
    metaTitle: "Regatas Masculinas | Estilo VIZION",
    metaDescription:
      "Regatas masculinas com caimento perfeito para treino e look do dia a dia. Modelagens modernas e qualidade premium.",
  },
];

export const categorySubcategories: Record<string, string[]> = {
  camisetas: ["oversize", "gola-polo", "peruanas"],
  bermudas: ["bermudas-jeans"],
  calcas: ["calcas-jeans"],
  acessorios: ["oculos", "bone", "cinto"],
  regatas: ["regatas-machao", "regatas-nba"],
};

export const subcategoryLabels: Record<string, string> = {
  oversize: "Oversize",
  "gola-polo": "Gola Polo",
  peruanas: "Peruanas",
  "bermudas-jeans": "Bermudas Jeans",
  "calcas-jeans": "Calças Jeans",
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
