import type { Metadata } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import { siteConfig } from "@/lib/site";
import { CartProvider } from "@/lib/cart";
import { SessionProvider } from "@/lib/session";
import { ToastProvider } from "@/components/ui/toast";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { VLibras } from "@/components/accessibility/VLibras";
import { AccessibilityWidget } from "@/components/accessibility/AccessibilityWidget";
import "./globals.css";

const bebas = Bebas_Neue({
  variable: "--font-bebas",
  weight: "400",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.fullName} | ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.fullName}`,
  },
  description:
    "Loja de moda masculina streetwear premium. Camisetas, bermudas, calças e calças jeans com estilo, qualidade e bom preço.",
  keywords: [
    "moda masculina",
    "streetwear",
    "camisetas",
    "bermudas",
    "calças jeans",
    "vizion",
  ],
  openGraph: {
    title: `${siteConfig.fullName} | ${siteConfig.tagline}`,
    description: siteConfig.slogan,
    url: siteConfig.url,
    siteName: siteConfig.fullName,
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${bebas.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col">
        <a href="#main-content" className="skip-link">
          Pular para o conteúdo principal
        </a>
        <CartProvider>
          <ToastProvider>
            <SessionProvider>
              <Navbar />
              <main id="main-content" className="flex-1">
                {children}
              </main>
              <Footer />
              <AccessibilityWidget />
              <VLibras />
            </SessionProvider>
          </ToastProvider>
        </CartProvider>
      </body>
    </html>
  );
}
