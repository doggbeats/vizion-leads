import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { redirect } from "next/navigation";
import {
  PedidosManager,
  type AdminOrder,
  type AdminClientOption,
} from "@/components/admin/PedidosManager";
import type { AdminProduct } from "@/components/admin/ProdutosManager";

export const dynamic = "force-dynamic";

export default async function AdminPedidosPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/login");

  const [orders, clients, products] = await Promise.all([
    db.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
        user: { select: { id: true, nome: true, email: true } },
      },
    }),
    db.user.findMany({
      orderBy: { nome: "asc" },
      select: { id: true, nome: true, email: true, telefone: true },
    }),
    db.product.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const pedidos: AdminOrder[] = orders.map((order) => ({
    id: order.id,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerEmail: order.customerEmail,
    status: order.status,
    cep: order.cep,
    endereco: order.endereco,
    numero: order.numero,
    complemento: order.complemento,
    bairro: order.bairro,
    cidade: order.cidade,
    estado: order.estado,
    frete: order.frete,
    retirada: order.retirada,
    total: order.total,
    notes: order.notes,
    createdAt: order.createdAt.toISOString(),
    user: order.user,
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      price: item.price,
      quantity: item.quantity,
      size: item.size,
    })),
  }));

  const clientes: AdminClientOption[] = clients.map((client) => ({
    id: client.id,
    nome: client.nome,
    email: client.email,
    telefone: client.telefone,
  }));

  const produtos: AdminProduct[] = products.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    promotionalPrice: product.promotionalPrice,
    categorySlug: product.categorySlug,
    subcategory: product.subcategory,
    images: product.images,
    sizes: product.sizes,
    stock: product.stock,
    weight: product.weight,
    width: product.width,
    height: product.height,
    length: product.length,
    featured: product.featured,
    active: product.active,
  }));

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-brand">
          Administração
        </p>
        <h1 className="font-display text-3xl tracking-wide text-white sm:text-4xl lg:text-5xl">
          Pedidos
        </h1>
        <p className="mt-2 text-sm text-neutral-400">
          Cadastre pedidos manualmente e acompanhe o status.
        </p>
      </div>

      <PedidosManager initial={pedidos} clients={clientes} products={produtos} />
    </div>
  );
}
