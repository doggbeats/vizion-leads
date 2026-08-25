import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Política de Privacidade | VIZION STORE",
  description:
    "Conheça como a VIZION STORE coleta, utiliza e protege seus dados pessoais de acordo com a LGPD.",
  alternates: { canonical: "/privacidade" },
  openGraph: {
    title: "Política de Privacidade — VIZION STORE",
    description:
      "Saiba como a VIZION STORE trata seus dados pessoais em conformidade com a Lei Geral de Proteção de Dados (LGPD).",
    url: `${siteConfig.url}/privacidade`,
    type: "website",
    siteName: siteConfig.fullName,
    locale: "pt_BR",
    images: [
      {
        url: "/images/hero.svg",
        width: 1200,
        height: 630,
        alt: "Política de Privacidade — VIZION STORE",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Política de Privacidade — VIZION STORE",
    description:
      "Saiba como a VIZION STORE trata seus dados pessoais em conformidade com a LGPD.",
    images: ["/images/hero.svg"],
  },
};

export default function PrivacidadePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Política de Privacidade",
    description: metadata.description,
    url: `${siteConfig.url}/privacidade`,
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
              Política de Privacidade
            </h1>
            <p className="mt-4 text-sm text-neutral-500">
              Última atualização: 25 de agosto de 2026
            </p>
          </div>

          <div className="space-y-8 text-base leading-relaxed text-neutral-300">
            <div>
              <h2 className="font-display text-2xl tracking-wide text-white">
                1. Introdução
              </h2>
              <p className="mt-3">
                A <strong className="font-semibold text-white">VIZION STORE</strong>,
                inscrita sob o CNPJ <strong className="font-semibold text-white">{siteConfig.cnpj}</strong>,
                com sede em <strong className="font-semibold text-white">{siteConfig.address}</strong>,
                é comprometida com a proteção da privacidade e dos dados pessoais
                de seus clientes e visitantes. Esta Política de Privacidade descreve
                como coletamos, utilizamos, armazenamos e protegemos suas informações,
                em conformidade com a <strong className="font-semibold text-white">
                Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018)</strong>.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl tracking-wide text-white">
                2. Dados pessoais coletados
              </h2>
              <p className="mt-3">
                Durante o uso de nossa loja virtual, podemos coletar os seguintes dados:
              </p>
              <ul className="mt-3 list-inside list-disc space-y-1 text-neutral-300">
                <li>
                  <strong className="font-semibold text-white">Dados de cadastro:</strong> nome, e-mail, telefone e senha (armazenada de forma criptografada).
                </li>
                <li>
                  <strong className="font-semibold text-white">Dados de pedido:</strong> nome do destinatário, CPF/CNPJ, endereço de entrega (CEP, rua, número, complemento, bairro, cidade e estado).
                </li>
                <li>
                  <strong className="font-semibold text-white">Dados de pagamento:</strong> informações necessárias para processamento de pagamentos, processadas por meio de parceiros seguros.
                </li>
                <li>
                  <strong className="font-semibold text-white">Dados de navegação:</strong> endereço IP, tipo de navegador, páginas visitadas e interações com o site, coletados por meio de cookies e tecnologias semelhantes.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-2xl tracking-wide text-white">
                3. Finalidade do tratamento
              </h2>
              <p className="mt-3">
                Seus dados são utilizados para:
              </p>
              <ul className="mt-3 list-inside list-disc space-y-1 text-neutral-300">
                <li>Processar e enviar seus pedidos.</li>
                <li>Gerenciar sua conta e cadastro na loja.</li>
                <li>Comunicar-se sobre o status de pedidos, entregas e suporte.</li>
                <li>Enviar comunicações de marketing, com seu consentimento.</li>
                <li>Melhorar sua experiência de navegação e nosso atendimento.</li>
                <li>Cumprir obrigações legais e regulatórias.</li>
                <li>Prevenir fraudos e garantir a segurança da plataforma.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-2xl tracking-wide text-white">
                4. Compartilhamento de dados
              </h2>
              <p className="mt-3">
                Não vendemos nem alugamos seus dados pessoais a terceiros. Seus dados
                podem ser compartilhados apenas com:
              </p>
              <ul className="mt-3 list-inside list-disc space-y-1 text-neutral-300">
                <li>
                  <strong className="font-semibold text-white">Transportadoras e empresas de frete</strong> para realização da entrega.
                </li>
                <li>
                  <strong className="font-semibold text-white">Processadores de pagamento</strong> para concluir transações de forma segura.
                </li>
                <li>
                  <strong className="font-semibold text-white">Plataformas de e-mail marketing</strong> para envio de comunicações, quando autorizado.
                </li>
                <li>
                  <strong className="font-semibold text-white">Autoridades competentes</strong>, quando exigido por lei ou ordem judicial.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-2xl tracking-wide text-white">
                5. Cookies
              </h2>
              <p className="mt-3">
                Utilizamos cookies para melhorar sua experiência de navegação. Cookies
                são pequenos arquivos armazenados no seu dispositivo que nos permitem
                reconhecer visitas recorrentes, personalizar conteúdo e analisar o
                tráfego do site.
              </p>
              <p className="mt-3">
                Você pode gerenciar ou desativar cookies pelas configurações do seu
                navegador. No entanto, a desativação pode afetar o funcionamento
                de algumas funcionalidades da loja.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl tracking-wide text-white">
                6. Segurança dos dados
              </h2>
              <p className="mt-3">
                Adotamos medidas técnicas e administrativas para proteger seus dados
                contra acesso não autorizado, alteração, divulgação ou destruição
                indevida. Entre elas: criptografia de senhas, acesso restrito a
                informações e monitoramento de atividades na plataforma.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl tracking-wide text-white">
                7. Retenção dos dados
              </h2>
              <p className="mt-3">
                Seus dados pessoais são mantidos pelo tempo necessário para cumprir
                as finalidades descritas nesta política, ou pelo prazo exigido por
                lei. Dados de cadastro são mantidos enquanto sua conta estiver ativa.
                Após a exclusão da conta, dados pessoais serão removidos ou
                anonimizados, exceto quando houver obrigação legal de conservação.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl tracking-wide text-white">
                8. Seus direitos (LGPD)
              </h2>
              <p className="mt-3">
                De acordo com a LGPD, você tem o direito de:
              </p>
              <ul className="mt-3 list-inside list-disc space-y-1 text-neutral-300">
                <li>
                  <strong className="font-semibold text-white">Confirmar</strong> a existência de tratamento dos seus dados.
                </li>
                <li>
                  <strong className="font-semibold text-white">Acessar</strong> seus dados pessoais armazenados.
                </li>
                <li>
                  <strong className="font-semibold text-white">Corrigir</strong> dados incompletos, inexatos ou desatualizados.
                </li>
                <li>
                  <strong className="font-semibold text-white">Anonimizar, bloquear ou eliminar</strong> dados desnecessários ou excessivos.
                </li>
                <li>
                  <strong className="font-semibold text-white">Solicitar a portabilidade</strong> dos dados a outro fornecedor.
                </li>
                <li>
                  <strong className="font-semibold text-white">Eliminar</strong> dados pessoais tratados com seu consentimento.
                </li>
                <li>
                  <strong className="font-semibold text-white">Revogar o consentimento</strong> a qualquer momento.
                </li>
                <li>
                  <strong className="font-semibold text-white">Opor-se</strong> ao tratamento de dados em caso de descumprimento da LGPD.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-2xl tracking-wide text-white">
                9. Menores de idade
              </h2>
              <p className="mt-3">
                Nossa loja não se destina a menores de 16 anos. Não coletamos
                intencionalmente dados de crianças ou adolescentes. Caso tomemos
                conhecimento de que dados de um menor foram coletados sem o
                consentimento do responsável, procederemos à exclusão imediata
                dessas informações.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl tracking-wide text-white">
                10. Alterações nesta política
              </h2>
              <p className="mt-3">
                Esta Política de Privacidade pode ser atualizada a qualquer momento.
                Recomendamos que você consulte esta página periodicamente para se
                manter informado sobre como protegemos seus dados.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl tracking-wide text-white">
                11. Contato
              </h2>
              <p className="mt-3">
                Em caso de dúvidas ou solicitações relacionadas aos seus dados
                pessoais, entre em contato:
              </p>
              <ul className="mt-3 list-inside list-disc space-y-1 text-neutral-300">
                <li>
                  <strong className="font-semibold text-white">E-mail:</strong>{" "}
                  <a href={`mailto:${siteConfig.email}`} className="text-brand underline transition-colors hover:text-brand-dark">
                    {siteConfig.email}
                  </a>
                </li>
                <li>
                  <strong className="font-semibold text-white">WhatsApp:</strong>{" "}
                  <a href={`https://wa.me/${siteConfig.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-brand underline transition-colors hover:text-brand-dark">
                    {siteConfig.whatsappDisplay}
                  </a>
                </li>
                <li>
                  <strong className="font-semibold text-white">Endereço:</strong>{" "}
                  {siteConfig.address}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
