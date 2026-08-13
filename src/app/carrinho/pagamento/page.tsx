"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CreditCard,
  Loader2,
  QrCode,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/format";
import { loadPaymentData, type PaymentData } from "@/lib/checkout";

const METODOS = [
  {
    id: "credito",
    label: "Cartão de crédito",
    description: "Via InfinitPay, com parcelamento",
    icon: CreditCard,
  },
  {
    id: "debito",
    label: "Cartão de débito",
    description: "Pagamento na hora via InfinitPay",
    icon: Wallet,
  },
  {
    id: "pix",
    label: "PIX",
    description: "Aprovação imediata via InfinitPay",
    icon: QrCode,
  },
] as const;

type MetodoId = (typeof METODOS)[number]["id"];

export default function PagamentoPage() {
  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [ready, setReady] = useState(false);
  const [metodo, setMetodo] = useState<MetodoId>("pix");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const data = loadPaymentData();
    window.setTimeout(() => {
      setPayment(data);
      setReady(true);
    }, 0);
  }, []);

  async function handlePagar() {
    if (!payment) return;
    setCarregando(true);
    setErro("");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: payment.orderId }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
        return;
      }

      setErro(data.error ?? "Não foi possível gerar o pagamento.");
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <section className="bg-ink py-16 sm:py-20">
      <Container>
        <div className="mb-10 sm:mb-12">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-brand">
            Pagamento
          </p>
          <h1 className="font-display text-5xl tracking-wide text-white sm:text-6xl">
            Forma de pagamento
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
            description="Aguarde enquanto preparamos o pagamento."
          />
        ) : !payment ? (
          <EmptyState
            icon={<ShoppingBag size={48} />}
            title="Nenhum pedido encontrado"
            description="Finalize um pedido para escolher a forma de pagamento."
            action={
              <Link
                href="/carrinho"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-bold uppercase tracking-wider text-ink transition-colors hover:bg-brand-dark"
              >
                Ir para o carrinho
                <ArrowRight size={16} />
              </Link>
            }
          />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            <div className="space-y-6">
              <div className="space-y-4 rounded-2xl border border-graphite-border bg-graphite p-6">
                <h2 className="font-display text-2xl tracking-wide text-white">
                  Escolha como pagar
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

                {erro ? (
                  <p role="alert" className="text-sm text-red-400">
                    {erro}
                  </p>
                ) : null}

                <button
                  type="button"
                  onClick={handlePagar}
                  disabled={carregando}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand text-sm font-bold uppercase tracking-wider text-ink transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {carregando ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Gerando pagamento...
                    </>
                  ) : (
                    <>
                      Pagar agora
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <p className="text-center text-xs leading-relaxed text-neutral-500">
                  O pagamento é processado com segurança pelo{" "}
                  <span className="font-semibold text-neutral-400">InfinitPay</span>.
                  Você será redirecionado para concluir a compra.
                </p>
              </div>
            </div>

            <aside className="h-fit rounded-2xl border border-graphite-border bg-graphite p-6 lg:sticky lg:top-28">
              <h2 className="font-display text-2xl tracking-wide text-white">
                Resumo do pedido
              </h2>

              <p className="mt-2 text-xs text-neutral-500">
                Pedido{" "}
                <span className="font-semibold text-brand">#{payment.orderId}</span>
              </p>

              <ul className="mt-5 space-y-3">
                {payment.items.map((item, index) => (
                  <li key={index} className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">
                        {item.productName}
                      </p>
                      <p className="text-xs text-neutral-500">
                        Tam {item.size} · {item.quantity}x{" "}
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
                <div className="flex items-center justify-between">
                  <dt className="text-neutral-400">Frete</dt>
                  <dd className="text-neutral-300">
                    {formatCurrency(payment.frete ?? 0)}
                  </dd>
                </div>
                <div className="flex items-center justify-between border-t border-graphite-border pt-3">
                  <dt className="font-semibold text-white">Total</dt>
                  <dd className="text-xl font-bold text-brand">
                    {formatCurrency(payment.total)}
                  </dd>
                </div>
              </dl>

              <div className="mt-5 rounded-xl border border-graphite-border bg-graphite-light p-4 text-sm">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-neutral-500">
                  Pagamento selecionado
                </p>
                <p className="mt-2 font-medium text-white">
                  {METODOS.find((m) => m.id === metodo)?.label} via InfinitPay
                </p>
              </div>
            </aside>
          </div>
        )}
      </Container>
    </section>
  );
}
