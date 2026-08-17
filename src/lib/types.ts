export type Category = {
  slug: string;
  name: string;
  description: string;
  image: string;
  metaTitle?: string;
  metaDescription?: string;
};

export type ProductSize =
  | "PP"
  | "P"
  | "M"
  | "G"
  | "GG"
  | "XG"
  | "U"
  | "38"
  | "40"
  | "42"
  | "44";

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  promotionalPrice?: number;
  category: string;
  subcategory?: string;
  images: string[];
  sizes: ProductSize[];
  stock: number;
  featured?: boolean;
  active: boolean;
};

export type CartItem = {
  product: Product;
  size: ProductSize;
  quantity: number;
};
