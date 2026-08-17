"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  ShoppingBag,
  Store,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { useCart } from "@/lib/cart";
import { useSession } from "@/lib/session";
import { useToast } from "@/components/ui/toast";
import { formatCurrency, formatCep } from "@/lib/format";
import {
  clearCheckoutData,
  loadCheckoutData,
  savePaymentData,
  type CheckoutData,
} from "@/lib/checkout";

const ESTADOS = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

export default function EntregaPage() {
  const { items, count, subtotal, clear, loaded } = useCart();
  const { user } = useSession();
  const { showToast } = useToast();
  const router = useRouter();

  const [checkout, setCheckout] = useState<CheckoutData | null>(null);
  const [ready, setReady] = useState(false);

  const [cep, setCep] = useState("");
  const [endereco, setEndereco] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const pedidoFinalizado = useRef(false);

  useEffect(() => {
    const data = loadCheckoutData();
    window.setTimeout(() => {
      if (data?.frete?.cep) {
        setCep(formatCep(data.frete.cep));
      }
      setCheckout(data);
      setReady(true);
    }, 0);
  }, []);

  useEffect(() => {
    if (!ready || !loaded) return;
    if (pedidoFinalizado.current) return;
    if (items.length === 0 || !checkout) {
      router.replace("/carrinho");
    }
  }, [ready, loaded, items.length, checkout, router]);

  async function buscarCep(cepBruto: string) {
    const digito = cepBruto.replace(/\D/g, "");
    if (digito.length !== 8) return;
    setCarregando(true);
    setErro("");
    try {
      const response = await fetch(`https://viacep.com.br/ws/${digito}/json/`);
      const data = await response.json();
      if (data.erro) {
        setErro("CEP não encontrado. Preencha os dados manualmente.");
        return;
      }
      setEndereco(data.logradouro ?? "");
      setBairro(data.bairro ?? "");
      setCidade(data.localidade ?? "");
      setEstado(data.uf ?? "");
    } catch {
      setErro("Não foi possível buscar o CEP. Preencha manualmente.");
    } finally {
      setCarregando(false);
    }
  }

  const retirada = checkout?.retirada === true;
  const freteGratis = !!user && subtotal >= 200;
  const desconto = !!user ? Math.round(subtotal * 0.1 * 100) / 100 : 0;
  const freteValor = retirada || freteGratis ? 0 : (checkout?.frete?.valor ?? 0);
  const totalComFrete = subtotal - desconto + freteValor;

  async function handleConfirm(event: React.FormEvent) {
    event.preventDefault();
    setCarregando(true);
    setErro("");

    if (!checkout) {
      setErro("Dados de contato não encontrados. Volte ao carrinho.");
      setCarregando(false);
      return;
    }

    if (!retirada) {
      if (cep.replace(/\D/g, "").length !== 8) {
        setErro("Digite um CEP válido.");
        setCarregando(false);
        return;
      }

      if (!endereco || !numero || !bairro || !cidade || !estado) {
        setErro("Preencha o endereço completo para a entrega.");
        setCarregando(false);
        return;
      }
    }

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: checkout.customerName,
          customerPhone: checkout.customerPhone,
          customerEmail: checkout.customerEmail,
          cep: retirada ? undefined : cep,
          endereco: retirada ? undefined : endereco,
          numero: retirada ? undefined : numero,
          complemento: retirada ? undefined : complemento,
          bairro: retirada ? undefined : bairro,
          cidade: retirada ? undefined : cidade,
          estado: retirada ? undefined : estado,
          frete: retirada || freteGratis ? 0 : (checkout.frete?.valor ?? 0),
          retirada,
          items: items.map((item) => ({
            productId: item.product.id,
            productName: item.product.name,
            price: item.product.promotionalPrice ?? item.product.price,
            quantity: item.quantity,
            size: item.size,
          })),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        pedidoFinalizado.current = true;
        savePaymentData({
          orderId: data.order.id,
          total: data.order.total,
          frete: data.order.frete ?? 0,
          desconto: data.order.desconto ?? 0,
          items: data.order.items.map(
            (item: { productName: string; price: number; quantity: number; size: string }) => ({
              productName: item.productName,
              price: item.price,
              quantity: item.quantity,
              size: item.size,
            }),
          ),
          customerName: checkout.customerName,
          customerPhone: checkout.customerPhone,
          retirada,
          address: retirada
            ? null
            : { cep, endereco, numero, complemento, bairro, cidade, estado },
        });
        clear();
        clearCheckoutData();
        showToast("Pedido finalizado! Escolha a forma de pagamento.");
        router.push(`/carrinho/pagamento?pedido=${data.order.id}`);
      } else {
        if (response.status === 401) {
          router.push(
            `/login?redirect=${encodeURIComponent("/carrinho/entrega")}`,
          );
          return;
        }
        setErro(data.details ?? data.error ?? "Erro ao finalizar o pedido.");
        showToast(data.details ?? data.error ?? "Erro ao finalizar o pedido.", "error");
      }
    } catch {
      setErro("Erro de conexão. Tente novamente.");
      showToast("Erro de conexão. Tente novamente.", "error");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <section className="bg-ink py-16 sm:py-20">
      <Container>
        <div className="mb-10 sm:mb-12">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-brand">
            Entrega
          </p>
          <h1 className="font-display text-5xl tracking-wide text-white sm:text-6xl">
            {retirada ? "Retirada na loja" : "Endereço de entrega"}
          </h1>
          <Link
            href="/carrinho"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-neutral-400 transition-colors hover:text-brand"
          >
            <ArrowLeft size={16} />
            Voltar ao resumo da compra
          </Link>
        </div>

        {!ready || !loaded ? (
          <EmptyState
            icon={<ShoppingBag size={48} />}
            title="Carregando..."
            description="Aguarde enquanto preparamos sua entrega."
          />
        ) : items.length === 0 || !checkout ? (
          <EmptyState
            icon={<ShoppingBag size={48} />}
            title="Seu carrinho está vazio"
            description="Adicione produtos para prosseguir com a entrega."
            action={
              <Link
                href="/carrinho"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-bold uppercase tracking-wider text-ink transition-colors hover:bg-brand-dark"
              >
                Voltar ao carrinho
                <ArrowRight size={16} />
              </Link>
            }
          />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            <form onSubmit={handleConfirm} className="space-y-6">
              {retirada ? (
                <div className="space-y-4 rounded-2xl border border-brand/40 bg-graphite p-6">
                  <div className="flex items-center gap-2">
                    <Store size={18} className="text-brand" />
                    <h2 className="font-display text-2xl tracking-wide text-white">
                      Retirada na loja
                    </h2>
                  </div>
                  <p className="text-sm leading-relaxed text-neutral-400">
                    Seu pedido ficará separado em nossa loja e sem custo de
                    entrega. Você pode retirar após a confirmação do pagamento.
                  </p>
                  <div className="rounded-xl border border-graphite-border bg-graphite-light p-4 text-sm">
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-neutral-500">
                      Endereço da loja
                    </p>
                    <p className="mt-2 font-medium text-white">
                      Av. Exemplo, 000 - Bairro
                    </p>
                    <p className="text-neutral-400">Cidade/UF</p>
                  </div>
                  {erro ? (
                    <p role="alert" className="text-sm text-red-400">
                      {erro}
                    </p>
                  ) : null}
                </div>
              ) : (
                <div className="space-y-4 rounded-2xl border border-graphite-border bg-graphite p-6">
                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-brand" />
                    <h2 className="font-display text-2xl tracking-wide text-white">
                      Dados para entrega
                    </h2>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="CEP"
                      inputMode="numeric"
                      autoComplete="postal-code"
                      value={cep}
                      onChange={(e) => {
                        const value = formatCep(e.target.value);
                        setCep(value);
                        const digito = value.replace(/\D/g, "");
                        if (digito.length === 8) {
                          buscarCep(value);
                        }
                      }}
                      placeholder="00000-000"
                      maxLength={9}
                      required
                    />
                    <Input
                      label="Número"
                      inputMode="numeric"
                      autoComplete="address-level2"
                      value={numero}
                      onChange={(e) => setNumero(e.target.value)}
                      placeholder="Ex.: 123"
                      required
                    />
                  </div>

                  <Input
                    label="Endereço"
                    autoComplete="street-address"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    placeholder="Rua, avenida, logradouro"
                    required
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Complemento"
                      value={complemento}
                      onChange={(e) => setComplemento(e.target.value)}
                      placeholder="Apto, bloco... (opcional)"
                    />
                    <Input
                      label="Bairro"
                      autoComplete="address-level2"
                      value={bairro}
                      onChange={(e) => setBairro(e.target.value)}
                      placeholder="Seu bairro"
                      required
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Cidade"
                      autoComplete="address-level2"
                      value={cidade}
                      onChange={(e) => setCidade(e.target.value)}
                      placeholder="Sua cidade"
                      required
                    />
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="estado" className="text-sm font-medium text-neutral-300">
                        Estado
                      </label>
                      <select
                        id="estado"
                        value={estado}
                        onChange={(e) => setEstado(e.target.value)}
                        className="w-full rounded-lg border border-graphite-border bg-graphite px-4 py-3 text-sm text-white outline-none transition-colors focus:border-brand"
                        required
                      >
                        <option value="">UF</option>
                        {ESTADOS.map((uf) => (
                          <option key={uf} value={uf}>
                            {uf}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {erro ? (
                    <p role="alert" className="text-sm text-red-400">
                      {erro}
                    </p>
                  ) : null}
                </div>
              )}

              <button
                type="submit"
                disabled={carregando}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand text-sm font-bold uppercase tracking-wider text-ink transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                {carregando ? "Finalizando..." : retirada ? "Confirmar retirada" : "Confirmar pedido"}
                <ArrowRight size={18} />
              </button>

              <p className="text-center text-xs leading-relaxed text-neutral-500">
                {retirada
                  ? "Após a confirmação, entraremos em contato para combinar a forma de pagamento. Retirada na loja sem custo de entrega."
                  : "Após a confirmação, entraremos em contato para combinar a forma de pagamento e a entrega."}
              </p>
            </form>

            <aside className="h-fit rounded-2xl border border-graphite-border bg-graphite p-6 lg:sticky lg:top-28">
              <h2 className="font-display text-2xl tracking-wide text-white">
                Resumo da compra
              </h2>

              <ul className="mt-5 space-y-3">
                {items.map((item) => {
                  const price = item.product.promotionalPrice ?? item.product.price;
                  return (
                    <li
                      key={`${item.product.id}-${item.size}`}
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
                          Tam {item.size} · {item.quantity}x {formatCurrency(price)}
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
                {desconto > 0 ? (
                  <div className="flex items-center justify-between">
                    <dt className="text-green-400">Desconto (10% cadastro)</dt>
                    <dd className="font-semibold text-green-400">
                      -{formatCurrency(desconto)}
                    </dd>
                  </div>
                ) : null}
                <div className="flex items-center justify-between">
                  <dt className="text-neutral-400">Frete</dt>
                  {retirada ? (
                    <dd className="text-neutral-300">Grátis (retirada)</dd>
                  ) : freteGratis ? (
                    <dd className="font-semibold text-green-400">Grátis</dd>
                  ) : checkout?.frete ? (
                    <dd className="text-neutral-300">
                      {formatCurrency(freteValor)}
                    </dd>
                  ) : (
                    <dd className="text-neutral-500">Calculado na entrega</dd>
                  )}
                </div>
                <div className="flex items-center justify-between border-t border-graphite-border pt-3">
                  <dt className="font-semibold text-white">Total</dt>
                  <dd className="text-xl font-bold text-brand">
                    {formatCurrency(totalComFrete)}
                  </dd>
                </div>
              </dl>

              <div className="mt-5 rounded-xl border border-graphite-border bg-graphite-light p-4 text-sm">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-neutral-500">
                  Contato
                </p>
                <p className="mt-2 font-medium text-white">{checkout.customerName}</p>
                <p className="text-neutral-400">{checkout.customerPhone}</p>
                {checkout.customerEmail ? (
                  <p className="text-neutral-400">{checkout.customerEmail}</p>
                ) : null}
              </div>
            </aside>
          </div>
        )}
      </Container>
    </section>
  );
}
