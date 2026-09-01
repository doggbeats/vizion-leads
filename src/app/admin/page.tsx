import Link from "next/link";
import {
  Users,
  ShoppingBag,
  Banknote,
  Package,
  ArrowRight,
  PackageCheck,
  Boxes,
  TrendingUp,
  FileText,
} from "lucide-react";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { LineChart } from "@/components/admin/Charts";

export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;

function monthLabel(d: Date): string {
  return d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
}

export default async function AdminDashboard() {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * DAY_MS);

  const [
    totalClientes,
    totalPedidos,
    totalProdutos,
    produtosAtivos,
    orders,
    lowStock,
    aguardandoPostagem,
    estoqueSoma,
    produtosVendidos,
    recentOrders,
    bestSellerRows,
  ] = await Promise.all([
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
      where: { status: { in: ["PAGO", "EM_PRODUCAO"] } },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    }),
    db.product.aggregate({
      _sum: { stock: true },
    }),
    db.orderItem.aggregate({
      where: { order: { status: { not: "CANCELADO" } } },
      _sum: { quantity: true },
    }),
    db.order.findMany({
      where: { status: { not: "CANCELADO" }, createdAt: { gte: sixMonthsAgo } },
      orderBy: { createdAt: "asc" },
      select: { total: true, createdAt: true },
    }),
    db.orderItem.groupBy({
      by: ["productName"],
      where: { order: { status: { not: "CANCELADO" } } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);

  const receitaAgregada = await db.order.aggregate({
    where: { status: { not: "CANCELADO" } },
    _sum: { total: true },
  });
  const receita = receitaAgregada._sum.total ?? 0;

  const pedidosDoMes = await db.order.count({
    where: {
      status: { not: "CANCELADO" },
      createdAt: { gte: new Date(now.getFullYear(), now.getMonth(), 1) },
    },
  });

  // Sales evolution grouped by month (last 6 months)
  const salesByMonth = new Map<string, number>();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    salesByMonth.set(`${d.getFullYear()}-${d.getMonth()}`, 0);
  }
  for (const o of recentOrders) {
    const d = new Date(o.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (salesByMonth.has(key)) {
      salesByMonth.set(key, (salesByMonth.get(key) ?? 0) + o.total);
    }
  }

  const evolutionData = Array.from(salesByMonth.entries()).map(([key, value]) => ({
    label: monthLabel(new Date(`${key}-01T00:00:00`)),
    value: value,
  }));

  // Top 5 categories by revenue (via order items joined price)
  const categoryRevenue = new Map<string, number>();
  const recentItems = await db.orderItem.findMany({
    where: { order: { status: { not: "CANCELADO" } } },
    select: { productName: true, price: true, quantity: true },
  });
  for (const item of recentItems) {
    const name = item.productName;
    const total = item.price * item.quantity;
    categoryRevenue.set(
      name,
      (categoryRevenue.get(name) ?? 0) + total,
    );
  }

  const bestSellers = bestSellerRows.map((row) => ({
    name: row.productName,
    quantity: row._sum.quantity ?? 0,
  }));

  // Best sellers by revenue
  const bestByRevenue = Array.from(categoryRevenue.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  const estoqueBaixo = lowStock.length;

  const stats = [
    { label: "Faturamento", value: formatCurrency(receita), icon: Banknote },
    { label: "Pedidos", value: String(totalPedidos), icon: ShoppingBag },
    { label: "Clientes", value: String(totalClientes), icon: Users },
    { label: "Produtos vendidos", value: String(produtosVendidos._sum.quantity ?? 0), icon: Package },
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-graphite-border bg-graphite p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Produtos cadastrados
            </span>
            <Package size={18} className="text-brand" />
          </div>
          <p className="text-2xl font-bold text-white">{totalProdutos}</p>
          <p className="mt-1 text-xs text-neutral-500">
            {produtosAtivos} ativos na loja
          </p>
        </div>
        <div className="rounded-2xl border border-graphite-border bg-graphite p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Estoque atual
            </span>
            <Boxes size={18} className="text-brand" />
          </div>
          <p className="text-2xl font-bold text-white">{estoqueSoma._sum.stock ?? 0}</p>
          <p className="mt-1 text-xs text-neutral-500">unidades no total</p>
        </div>
        <div className="rounded-2xl border border-graphite-border bg-graphite p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Estoque baixo
            </span>
            <FileText size={18} className="text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400">{estoqueBaixo}</p>
          <p className="mt-1 text-xs text-neutral-500">produtos com &le; 5 un.</p>
        </div>
        <div className="rounded-2xl border border-graphite-border bg-graphite p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Pedidos no mês
            </span>
            <TrendingUp size={18} className="text-brand" />
          </div>
          <p className="text-2xl font-bold text-white">{pedidosDoMes}</p>
          <p className="mt-1 text-xs text-neutral-500">neste mês</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-graphite-border bg-graphite p-5">
          <h2 className="font-display text-2xl tracking-wide text-white">
            Evolução das vendas
          </h2>
          <p className="mb-6 mt-1 text-xs text-neutral-500">
            Faturamento dos últimos 6 meses
          </p>
          <LineChart data={evolutionData} height={200} formatValue={formatCurrency} />
        </section>

        <section className="rounded-2xl border border-graphite-border bg-graphite p-5">
          <h2 className="font-display text-2xl tracking-wide text-white">
            Produtos mais vendidos
          </h2>
          <p className="mb-6 mt-1 text-xs text-neutral-500">
            Por quantidade vendida
          </p>
          {bestSellers.length === 0 ? (
            <p className="py-10 text-sm text-neutral-500">
              Nenhuma venda registrada ainda.
            </p>
          ) : (
            <ul className="space-y-3">
              {bestSellers.map((row, i) => (
                <li key={row.name} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/15 text-xs font-bold text-brand">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm text-neutral-200">
                    {row.name}
                  </span>
                  <span className="shrink-0 text-sm font-bold text-brand">
                    {row.quantity} {row.quantity === 1 ? "un." : "un."}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-graphite-border bg-graphite p-5">
          <h2 className="font-display text-2xl tracking-wide text-white">
            Vendas por produto
          </h2>
          <p className="mb-6 mt-1 text-xs text-neutral-500">
            Faturamento (Top 5)
          </p>
          {bestByRevenue.length === 0 ? (
            <p className="py-10 text-sm text-neutral-500">
              Nenhuma venda registrada ainda.
            </p>
          ) : (
            <div className="space-y-4">
              {bestByRevenue.map((row, i) => {
                const max = bestByRevenue[0].value;
                const pct = Math.max((row.value / max) * 100, 4);
                return (
                  <div key={i}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="truncate pr-3 text-neutral-200">{row.name}</span>
                      <span className="shrink-0 font-semibold text-brand">
                        {formatCurrency(row.value)}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-graphite-light">
                      <div
                        className="h-full rounded-full bg-brand"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
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
    </div>
  );
}
