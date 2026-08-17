import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Carrinho de compras",
  robots: { index: false, follow: false },
};

export default function CartLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
