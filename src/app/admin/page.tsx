import Link from "next/link";
import {
  Users,
  ShoppingBag,
  Banknote,
  Package,
  ArrowRight,
  PackageCheck,
} from "lucide-react";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/admin/StatusBadge";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [totalClientes, totalPedidos, totalProdutos, produtosAtivos, orders, lowStock, aguardandoPostagem] =
    await Promise.all([
      db.user.count(),
      db.order.count(),
      db.product.count(),
      db.product.count({ where: { active: true } }),
      db.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { items: true },
      }),
      db.product.findMany({
        where: { active: true, stock: { lte: 5 } },
        orderBy: { stock: "asc" },
        take: 6,
      }),
      db.order.findMany({
        where: { status: "PAGO" },
        orderBy: { createdAt: "desc" },
        include: { items: true },
      }),
    ]);

  const agregaReceita = await db.order.aggregate({
    where: { status: { not: "CANCELADO" } },
    _sum: { total: true },
  });
  const receita = agregaReceita._sum.total ?? 0;

  const stats = [
    { label: "Clientes", value: String(totalClientes), icon: Users },
    { label: "Pedidos", value: String(totalPedidos), icon: ShoppingBag },
    { label: "Receita", value: formatCurrency(receita), icon: Banknote },
    { label: "Produtos ativos", value: `${produtosAtivos}/${totalProdutos}`, icon: Package },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-brand">
          Dashboard
        </p>
        <h1 className="font-display text-3xl tracking-wide text-white sm:text-4xl lg:text-5xl">
          Visão geral
        </h1>
      </div>

      {aguardandoPostagem.length > 0 && (
        <div className="flex flex-col gap-4 rounded-2xl border border-brand/40 bg-brand/10 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/20">
              <PackageCheck size={20} className="text-brand" />
            </span>
            <div>
              <p className="font-display text-lg tracking-wide text-white">
                {aguardandoPostagem.length}{" "}
                {aguardandoPostagem.length === 1
                  ? "pedido pago aguardando"
                  : "pedidos pagos aguardando"}{" "}
                {aguardandoPostagem.some((o) => o.retirada)
                  ? "separação"
                  : "separação e postagem"}
              </p>
              <p className="mt-1 text-sm text-neutral-400">
                {aguardandoPostagem.some((o) => o.retirada)
                  ? "Separe os itens do estoque para retirada na loja."
                  : "Separe os itens, gere a etiqueta e marque como enviado para liberar o acompanhamento do cliente."}
              </p>
            </div>
          </div>
          <Link
            href="/admin/pedidos"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-bold uppercase tracking-wider text-black transition-colors hover:bg-brand-dark"
          >
            Separar e postar <ArrowRight size={16} />
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-graphite-border bg-graphite p-5"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                {stat.label}
              </span>
              <stat.icon size={18} className="text-brand" />
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-graphite-border bg-graphite lg:col-span-2">
          <div className="flex items-center justify-between border-b border-graphite-border p-5">
            <h2 className="font-display text-2xl tracking-wide text-white">
              Pedidos recentes
            </h2>
            <Link
              href="/admin/pedidos"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand hover:text-brand-dark"
            >
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>
          {orders.length === 0 ? (
            <p className="p-8 text-sm text-neutral-500">
              Nenhum pedido cadastrado ainda.
            </p>
          ) : (
            <ul className="divide-y divide-graphite-border">
              {orders.map((order) => (
                <li
                  key={order.id}
                  className="flex items-center justify-between gap-4 px-5 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white">
                      {order.customerName}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {formatDate(order.createdAt)} · {order.items.length} {order.items.length === 1 ? "item" : "itens"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="font-semibold text-brand">
                      {formatCurrency(order.total)}
                    </span>
                    <StatusBadge status={order.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-graphite-border bg-graphite">
          <div className="flex items-center justify-between border-b border-graphite-border p-5">
            <h2 className="font-display text-2xl tracking-wide text-white">
              Estoque baixo
            </h2>
            <Link
              href="/admin/produtos"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand hover:text-brand-dark"
            >
              Produtos <ArrowRight size={14} />
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="p-8 text-sm text-neutral-500">
              Nenhum produto com estoque baixo.
            </p>
          ) : (
            <ul className="divide-y divide-graphite-border">
              {lowStock.map((product) => (
                <li
                  key={product.id}
                  className="flex items-center justify-between gap-4 px-5 py-4"
                >
                  <p className="truncate font-semibold text-white">
                    {product.name}
                  </p>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                      product.stock <= 0
                        ? "bg-red-500/15 text-red-400"
                        : "bg-amber-500/15 text-amber-400"
                    }`}
                  >
                    {product.stock <= 0 ? "Esgotado" : `${product.stock} un.`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
