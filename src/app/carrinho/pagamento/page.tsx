"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  QrCode,
  ShoppingBag,
  MessageCircle,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/format";
import { siteConfig } from "@/lib/site";
import { loadPaymentData, type PaymentData } from "@/lib/checkout";

const METODOS = [
  {
    id: "pix",
    label: "PIX",
    description: "Pagamento imediato, taxa zero",
    icon: QrCode,
  },
  {
    id: "credito",
    label: "Cartão de crédito",
    description: "Em até 6x",
    icon: CreditCard,
  },
] as const;

type MetodoId = (typeof METODOS)[number]["id"];

function buildWhatsAppUrl(payment: PaymentData, metodo: MetodoId): string {
  const metodoLabel = METODOS.find((m) => m.id === metodo)?.label ?? "";
  const totalFinal = metodo === "pix"
    ? payment.total - Math.round((payment.total - (payment.frete ?? 0)) * 0.05 * 100) / 100
    : payment.total;
  const descontoPix = metodo === "pix" ? Math.round((payment.total - (payment.frete ?? 0)) * 0.05 * 100) / 100 : 0;
  const linhas = [
    "Olá! Seja bem-vindo à VIZION STORE.",
    "",
    "Recebemos sua solicitação de compra pelo nosso site.",
    "",
    "Para finalizar seu pedido, vamos confirmar os detalhes por aqui:",
    "",
    ...payment.items.flatMap((item) => [
      `Produto: ${item.productName}`,
      `Tamanho: ${item.size}${item.color ? ` · Cor: ${item.color}` : ""}`,
      `Quantidade: ${item.quantity}x`,
      `Valor: ${formatCurrency(item.price * item.quantity)}`,
      "",
    ]),
    `Subtotal: ${formatCurrency(payment.total - (payment.frete ?? 0))}`,
    ...(descontoPix > 0
      ? [`Desconto (5% PIX): -${formatCurrency(descontoPix)}`, ""]
      : []),
    `Frete: ${payment.retirada ? "Grátis (retirada na loja)" : (payment.frete ?? 0) === 0 ? "Grátis" : formatCurrency(payment.frete ?? 0)}`,
    `Total: ${formatCurrency(totalFinal)}`,
    "",
    `Forma de pagamento: ${metodoLabel}`,
    "",
    ...(payment.retirada
      ? ["Tipo: Retirada na loja"]
      : payment.address
        ? [
            "Tipo: Entrega",
            `Endereço: ${payment.address.endereco}, ${payment.address.numero}${payment.address.complemento ? ` - ${payment.address.complemento}` : ""}`,
            `${payment.address.bairro} - ${payment.address.cidade}/${payment.address.estado}`,
            `CEP: ${payment.address.cep}`,
          ]
        : ["Tipo: Entrega"]),
    "",
    "Após a confirmação, enviaremos um link oficial de pagamento para você.",
    "",
    "Segurança: não solicitamos senha, dados completos do cartão ou código de segurança pelo WhatsApp. O pagamento é realizado através do nosso provedor de pagamento.",
    "",
    `VIZION STORE`,
    `CNPJ: ${siteConfig.cnpj}`,
    "",
    `Política de Privacidade: ${siteConfig.url}/privacidade`,
    "",
    "Se estiver tudo certo, responda CONFIRMO e continuaremos seu pedido.",
  ];
  return `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(linhas.join("\n"))}`;
}

