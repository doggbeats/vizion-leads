import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Sobre a VIZION STORE | Moda Streetwear Premium",
  description:
    "Conheça a VIZION STORE: moda streetwear premium com peças marcantes, qualidade e personalidade para quem busca construir seu próprio estilo.",
  alternates: { canonical: "/sobre" },
  openGraph: {
    title: "Sobre a VIZION STORE",
    description:
      "Moda streetwear premium. Atitude, identidade e a forma como você escolhe se apresentar ao mundo.",
    url: `${siteConfig.url}/sobre`,
    type: "website",
    siteName: siteConfig.fullName,
    locale: "pt_BR",
    images: [
      {
        url: "/images/hero.svg",
        width: 1200,
        height: 630,
        alt: "Sobre a VIZION STORE — moda streetwear premium",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sobre a VIZION STORE",
    description: "Moda streetwear premium. Sua identidade. Seu estilo. Sua VIZION.",
    images: ["/images/hero.svg"],
  },
};

export default function SobrePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "Sobre a VIZION STORE",
    description: metadata.description,
    url: `${siteConfig.url}/sobre`,
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
              Sobre a VIZION STORE
            </h1>
          </div>

          <div className="space-y-8 text-base leading-relaxed text-neutral-300">
            <div>
              <h2 className="font-display text-2xl tracking-wide text-white">
                Mais que roupa. Uma forma de se expressar.
              </h2>
              <p className="mt-3">
                A <strong className="font-semibold text-white">VIZION STORE</strong>{" "}
                nasceu para quem entende que estilo vai além de uma tendência. É
                atitude, identidade e a forma como você escolhe se apresentar ao
                mundo.
              </p>
              <p className="mt-3">
                Nossa proposta é trazer{" "}
                <strong className="font-semibold text-white">
                  moda streetwear premium
                </strong>
                , combinando peças marcantes, qualidade e personalidade para quem
                busca construir seu próprio estilo.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl tracking-wide text-white">
                Nossa VIZION
              </h2>
              <p className="mt-3">
                Selecionamos peças pensando em quem não quer vestir o básico.
              </p>
              <p className="mt-3">
                Trabalhamos com diferentes estilos e coleções, sempre buscando
                oferecer produtos com{" "}
                <strong className="font-semibold text-white">
                  qualidade, conforto e presença
                </strong>
                , para você criar combinações que tenham a sua identidade.
              </p>
              <p className="mt-3">
                Do casual ao streetwear, a VIZION acompanha diferentes momentos sem
                abrir mão da personalidade.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl tracking-wide text-white">
                Qualidade em primeiro lugar
              </h2>
              <p className="mt-3">
                Acreditamos que uma boa peça precisa entregar mais do que uma boa
                aparência.
              </p>
              <p className="mt-3">
                Por isso, buscamos produtos com{" "}
                <strong className="font-semibold text-white">
                  bons materiais, acabamento, conforto e caimento
                </strong>
                , para que você tenha uma experiência completa desde a escolha até
                o momento em que recebe seu pedido.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl tracking-wide text-white">
                Vista sua VIZION
              </h2>
              <p className="mt-3">
                Não seguimos apenas o que está em alta.
              </p>
              <p className="mt-3">
                Criamos uma seleção para quem quer{" "}
                <strong className="font-semibold text-white">
                  se destacar, experimentar e construir seu próprio estilo
                </strong>
                .
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-graphite-border bg-graphite p-6 text-center sm:p-8">
            <p className="font-display text-2xl tracking-wide text-white">
              VIZION STORE — Moda Streetwear Premium.
            </p>
            <p className="mt-2 text-neutral-400">
              Sua identidade. Seu estilo. Sua VIZION.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
