export type OrderStatus = "PENDENTE" | "PAGO" | "ENVIADO" | "ENTREGUE" | "CANCELADO";

const statusStyles: Record<OrderStatus, string> = {
  PENDENTE: "bg-amber-500/15 text-amber-400",
  PAGO: "bg-sky-500/15 text-sky-400",
  ENVIADO: "bg-purple-500/15 text-purple-400",
  ENTREGUE: "bg-emerald-500/15 text-emerald-400",
  CANCELADO: "bg-red-500/15 text-red-400",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${statusStyles[status] ?? "bg-neutral-500/15 text-neutral-400"}`}
    >
      {status}
    </span>
  );
}

export const ORDER_STATUSES: OrderStatus[] = [
  "PENDENTE",
  "PAGO",
  "ENVIADO",
  "ENTREGUE",
  "CANCELADO",
];
