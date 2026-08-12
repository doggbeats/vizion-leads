import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { redirect } from "next/navigation";
import { ClientesManager, type ClienteItem } from "@/components/admin/ClientesManager";

export const dynamic = "force-dynamic";

export default async function AdminClientesPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/login");

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      nome: true,
      email: true,
      telefone: true,
      role: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
  });

  const clientes: ClienteItem[] = users.map((user) => ({
    id: user.id,
    nome: user.nome,
    email: user.email,
    telefone: user.telefone,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    ordersCount: user._count.orders,
  }));

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-brand">
          Administração
        </p>
        <h1 className="font-display text-3xl tracking-wide text-white sm:text-4xl lg:text-5xl">
          Clientes
        </h1>
        <p className="mt-2 text-sm text-neutral-400">
          Gerencie os clientes cadastrados na loja.
        </p>
      </div>

      <ClientesManager initial={clientes} currentUserId={admin.id} />
    </div>
  );
}