export default function PagamentoPage() {
  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [ready, setReady] = useState(false);
  const [metodo, setMetodo] = useState<MetodoId>("pix");

  useEffect(() => {
    const data = loadPaymentData();
    window.setTimeout(() => {
      setPayment(data);
      setReady(true);
    }, 0);
  }, []);

  return (
    <section className="bg-ink py-16 sm:py-20">
      <Container>
        <div className="mb-10 sm:mb-12">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-brand">
            Finalizar compra
          </p>
          <h1 className="font-display text-5xl tracking-wide text-white sm:text-6xl">
            Confirmação do pedido
          </h1>
          <Link
            href="/carrinho/entrega"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-neutral-400 transition-colors hover:text-brand"
          >
            <ArrowLeft size={16} />
            Voltar para o endereço de entrega
          </Link>
        </div>

        {!ready ? (
          <EmptyState
            icon={<ShoppingBag size={48} />}
            title="Carregando..."
            description="Aguarde enquanto preparamos seu pedido."
          />
        ) : !payment ? (
          <EmptyState
            icon={<ShoppingBag size={48} />}
            title="Nenhum pedido encontrado"
            description="Finalize um pedido para continuar."
            action={
              <Link
                href="/carrinho"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-bold uppercase tracking-wider text-ink transition-colors hover:bg-brand-dark"
              >
                Ir para o carrinho
              </Link>
            }
          />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            <div className="space-y-6">
              <div className="space-y-4 rounded-2xl border border-graphite-border bg-graphite p-6">
                <h2 className="font-display text-2xl tracking-wide text-white">
                  Como você quer pagar?
                </h2>

                <div className="space-y-3">
                  {METODOS.map((metodoItem) => {
                    const Icon = metodoItem.icon;
                    const ativo = metodo === metodoItem.id;
                    return (
                      <button
                        key={metodoItem.id}
                        type="button"
                        onClick={() => setMetodo(metodoItem.id)}
                        aria-pressed={ativo}
                        className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors ${
                          ativo
                            ? "border-brand bg-brand/10"
                            : "border-graphite-border bg-graphite-light hover:border-neutral-600"
                        }`}
                      >
                        <span
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
                            ativo ? "bg-brand text-ink" : "bg-graphite text-neutral-400"
                          }`}
                        >
                          <Icon size={22} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-bold uppercase tracking-wider text-white">
                            {metodoItem.label}
                          </span>
                          <span className="block text-xs text-neutral-400">
                            {metodoItem.description}
                          </span>
                        </span>
                        <span
                          className={`h-5 w-5 shrink-0 rounded-full border-2 ${
                            ativo ? "border-brand bg-brand" : "border-neutral-600"
                          }`}
                          aria-hidden
                        />
                      </button>
                    );
                  })}
                </div>

                <a
                  href={buildWhatsAppUrl(payment, metodo)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] text-sm font-bold uppercase tracking-wider text-ink transition-colors hover:bg-[#1ebe57]"
                >
                  <MessageCircle size={18} />
                  Finalizar pelo WhatsApp
                </a>

                <p className="text-center text-xs leading-relaxed text-neutral-400">
                  Você será direcionado ao WhatsApp com o resumo do pedido.{" "}
                  <span className="font-semibold text-white">
                    Nossa equipe confirmará o pagamento e a retirada/entrega
                  </span>{" "}
                  para concluir sua compra.
                </p>
                <p className="text-center text-xs text-neutral-500">
                  {siteConfig.whatsappDisplay}
                </p>
              </div>
            </div>

            <aside className="h-fit rounded-2xl border border-graphite-border bg-graphite p-6 lg:sticky lg:top-28">
              <h2 className="font-display text-2xl tracking-wide text-white">
                Resumo do pedido
              </h2>

              <p className="mt-2 text-xs text-neutral-500">
                Pedido{" "}
                <span className="font-semibold text-brand">#{payment.orderNumber ?? payment.orderId.slice(0, 8).toUpperCase()}</span>
              </p>

              <ul className="mt-5 space-y-3">
                {payment.items.map((item, index) => (
                  <li key={index} className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">
                        {item.productName}
                      </p>
                      <p className="text-xs text-neutral-500">
                        Tam {item.size}{item.color ? ` · ${item.color}` : ""} · {item.quantity}x{" "}
                        {formatCurrency(item.price)}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-neutral-300">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              <dl className="mt-5 space-y-3 border-t border-graphite-border pt-4 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-neutral-400">Subtotal</dt>
                  <dd className="text-neutral-300">
                    {formatCurrency(payment.total - (payment.frete ?? 0))}
                  </dd>
                </div>
                {metodo === "pix" ? (() => {
                  const descontoPix = Math.round((payment.total - (payment.frete ?? 0)) * 0.05 * 100) / 100;
                  return descontoPix > 0 ? (
                    <div className="flex items-center justify-between">
                      <dt className="text-green-400">Desconto (5% PIX)</dt>
                      <dd className="font-semibold text-green-400">
                        -{formatCurrency(descontoPix)}
                      </dd>
                    </div>
                  ) : null;
                })() : null}
                <div className="flex items-center justify-between">
                  <dt className="text-neutral-400">Frete</dt>
                  <dd className="text-neutral-300">
                    {payment.retirada
                      ? "Grátis (retirada)"
                      : (payment.frete ?? 0) === 0
                        ? "Grátis"
                        : formatCurrency(payment.frete ?? 0)}
                  </dd>
                </div>
                <div className="flex items-center justify-between border-t border-graphite-border pt-3">
                  <dt className="font-semibold text-white">Total</dt>
                  <dd className="text-xl font-bold text-brand">
                    {formatCurrency(
                      metodo === "pix"
                        ? payment.total - Math.round((payment.total - (payment.frete ?? 0)) * 0.05 * 100) / 100
                        : payment.total
                    )}
                  </dd>
                </div>
              </dl>

              <div className="mt-5 rounded-xl border border-graphite-border bg-graphite-light p-4 text-sm">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-neutral-500">
                  Pagamento selecionado
                </p>
                <p className="mt-2 font-medium text-white">
                  {METODOS.find((m) => m.id === metodo)?.label}
                </p>
              </div>

              {!payment.retirada && payment.address ? (
                <div className="mt-5 rounded-xl border border-graphite-border bg-graphite-light p-4 text-sm">
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-neutral-500">
                    Endereço de entrega
                  </p>
                  <p className="mt-2 font-medium text-white">
                    {payment.address.endereco}, {payment.address.numero}
                    {payment.address.complemento
                      ? ` - ${payment.address.complemento}`
                      : ""}
                  </p>
                  <p className="mt-1 text-neutral-400">
                    {payment.address.bairro} - {payment.address.cidade}/
                    {payment.address.estado} · CEP {payment.address.cep}
                  </p>
                </div>
              ) : null}
            </aside>
          </div>
        )}
      </Container>
    </section>
  );
}
