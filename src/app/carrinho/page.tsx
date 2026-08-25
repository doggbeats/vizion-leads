"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowRight,
  Loader2,
  Minus,
  Plus,
  ShoppingBag,
  Store,
  Trash2,
  Truck,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { useCart } from "@/lib/cart";
import { useSession } from "@/lib/session";
import { useToast } from "@/components/ui/toast";
import { formatCurrency, formatCep } from "@/lib/format";
import { saveCheckoutData, savePaymentData, clearCheckoutData } from "@/lib/checkout";
import { getColorLabel } from "@/lib/colors";
import type { ProductSize } from "@/lib/types";

type FreteOption = {
  id: number;
  name: string;
  price: number;
  deliveryTime: number;
  company: string;
};

export default function CartPage() {
  const { items, count, subtotal, promoResult, updateQuantity, removeItem, clear } = useCart();
  const { user, loading } = useSession();
  const { showToast } = useToast();
  const router = useRouter();

  const [nome, setNome] = useState(user?.nome ?? "");
  const [telefone, setTelefone] = useState(user?.telefone ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [erro, setErro] = useState("");

  const [freteCep, setFreteCep] = useState("");
  const [freteOptions, setFreteOptions] = useState<FreteOption[]>([]);
  const [freteSelecionado, setFreteSelecionado] = useState<FreteOption | null>(null);
  const [freteCepConsultado, setFreteCepConsultado] = useState("");
  const [calculandoFrete, setCalculandoFrete] = useState(false);
  const [freteErro, setFreteErro] = useState("");
  const [retirada, setRetirada] = useState(false);

  async function calcularFrete() {
    const cep = freteCep.replace(/\D/g, "");
    if (cep.length !== 8) {
      setFreteErro("Digite um CEP válido.");
      return;
    }
    setCalculandoFrete(true);
    setFreteErro("");
    setRetirada(false);
    try {
      const response = await fetch("/api/frete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cep,
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
        }),
      });
      const data = await response.json();
      if (response.ok && data.options?.length) {
        setFreteOptions(data.options);
        setFreteSelecionado(data.options[0]);
        setRetirada(data.options[0].id === -1);
        setFreteCepConsultado(cep);
      } else {
        setFreteErro(data.error ?? "Não foi possível calcular o frete.");
      }
    } catch {
      setFreteErro("Erro de conexão ao calcular o frete.");
    } finally {
      setCalculandoFrete(false);
    }
  }

  async function handleCheckout(event: React.FormEvent) {
    event.preventDefault();
    setErro("");

    const checkoutData = {
      customerName: nome,
      customerPhone: telefone,
      customerEmail: email,
      frete: retirada || freteGratis
        ? null
        : freteSelecionado
          ? {
              cep: freteCepConsultado,
              valor: freteSelecionado.price,
              prazo: freteSelecionado.deliveryTime,
              servico: freteSelecionado.name,
              transportadora: freteSelecionado.company,
            }
          : null,
      retirada,
    };
    saveCheckoutData(checkoutData);

    if (loading) {
      setErro("Aguarde a validação da sessão...");
      return;
    }
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent("/carrinho")}`);
      return;
    }

    if (!retirada) {
      router.push("/carrinho/entrega");
      return;
    }

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...checkoutData,
          cep: undefined,
          endereco: undefined,
          numero: undefined,
          complemento: undefined,
          bairro: undefined,
          cidade: undefined,
          estado: undefined,
          frete: 0,
          retirada: true,
          items: items.map((item) => ({
            productId: item.product.id,
            productName: item.product.name,
            price: item.product.promotionalPrice ?? item.product.price,
            quantity: item.quantity,
            size: item.size,
            color: item.color ?? null,
          })),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        savePaymentData({
          orderId: data.order.id,
          orderNumber: data.order.orderNumber,
          total: data.order.total,
          frete: 0,
          desconto: 0,
          items: data.order.items.map(
            (item: { productName: string; price: number; quantity: number; size: string; color?: string | null }) => ({
              productName: item.productName,
              price: item.price,
              quantity: item.quantity,
              size: item.size,
              color: item.color ?? null,
            }),
          ),
          customerName: nome,
          customerPhone: telefone,
          retirada: true,
          address: null,
        });
        clear();
        clearCheckoutData();
        showToast("Pedido finalizado! Escolha a forma de pagamento.");
        router.push(`/carrinho/pagamento?pedido=${data.order.id}`);
      } else {
        if (response.status === 401) {
          router.push(
            `/login?redirect=${encodeURIComponent("/carrinho")}`,
          );
          return;
        }
        setErro(data.details ?? data.error ?? "Erro ao finalizar o pedido.");
        showToast(data.details ?? data.error ?? "Erro ao finalizar o pedido.", "error");
      }
    } catch {
      setErro("Erro de conexão. Tente novamente.");
      showToast("Erro de conexão. Tente novamente.", "error");
    }
  }

  const temFreteGratis = freteOptions.some((o) => o.price === 0);
  const freteGratis = temFreteGratis || (!!user && subtotal >= 200);
  const totalComFrete = subtotal + (retirada || freteGratis ? 0 : freteSelecionado?.price ?? 0);

  return (
    <section className="bg-ink py-16 sm:py-20">
      <Container>
        <div className="mb-10 sm:mb-12">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-brand">
            Carrinho
          </p>
          <h1 className="font-display text-5xl tracking-wide text-white sm:text-6xl">
            Carrinho de compras
          </h1>
        </div>

        {items.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag size={48} />}
            title="Seu carrinho está vazio"
            description="Explore nossa coleção e adicione produtos para começar suas compras."
            action={
              <Link
                href="/produtos"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-bold uppercase tracking-wider text-ink transition-colors hover:bg-brand-dark"
              >
                Ver produtos
                <ArrowRight size={16} />
              </Link>
            }
          />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            <div className="space-y-4">
              {items.map((item) => {
                const price = item.product.promotionalPrice ?? item.product.price;
                const hasPromotion =
                  item.product.promotionalPrice !== undefined &&
                  item.product.promotionalPrice < item.product.price;

                return (
                  <article
                    key={`${item.product.id}-${item.size}-${item.color ?? ""}`}
                    className="flex flex-col gap-4 rounded-2xl border border-graphite-border bg-graphite p-4 sm:flex-row sm:items-center sm:p-5"
                  >
                    <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-xl bg-graphite-light sm:w-28">
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, 112px"
                        className="object-cover"
                      />
                    </div>

                    <div className="flex flex-1 flex-col gap-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-white">
                            {item.product.name}
                          </h3>
                          <p className="mt-1 text-xs font-medium uppercase tracking-wider text-neutral-500">
                            Tam {item.size}{item.color ? ` · ${getColorLabel(item.color)}` : ""}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.product.id, item.size, item.color)}
                          aria-label={`Remover ${item.product.name} do carrinho`}
                          className="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-graphite-light hover:text-red-400"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-1 rounded-lg border border-graphite-border bg-graphite-light">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.size as ProductSize,
                                item.quantity - 1,
                                item.color,
                              )
                            }
                            disabled={item.quantity <= 1}
                            aria-label={`Diminuir quantidade de ${item.product.name}`}
                            className="flex h-9 w-9 items-center justify-center text-neutral-400 transition-colors hover:text-brand disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <Minus size={14} />
                          </button>
                          <span
                            aria-live="polite"
                            className="w-10 text-center text-sm font-semibold text-white"
                          >
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.size as ProductSize,
                                item.quantity + 1,
                                item.color,
                              )
                            }
                            disabled={item.quantity >= item.product.stock}
                            aria-label={`Aumentar quantidade de ${item.product.name}`}
                            className="flex h-9 w-9 items-center justify-center text-neutral-400 transition-colors hover:text-brand disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <div className="text-right">
                          {hasPromotion ? (
                            <p className="text-xs text-neutral-500 line-through">
                              {formatCurrency(item.product.price)}
                            </p>
                          ) : null}
                          <p className="font-bold text-brand">
                            {formatCurrency(price * item.quantity)}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {formatCurrency(price)} / un.
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    clear();
                    showToast("Carrinho esvaziado", "info");
                  }}
                  className="text-sm font-medium text-neutral-500 transition-colors hover:text-red-400"
                >
                  Esvaziar carrinho
                </button>
              </div>
            </div>

            <aside className="h-fit rounded-2xl border border-graphite-border bg-graphite p-6 lg:sticky lg:top-28">
              <h2 className="font-display text-2xl tracking-wide text-white">
                Resumo da compra
              </h2>

              <ul className="mt-5 space-y-3">
                {items.map((item) => {
                  const price = item.product.promotionalPrice ?? item.product.price;
                  return (
                    <li
                      key={`${item.product.id}-${item.size}-${item.color ?? ""}`}
                      className="flex items-start gap-3"
                    >
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-graphite-light">
                        <Image
                          src={item.product.images[0]}
                          alt=""
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-neutral-500">
                          Tam {item.size}{item.color ? ` · ${getColorLabel(item.color)}` : ""} · {item.quantity}x{" "}
                          {formatCurrency(price)}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-neutral-300">
                        {formatCurrency(price * item.quantity)}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <dl className="mt-5 space-y-3 border-t border-graphite-border pt-4 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-neutral-400">
                    Subtotal ({count} {count === 1 ? "item" : "itens"})
                  </dt>
                  <dd className="text-neutral-300">{formatCurrency(subtotal)}</dd>
                </div>
                {promoResult.hasPromo && (
                  <div className="flex items-center justify-between">
                    <dt className="text-green-400">
                      Economia promo
                      {promoResult.groups.map((g) => (
                        <span key={`${g.promoQuantity}-${g.promoPrice}`}>
                          {" "}
                          ({g.groups}x {g.promoQuantity} por {formatCurrency(g.promoPrice)})
                        </span>
                      ))}
                    </dt>
                    <dd className="font-semibold text-green-400">
                      -{formatCurrency(promoResult.totalSaved)}
                    </dd>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <dt className="text-neutral-400">Frete</dt>
                  {freteGratis ? (
                    <dd className="font-semibold text-green-400">Grátis</dd>
                  ) : freteSelecionado ? (
                    <dd className="text-neutral-300">
                      {formatCurrency(freteSelecionado.price)}
                    </dd>
                  ) : (
                    <dd className="text-neutral-500">Calcular abaixo</dd>
                  )}
                </div>
                <div className="flex items-center justify-between border-t border-graphite-border pt-3">
                  <dt className="font-semibold text-white">Total</dt>
                  <dd className="text-xl font-bold text-brand">
                    {formatCurrency(totalComFrete)}
                  </dd>
                </div>
              </dl>

              <div className="mt-6 rounded-2xl border border-graphite-border bg-graphite-light p-4">
                <div className="flex items-center gap-2">
                  <Truck size={18} className="text-brand" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-brand">
                    Calcular frete
                  </h3>
                </div>
                {!retirada ? (
                  <>
                    <div className="mt-3 flex gap-2">
                      <Input
                        label="CEP para entrega"
                        inputMode="numeric"
                        value={freteCep}
                        onChange={(e) => setFreteCep(formatCep(e.target.value))}
                        placeholder="00000-000"
                        maxLength={9}
                        className="py-2.5"
                      />
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={calcularFrete}
                          disabled={calculandoFrete}
                          className="flex h-11 items-center justify-center gap-2 rounded-lg bg-brand px-4 text-xs font-bold uppercase tracking-wider text-ink transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {calculandoFrete ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            "Calcular"
                          )}
                        </button>
                      </div>
                    </div>

                    {freteErro ? (
                      <p role="alert" className="mt-2 text-xs text-red-400">
                        {freteErro}
                      </p>
                    ) : null}
                  </>
                ) : null}

                {freteOptions.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    {freteOptions.map((option) => {
                      const ativo = freteSelecionado?.id === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => {
                            setFreteSelecionado(option);
                            setRetirada(option.id === -1);
                          }}
                          aria-pressed={ativo}
                          className={`flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left transition-colors ${
                            ativo
                              ? "border-brand bg-brand/10"
                              : "border-graphite-border bg-graphite hover:border-neutral-600"
                          }`}
                        >
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold text-white">
                              {option.name}
                            </span>
                            <span className="block text-xs text-neutral-400">
                              {option.company}
                              {option.deliveryTime > 0
                                ? ` · até ${option.deliveryTime} dias úteis`
                                : ""}
                            </span>
                          </span>
                          <span className="shrink-0 text-sm font-bold text-brand">
                            {formatCurrency(option.price)}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                ) : null}

                {!retirada && freteOptions.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setRetirada(true);
                      setFreteSelecionado(null);
                      setFreteOptions([]);
                    }}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-graphite-border bg-graphite p-3 text-sm font-semibold text-neutral-300 transition-colors hover:border-brand/60 hover:text-white"
                  >
                    <Store size={16} />
                    Retirar no local — Grátis
                  </button>
                ) : null}

                {retirada ? (
                  <div className="mt-3 flex items-center justify-between rounded-lg border border-brand bg-brand/10 p-3">
                    <span className="flex items-center gap-2 text-sm font-semibold text-white">
                      <Store size={16} className="text-brand" />
                      Retirada no local
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setRetirada(false);
                        setFreteSelecionado(null);
                      }}
                      className="text-xs font-medium text-neutral-400 underline transition-colors hover:text-white"
                    >
                      Trocar
                    </button>
                  </div>
                ) : null}
              </div>

              <form onSubmit={handleCheckout} className="mt-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-brand">
                    Dados do contato
                  </h3>
                  <Input
                    label="Nome completo"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Seu nome"
                    required
                  />
                  <Input
                    label="Telefone / WhatsApp"
                    type="tel"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(00) 00000-0000"
                    required
                  />
                  <Input
                    label="E-mail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                  />
                </div>

                {erro ? (
                  <p role="alert" className="text-sm text-red-400">
                    {erro}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={items.length === 0}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand text-sm font-bold uppercase tracking-wider text-ink transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Finalizar pedido
                  <ArrowRight size={18} />
                </button>
              </form>

              <p className="mt-4 text-center text-xs leading-relaxed text-neutral-500">
                Após a confirmação, entraremos em contato para combinar a
                forma de pagamento e a entrega.
              </p>
            </aside>
          </div>
        )}
      </Container>
    </section>
  );
}
