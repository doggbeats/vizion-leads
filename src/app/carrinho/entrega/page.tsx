"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  MapPin,
  ShoppingBag,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { useCart } from "@/lib/cart";
import { useToast } from "@/components/ui/toast";
import { formatCurrency, formatCep } from "@/lib/format";
import {
  clearCheckoutData,
  loadCheckoutData,
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
  const [pedidoId, setPedidoId] = useState<string | null>(null);

  useEffect(() => {
    const data = loadCheckoutData();
    window.setTimeout(() => {
      setCheckout(data);
      setReady(true);
    }, 0);
  }, []);

  useEffect(() => {
    if (!ready || !loaded) return;
    if (items.length === 0 || !checkout) {
      router.replace("/carrinho");
    }
  }, [ready, loaded, items.length, checkout, router]);

  async function handleConfirm(event: React.FormEvent) {
    event.preventDefault();
    setCarregando(true);
    setErro("");

    if (!checkout) {
      setErro("Dados de contato não encontrados. Volte ao carrinho.");
      setCarregando(false);
      return;
    }

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

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: checkout.customerName,
          customerPhone: checkout.customerPhone,
          customerEmail: checkout.customerEmail,
          cep,
          endereco,
          numero,
          complemento,
          bairro,
          cidade,
          estado,
          documentoTipo: checkout.documentoTipo,
          documento: checkout.documento,
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
        clear();
        clearCheckoutData();
        setPedidoId(data.order.id);
        showToast("Pedido finalizado com sucesso!");
      } else {
        setErro(data.error ?? "Erro ao finalizar o pedido.");
        showToast(data.error ?? "Erro ao finalizar o pedido.", "error");
      }
    } catch {
      setErro("Erro de conexão. Tente novamente.");
      showToast("Erro de conexão. Tente novamente.", "error");
    } finally {
      setCarregando(false);
    }
  }

  if (pedidoId) {
    const enderecoCompleto = [
      endereco,
      numero ? `Nº ${numero}` : "",
      complemento,
    ]
      .filter(Boolean)
      .join(", ");

    return (
      <section className="bg-ink py-16 sm:py-24">
        <Container>
          <div className="mx-auto max-w-lg rounded-2xl border border-graphite-border bg-graphite p-8 text-center sm:p-12">
            <CheckCircle2 size={56} className="mx-auto text-brand" />
            <h1 className="mt-6 font-display text-4xl tracking-wide text-white sm:text-5xl">
              Pedido confirmado!
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-neutral-400">
              Obrigado pela compra. Seu pedido{" "}
              <span className="font-semibold text-brand">#{pedidoId}</span> foi
              registrado e você será contatado para a confirmação e entrega.
            </p>
            <div className="mt-6 rounded-xl border border-graphite-border bg-graphite-light p-5 text-left">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-neutral-500">
                Endereço de entrega
              </p>
              {enderecoCompleto ? (
                <p className="mt-2 text-sm text-white">{enderecoCompleto}</p>
              ) : null}
              <p className="mt-1 text-sm text-neutral-400">
                {bairro ? `${bairro}, ` : ""}
                {cidade ? `${cidade} - ` : ""}
                {estado ? `${estado}, ` : ""}
                CEP {cep}
              </p>
            </div>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/produtos"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-bold uppercase tracking-wider text-ink transition-colors hover:bg-brand-dark"
              >
                Continuar comprando
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="bg-ink py-16 sm:py-20">
      <Container>
        <div className="mb-10 sm:mb-12">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-brand">
            Entrega
          </p>
          <h1 className="font-display text-5xl tracking-wide text-white sm:text-6xl">
            Endereço de entrega
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
              <div className="space-y-4 rounded-2xl border border-graphite-border bg-graphite p-6">
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-brand" />
                  <h2 className="font-display text-2xl tracking-wide text-white">
                    Dados para entrega
                  </h2>
                </div>

                <Input
                  label="CEP"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  value={cep}
                  onChange={(e) => setCep(formatCep(e.target.value))}
                  placeholder="00000-000"
                  maxLength={9}
                  required
                />

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
                    label="Número"
                    inputMode="numeric"
                    autoComplete="address-level2"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                    placeholder="Ex.: 123"
                    required
                  />
                  <Input
                    label="Complemento"
                    value={complemento}
                    onChange={(e) => setComplemento(e.target.value)}
                    placeholder="Apto, bloco, casa... (opcional)"
                  />
                </div>

                <Input
                  label="Bairro"
                  autoComplete="address-level2"
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  placeholder="Seu bairro"
                  required
                />

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

              <button
                type="submit"
                disabled={carregando}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand text-sm font-bold uppercase tracking-wider text-ink transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                {carregando ? "Finalizando..." : "Confirmar pedido"}
                <ArrowRight size={18} />
              </button>

              <p className="text-center text-xs leading-relaxed text-neutral-500">
                Após a confirmação, entraremos em contato para combinar a forma
                de pagamento e a entrega.
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
                <div className="flex items-center justify-between">
                  <dt className="text-neutral-400">Frete</dt>
                  <dd className="text-neutral-500">Calculado na entrega</dd>
                </div>
                <div className="flex items-center justify-between border-t border-graphite-border pt-3">
                  <dt className="font-semibold text-white">Total</dt>
                  <dd className="text-xl font-bold text-brand">
                    {formatCurrency(subtotal)}
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
                <p className="mt-1 text-neutral-500">
                  {checkout.documentoTipo} {checkout.documento}
                </p>
              </div>
            </aside>
          </div>
        )}
      </Container>
    </section>
  );
}
