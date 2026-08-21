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
import { PromoBar } from "@/components/layout/PromoBar";
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

const homeDescription =
  "Loja de moda masculina streetwear premium em Brasília. Camisetas oversize, bermudas, calças jeans e acessórios com qualidade e bom preço. Enviamos para todo o Brasil.";

const siteKeywords = [
  "moda masculina",
  "streetwear",
  "loja de roupa masculina",
  "camisetas masculinas",
  "camisetas oversize",
  "bermudas masculinas",
  "calças jeans masculinas",
  "moda masculina Brasília",
  "streetwear Brasil",
  "VIZION",
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ClothingStore",
      "@id": `${siteConfig.url}/#store`,
      name: siteConfig.fullName,
      alternateName: siteConfig.name,
      description: homeDescription,
      url: siteConfig.url,
      logo: `${siteConfig.url}/images/logo.svg`,
      image: `${siteConfig.url}/images/hero.svg`,
      email: siteConfig.email,
      telephone: `+${siteConfig.whatsapp}`,
      areaServed: "BR",
      sameAs: [siteConfig.instagramUrl],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        telephone: `+${siteConfig.whatsapp}`,
        availableLanguage: "Portuguese",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      url: siteConfig.url,
      name: siteConfig.fullName,
      description: homeDescription,
      inLanguage: "pt-BR",
      publisher: { "@id": `${siteConfig.url}/#store` },
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.fullName} | ${siteConfig.tagline} | Moda Masculina`,
    template: `%s | ${siteConfig.fullName}`,
  },
  description: homeDescription,
  keywords: siteKeywords,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${siteConfig.fullName} | ${siteConfig.tagline} | Moda Masculina`,
    description: homeDescription,
    url: siteConfig.url,
    siteName: siteConfig.fullName,
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/images/hero.svg",
        width: 1200,
        height: 630,
        alt: `${siteConfig.fullName} — Moda masculina streetwear premium`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.fullName} | ${siteConfig.tagline}`,
    description: homeDescription,
    images: ["/images/hero.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "ecommerce",
  formatDetection: { email: false, address: false, telephone: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${bebas.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <a href="#main-content" className="skip-link">
          Pular para o conteúdo principal
        </a>
        <CartProvider>
          <ToastProvider>
            <SessionProvider>
              <PromoBar />
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
