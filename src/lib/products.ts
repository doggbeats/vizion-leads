import type { Category, Product } from "./types";

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
];

const images = {
  camiseta1: "/images/products/camiseta-1.svg",
  camiseta2: "/images/products/camiseta-2.svg",
  camiseta3: "/images/products/camiseta-3.svg",
  bermuda1: "/images/products/bermuda-1.svg",
  bermuda2: "/images/products/bermuda-2.svg",
  calcas1: "/images/products/calcas-1.svg",
  jeans1: "/images/products/jeans-1.svg",
  jeans2: "/images/products/jeans-2.svg",
};

export const products: Product[] = [
  {
    id: "camiseta-vizion-basica",
    name: "Camiseta VIZION Básica",
    description:
      "Camiseta básica de algodão premium com toque macio, modelagem regular e costura reforçada. O essencial do streetwear.",
    price: 89.9,
    category: "camisetas",
    images: [images.camiseta1, images.camiseta3],
    sizes: ["P", "M", "G", "GG"],
    stock: 24,
    active: true,
  },
  {
    id: "camiseta-oversized-logo",
    name: "Camiseta Oversized Logo",
    description:
      "Camiseta oversized com estampa do logo VIZION em destaque. Malha 100% algodão, modelagem ampla e caimento premium.",
    price: 129.9,
    promotionalPrice: 99.9,
    category: "camisetas",
    images: [images.camiseta2, images.camiseta1],
    sizes: ["M", "G", "GG", "XG"],
    stock: 18,
    featured: true,
    active: true,
  },
  {
    id: "camiseta-street-capsule",
    name: "Camiseta Street Capsule",
    description:
      "Peça da coleção Street Capsule com estampa exclusiva no peito. Algodão penteado de alta densidade.",
    price: 119.9,
    category: "camisetas",
    images: [images.camiseta3, images.camiseta2],
    sizes: ["P", "M", "G", "GG", "XG"],
    stock: 30,
    active: true,
  },
  {
    id: "camiseta-urban-print",
    name: "Camiseta Urban Print",
    description:
      "Camiseta com estampa urbana de alto contraste. Corte reto, gola reforçada e acabamento diferenciado.",
    price: 109.9,
    category: "camisetas",
    images: [images.camiseta1, images.camiseta2],
    sizes: ["M", "G", "GG"],
    stock: 12,
    featured: true,
    active: true,
  },
  {
    id: "camiseta-minimal-nova",
    name: "Camiseta Minimal Nova",
    description:
      "Design minimalista com detalhe discreto na manga. Conforto e versatilidade para o dia a dia.",
    price: 99.9,
    promotionalPrice: 79.9,
    category: "camisetas",
    images: [images.camiseta2, images.camiseta3],
    sizes: ["P", "M", "G", "GG"],
    stock: 40,
    active: true,
  },
  {
    id: "bermuda-vizion-cargo",
    name: "Bermuda VIZION Cargo",
    description:
      "Bermuda cargo com bolsos utilitários e tecido resistente. O equilíbrio perfeito entre função e estilo.",
    price: 149.9,
    category: "bermudas",
    images: [images.bermuda1, images.bermuda2],
    sizes: ["M", "G", "GG"],
    stock: 15,
    active: true,
  },
  {
    id: "bermuda-tactel-sport",
    name: "Bermuda Tactel Sport",
    description:
      "Bermuda em tactel de secagem rápida, leve e confortável. Ideal para o streetwear e o esporte.",
    price: 129.9,
    promotionalPrice: 109.9,
    category: "bermudas",
    images: [images.bermuda2, images.bermuda1],
    sizes: ["P", "M", "G", "GG"],
    stock: 22,
    active: true,
  },
  {
    id: "bermuda-jeans-destroyed",
    name: "Bermuda Jeans Destroyed",
    description:
      "Bermuda jeans com lavagem destroyed e modelagem moderna. Peça de destaque para looks urbanos.",
    price: 159.9,
    category: "bermudas",
    images: [images.bermuda1, images.jeans1],
    sizes: ["M", "G", "GG"],
    stock: 9,
    featured: true,
    active: true,
  },
  {
    id: "calca-cargo-street",
    name: "Calça Cargo Street",
    description:
      "Calça cargo streetwear com bolsos funcionais, ajuste elástico no tornozelo e tecido premium.",
    price: 219.9,
    category: "calcas",
    images: [images.calcas1, images.bermuda1],
    sizes: ["M", "G", "GG"],
    stock: 14,
    featured: true,
    active: true,
  },
  {
    id: "calca-jogger-slim",
    name: "Calça Jogger Slim",
    description:
      "Calça jogger slim em moletom estruturado com cós elástico e cordão. Conforto absoluto no visual street.",
    price: 199.9,
    category: "calcas",
    images: [images.calcas1, images.jeans2],
    sizes: ["P", "M", "G", "GG"],
    stock: 20,
    active: true,
  },
  {
    id: "calca-cargo-utilitaria",
    name: "Calça Cargo Utilitária",
    description:
      "Calça utilitária com bolsos laterais amplos e tecido ripstop. Feita para quem vive na rua.",
    price: 229.9,
    promotionalPrice: 189.9,
    category: "calcas",
    images: [images.jeans1, images.calcas1],
    sizes: ["M", "G", "GG", "XG"],
    stock: 11,
    active: true,
  },
  {
    id: "jeans-slim-skinny",
    name: "Jeans Slim Skinny",
    description:
      "Jeans slim skinny com elastano para liberdade de movimento. Lavagem escura e caimento impecável.",
    price: 189.9,
    category: "calcas-jeans",
    images: [images.jeans1, images.jeans2],
    sizes: ["38", "40", "42", "44"],
    stock: 16,
    featured: true,
    active: true,
  },
  {
    id: "jeans-regular-fit",
    name: "Jeans Regular Fit",
    description:
      "Jeans regular fit clássico com lavagem média. Versátil para todas as ocasiões urbanas.",
    price: 199.9,
    category: "calcas-jeans",
    images: [images.jeans2, images.jeans1],
    sizes: ["38", "40", "42"],
    stock: 25,
    active: true,
  },
  {
    id: "jeans-loose-street",
    name: "Jeans Loose Street",
    description:
      "Jeans loose de cintura média com lavagem destroyed. A silhueta ampla em alta no streetwear.",
    price: 209.9,
    promotionalPrice: 179.9,
    category: "calcas-jeans",
    images: [images.jeans1, images.calcas1],
    sizes: ["40", "42", "44"],
    stock: 8,
    active: true,
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id && p.active);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getProductsByCategory(slug: string): Product[] {
  return products.filter((p) => p.active && p.category === slug);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.active && p.featured);
}

export function getRelatedProducts(product: Product): Product[] {
  return products
    .filter((p) => p.active && p.id !== product.id && p.category === product.category)
    .slice(0, 4);
}
