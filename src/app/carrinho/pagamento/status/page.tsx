"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Loader2,
  ShoppingBag,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { formatCurrency } from "@/lib/format";
import { loadPaymentData } from "@/lib/checkout";

function StatusContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("pedido") ?? "";
  const transactionNsu = searchParams.get("transaction_nsu") ?? "";
  const slug = searchParams.get("slug") ?? "";

  const [status, setStatus] = useState<"verificando" | "pago" | "aguardando" | "erro">(
    "verificando",
  );
  const [erro, setErro] = useState("");
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const payment = loadPaymentData();
    if (payment) setTotal(payment.total);

    if (!orderId) {
      setStatus("aguardando");
      return;
    }

    let ativo = true;

    (async () => {
      try {
        const response = await fetch("/api/checkout/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, transactionNsu, slug }),
        });
        const data = await response.json();
        if (!ativo) return;

        if (response.ok && data.paid) {
          setStatus("pago");
        } else {
          setStatus("aguardando");
        }
      } catch {
        if (!ativo) return;
        setStatus("erro");
        setErro("Não foi possível consultar o pagamento. Tente novamente.");
      }
    })();

    return () => {
      ativo = false;
    };
  }, [orderId, transactionNsu, slug]);

  if (status === "verificando") {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-graphite-border bg-graphite p-8 text-center sm:p-12">
        <Loader2 size={48} className="mx-auto animate-spin text-brand" />
        <h1 className="mt-6 font-display text-3xl tracking-wide text-white">
          Verificando pagamento
        </h1>
        <p className="mt-4 text-sm text-neutral-400">
          Aguarde enquanto confirmamos sua compra.
        </p>
      </div>
    );
  }

  if (status === "pago") {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-graphite-border bg-graphite p-8 text-center sm:p-12">
        <CheckCircle2 size={56} className="mx-auto text-brand" />
        <h1 className="mt-6 font-display text-4xl tracking-wide text-white sm:text-5xl">
          Pagamento confirmado!
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-neutral-400">
          Obrigado pela compra. Seu pedido{" "}
          <span className="font-semibold text-brand">#{orderId}</span> foi pago e
          você será notificado assim que for enviado.
        </p>
        {total > 0 ? (
          <div className="mt-6 rounded-xl border border-graphite-border bg-graphite-light p-5 text-left">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-neutral-500">
              Total pago
            </p>
            <p className="mt-1 text-2xl font-bold text-brand">
              {formatCurrency(total)}
            </p>
          </div>
        ) : null}
        <div className="mt-8">
          <Link
            href="/produtos"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-bold uppercase tracking-wider text-ink transition-colors hover:bg-brand-dark"
          >
            Continuar comprando
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  if (status === "erro") {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-graphite-border bg-graphite p-8 text-center sm:p-12">
        <ShoppingBag size={48} className="mx-auto text-brand" />
        <h1 className="mt-6 font-display text-3xl tracking-wide text-white">
          Algo deu errado
        </h1>
        <p className="mt-4 text-sm text-neutral-400">{erro}</p>
        <div className="mt-8">
          <Link
            href="/carrinho/pagamento"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-bold uppercase tracking-wider text-ink transition-colors hover:bg-brand-dark"
          >
            Voltar ao pagamento
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-graphite-border bg-graphite p-8 text-center sm:p-12">
      <Clock3 size={56} className="mx-auto text-brand" />
      <h1 className="mt-6 font-display text-4xl tracking-wide text-white sm:text-5xl">
        Aguardando pagamento
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-neutral-400">
        Seu pedido <span className="font-semibold text-brand">#{orderId}</span>{" "}
        está registrado. Assim que o pagamento for confirmado pelo InfinitPay,
        você será notificado.
      </p>
      <div className="mt-8">
        <Link
          href="/produtos"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-bold uppercase tracking-wider text-ink transition-colors hover:bg-brand-dark"
        >
          Continuar comprando
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}

export default function PagamentoStatusPage() {
  return (
    <section className="bg-ink py-16 sm:py-24">
      <Container>
        <Suspense>
          <StatusContent />
        </Suspense>
      </Container>
    </section>
  );
}
