"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  PackageSearch,
  Truck,
  CheckCircle2,
  Store,
  XCircle,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";

type OrderItem = {
  id: string;
  productName: string;
  price: number;
  quantity: number;
  size: string;
  color?: string | null;
};

type Order = {
  id: string;
  orderNumber: number;
  customerName: string;
  status: string;
  total: number;
  frete: number;
  retirada: boolean;
  cep: string | null;
  endereco: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  notes: string | null;
  createdAt: string;
  items: OrderItem[];
};

const STATUS_STEPS = ["PENDENTE", "PAGO", "EM_PRODUCAO", "ENVIADO", "ENTREGUE"];

const STATUS_LABELS: Record<string, string> = {
  PENDENTE: "Pendente",
  PAGO: "Pago",
  EM_PRODUCAO: "Em Produção",
  ENVIADO: "Enviado",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado",
};

function OrderTracking({ status, retirada }: { status: string; retirada: boolean }) {
  if (status === "CANCELADO") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/5 px-5 py-4">
        <XCircle size={22} className="shrink-0 text-red-400" />
        <div>
          <p className="text-sm font-bold text-red-400">Pedido Cancelado</p>
          <p className="text-xs text-zinc-500">
            Não foi possível concluir este pedido.
          </p>
        </div>
      </div>
    );
  }

  const currentStep = STATUS_STEPS.indexOf(status);
  if (currentStep === -1) return null;

  const stepMeta = [
    {
      icon: ClipboardCheck,
      short: "Recebido",
      label: "Pedido recebido",
      desc: "Pedido registrado com sucesso.",
    },
    {
      icon: CheckCircle2,
      short: "Pago",
      label: "Pagamento confirmado",
      desc: "Pagamento aprovado.",
    },
    {
      icon: PackageSearch,
      short: "Preparação",
      label: "Em preparação",
      desc: "Separando seus itens.",
    },
    {
      icon: retirada ? Store : Truck,
      short: retirada ? "Retirada" : "Enviado",
      label: retirada ? "Disponível para retirada" : "Enviado",
      desc: retirada ? "Pronto para retirar na loja." : "A caminho do seu endereço.",
    },
    {
      icon: CheckCircle2,
      short: "Entregue",
      label: "Entregue",
      desc: "Pedido entregue com sucesso.",
    },
  ];

  return (
    <div>
      <ol className="relative flex items-start justify-between">
        {STATUS_STEPS.map((step, i) => {
          const active = i <= currentStep;
          const current = i === currentStep;
          const meta = stepMeta[i];
          const Icon = meta.icon;
          const isLast = i === STATUS_STEPS.length - 1;
          return (
            <li key={step} className="relative flex flex-1 flex-col items-center text-center">
              {!isLast ? (
                <span
                  className={`absolute left-1/2 top-5 block h-0.5 w-full ${
                    i < currentStep ? "bg-[#B6FF00]/50" : "bg-zinc-800"
                  }`}
                />
              ) : null}
              <div
                className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                  current
                    ? "border-[#B6FF00] bg-[#B6FF00] text-black shadow-[0_0_16px_rgba(182,255,0,0.5)]"
                    : active
                      ? "border-[#B6FF00] bg-[#B6FF00]/15 text-[#B6FF00]"
                      : "border-zinc-700 bg-zinc-900 text-zinc-600"
                }`}
              >
                <Icon size={18} />
              </div>
              <p
                className={`mt-2 hidden text-[11px] font-bold uppercase tracking-wider sm:block ${
                  current ? "text-[#B6FF00]" : active ? "text-zinc-200" : "text-zinc-600"
                }`}
              >
                {meta.label}
              </p>
              <p
                className={`mt-2 text-[10px] font-semibold uppercase tracking-wider sm:hidden ${
                  current ? "text-[#B6FF00]" : active ? "text-zinc-300" : "text-zinc-600"
                }`}
              >
                {meta.short}
              </p>
            </li>
          );
        })}
      </ol>

      <div className="mt-4 rounded-xl border border-[#B6FF00]/20 bg-[#B6FF00]/5 px-5 py-4">
        <p className="text-sm font-bold text-[#B6FF00]">
          {stepMeta[currentStep].label}
        </p>
        <p className="mt-0.5 text-xs text-zinc-400">
          {stepMeta[currentStep].desc}
        </p>
      </div>
    </div>
  );
}

export function ContaPedidos() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [expandido, setExpandido] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/conta/pedidos")
      .then((r) => r.json())
      .then((data) => {
        setOrders(data.orders ?? []);
        setCarregando(false);
      })
      .catch(() => setCarregando(false));
  }, []);

  if (carregando) {
    return <p className="text-zinc-400">Carregando pedidos...</p>;
  }

  if (orders.length === 0) {
    return (
      <div className="space-y-4 text-center">
        <Package size={48} className="mx-auto text-zinc-700" />
        <h2 className="text-xl font-bold text-white">Meus Pedidos</h2>
        <p className="text-zinc-400">Você ainda não fez nenhum pedido.</p>
        <Link
          href="/produtos"
          className="inline-block rounded-lg bg-[#B6FF00] px-6 py-3 font-bold text-black transition hover:opacity-90"
        >
          VER PRODUTOS
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">
        Meus Pedidos ({orders.length})
      </h2>

      <div className="space-y-4">
        {orders.map((order) => {
          const isOpen = expandido === order.id;
          return (
            <div
              key={order.id}
              className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900"
            >
              <button
                type="button"
                onClick={() => setExpandido(isOpen ? null : order.id)}
                className="flex w-full items-center justify-between gap-4 p-4 text-left transition-colors hover:bg-zinc-800/50"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-xs text-zinc-500">
                      #{order.orderNumber}
                    </p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        order.status === "CANCELADO"
                          ? "bg-red-500/15 text-red-400"
                          : order.status === "ENTREGUE"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-[#B6FF00]/15 text-[#B6FF00]"
                      }`}
                    >
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-zinc-400">
                    {formatDate(order.createdAt)} ·{" "}
                    {order.items.reduce((s, i) => s + i.quantity, 0)}{" "}
                    {order.items.reduce((s, i) => s + i.quantity, 0) === 1
                      ? "item"
                      : "itens"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="font-bold text-[#B6FF00]">
                    {formatCurrency(order.total)}
                  </span>
                  {isOpen ? (
                    <ChevronUp size={18} className="text-zinc-500" />
                  ) : (
                    <ChevronDown size={18} className="text-zinc-500" />
                  )}
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-zinc-800 px-4 pb-4 pt-4 space-y-4">
                  <OrderTracking status={order.status} retirada={order.retirada} />

                  <div className="space-y-2 rounded-xl bg-zinc-800/50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                      Itens
                    </p>
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-zinc-300">
                          {item.productName}
                          {item.size ? (
                            <span className="text-zinc-500"> · {item.size}</span>
                          ) : null}
                          {item.color ? (
                            <span className="text-zinc-500"> · {item.color}</span>
                          ) : null}
                          <span className="text-zinc-500">
                            {" "}
                            x{item.quantity}
                          </span>
                        </span>
                        <span className="font-semibold text-white">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between border-t border-zinc-700 pt-2 text-sm">
                      <span className="text-zinc-400">Frete</span>
                      <span className="text-zinc-300">
                        {formatCurrency(order.frete)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1 text-sm">
                      <span className="font-semibold text-zinc-300">Total</span>
                      <span className="font-bold text-[#B6FF00]">
                        {formatCurrency(order.total)}
                      </span>
                    </div>
                  </div>

                  {order.retirada && (
                    <div className="rounded-xl border border-[#B6FF00]/30 bg-[#B6FF00]/5 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#B6FF00]">
                        Retirada na loja
                      </p>
                      <p className="mt-1 text-sm text-zinc-300">
                        Aguarde a confirmação para retirar na loja.
                      </p>
                    </div>
                  )}

                  {!order.retirada &&
                    (order.endereco || order.cidade) && (
                      <div className="rounded-xl bg-zinc-800/50 p-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                          Endereço de entrega
                        </p>
                        {order.endereco && (
                          <p className="mt-1 text-sm text-zinc-300">
                            {[order.endereco, order.numero, order.complemento]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                        )}
                        <p className="text-sm text-zinc-400">
                          {[order.bairro, order.cidade, order.estado]
                            .filter(Boolean)
                            .join(", ")}
                          {order.cep ? ` · CEP ${order.cep}` : ""}
                        </p>
                      </div>
                    )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
