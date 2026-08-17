import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Clock } from "lucide-react";
import { InstagramIcon } from "@/components/ui/icons";
import { siteConfig } from "@/lib/site";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Contato | VIZION STORE — Moda Streetwear Premium",
  description:
    "Fale com a VIZION STORE pelo WhatsApp, Instagram ou e-mail. Tire dúvidas sobre produtos, pedidos, formas de pagamento e entrega.",
  alternates: { canonical: "/contato" },
  openGraph: {
    title: "Contato — VIZION STORE",
    description:
      "Atendimento pelo WhatsApp, Instagram e e-mail. Estamos prontos para atender você.",
    url: `${siteConfig.url}/contato`,
    type: "website",
    siteName: siteConfig.fullName,
    locale: "pt_BR",
    images: [
      {
        url: "/images/hero.svg",
        width: 1200,
        height: 630,
        alt: "Contato VIZION STORE",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contato — VIZION STORE",
    description: "Atendimento pelo WhatsApp, Instagram e e-mail.",
    images: ["/images/hero.svg"],
  },
};

export default function ContatoPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contato — VIZION STORE",
    description: metadata.description,
    url: `${siteConfig.url}/contato`,
    inLanguage: "pt-BR",
    isPartOf: { "@id": `${siteConfig.url}/#website` },
  };

  return (
    <section className="bg-ink py-16 sm:py-20">
      <Container>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div className="mx-auto max-w-3xl space-y-12">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-brand">
              VIZION STORE
            </p>
            <h1 className="font-display text-5xl tracking-wide text-white sm:text-6xl">
              Fale com a gente
            </h1>
            <p className="mt-4 text-base leading-relaxed text-neutral-400">
              Dúvidas sobre produtos, pedidos, pagamento ou entrega? Escolha o
              canal de sua preferência e respondemos o quanto antes.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <a
              href={`https://wa.me/${siteConfig.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-4 rounded-2xl border border-graphite-border bg-graphite p-5 transition-colors hover:border-brand"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <MessageCircle size={22} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-neutral-500">
                  WhatsApp
                </p>
                <p className="mt-1 font-semibold text-white">
                  {siteConfig.whatsappDisplay}
                </p>
                <p className="mt-1 text-sm text-neutral-400">
                  Atendimento rápido — pedidos, pagamento e entrega
                </p>
              </div>
            </a>

            <a
              href={siteConfig.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-4 rounded-2xl border border-graphite-border bg-graphite p-5 transition-colors hover:border-brand"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <InstagramIcon size={22} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-neutral-500">
                  Instagram
                </p>
                <p className="mt-1 font-semibold text-white">
                  {siteConfig.instagram}
                </p>
                <p className="mt-1 text-sm text-neutral-400">
                  Novidades, lançamentos e bastidores
                </p>
              </div>
            </a>

            <a
              href={`mailto:${siteConfig.email}`}
              className="group flex items-start gap-4 rounded-2xl border border-graphite-border bg-graphite p-5 transition-colors hover:border-brand"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <Mail size={22} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-neutral-500">
                  E-mail
                </p>
                <p className="mt-1 font-semibold text-white">{siteConfig.email}</p>
                <p className="mt-1 text-sm text-neutral-400">
                  Para assuntos gerais e parcerias
                </p>
              </div>
            </a>

            <div className="flex items-start gap-4 rounded-2xl border border-graphite-border bg-graphite p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <Clock size={22} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-neutral-500">
                  Horário de atendimento
                </p>
                <p className="mt-1 font-semibold text-white">
                  Segunda a sábado
                </p>
                <p className="mt-1 text-sm text-neutral-400">09h às 19h</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-graphite-border bg-graphite p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <MapPin size={22} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-neutral-500">
                  Nossa loja
                </p>
                <p className="mt-1 font-semibold text-white">
                  {siteConfig.address}
                </p>
                <p className="mt-1 text-sm text-neutral-400">
                  Brasília — DF · Retirada de pedidos por aqui
                </p>
                <a
                  href={siteConfig.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand transition-colors hover:text-brand-dark"
                >
                  Ver no mapa
                </a>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-brand/40 bg-graphite p-6 text-center sm:p-8">
            <p className="font-display text-2xl tracking-wide text-white">
              Preferimos agilidade.
            </p>
            <p className="mt-2 text-neutral-400">
              Finalize seu pedido direto pelo WhatsApp e receba a confirmação
              na hora.
            </p>
            <a
              href={`https://wa.me/${siteConfig.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-bold uppercase tracking-wider text-ink transition-colors hover:bg-brand-dark"
            >
              <MessageCircle size={16} />
              Chamar no WhatsApp
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
