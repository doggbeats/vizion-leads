"use client";

import { useState, type FormEvent } from "react";
import { Plus, Trash2, Eye, X } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge, ORDER_STATUSES, type OrderStatus } from "./StatusBadge";
import { formatCurrency, formatDate } from "@/lib/format";
import type { AdminProduct } from "./ProdutosManager";

export type AdminOrderItem = {
  id: string;
  productId: string | null;
  productName: string;
  price: number;
  quantity: number;
  size: string;
};

export type AdminOrder = {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  status: OrderStatus;
  cep: string | null;
  endereco: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  documento: string | null;
  documentoTipo: string | null;
  total: number;
  notes: string | null;
  createdAt: string;
  user: { id: string; nome: string; email: string } | null;
  items: AdminOrderItem[];
};

export type AdminClientOption = {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
};

type ItemForm = {
  key: string;
  productId: string;
  productName: string;
  price: string;
  quantity: string;
  size: string;
};

let itemKey = 0;
const nextKey = () => `item-${++itemKey}-${Date.now()}`;

export function PedidosManager({
  initial,
  clients,
  products,
}: {
  initial: AdminOrder[];
  clients: AdminClientOption[];
  products: AdminProduct[];
}) {
  const [orders, setOrders] = useState(initial);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewOrder, setViewOrder] = useState<AdminOrder | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [status, setStatus] = useState<OrderStatus>("PENDENTE");
  const [cep, setCep] = useState("");
  const [endereco, setEndereco] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [documentoTipo, setDocumentoTipo] = useState<"CPF" | "CNPJ">("CPF");
  const [documento, setDocumento] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<ItemForm[]>([]);

  const inputClass =
    "w-full rounded-lg border border-graphite-border bg-graphite px-4 py-3 text-sm text-white placeholder:text-neutral-500 outline-none transition-colors focus:border-brand";

  function resetForm() {
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setSelectedClient("");
    setStatus("PENDENTE");
    setCep("");
    setEndereco("");
    setNumero("");
    setComplemento("");
    setBairro("");
    setCidade("");
    setEstado("");
    setDocumentoTipo("CPF");
    setDocumento("");
    setNotes("");
    setItems([newEmptyItem()]);
    setErro("");
  }

  function newEmptyItem(): ItemForm {
    return {
      key: nextKey(),
      productId: "",
      productName: "",
      price: "",
      quantity: "1",
      size: "",
    };
  }

  function openNew() {
    resetForm();
    setModalOpen(true);
  }

  function handleClientSelect(clientId: string) {
    setSelectedClient(clientId);
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      setCustomerName(client.nome);
      setCustomerPhone(client.telefone ?? "");
      setCustomerEmail(client.email);
    }
  }

  function handleProductSelect(key: string, productId: string) {
    const product = products.find((p) => p.id === productId);
    setItems((prev) =>
      prev.map((item) =>
        item.key === key
          ? {
              ...item,
              productId,
              productName: product?.name ?? "",
              price: product
                ? String(product.promotionalPrice ?? product.price)
                : item.price,
              size: product?.sizes[0] ?? "",
            }
          : item,
      ),
    );
  }

  function updateItem(key: string, patch: Partial<ItemForm>) {
    setItems((prev) =>
      prev.map((item) => (item.key === key ? { ...item, ...patch } : item)),
    );
  }

  function removeItem(key: string) {
    setItems((prev) => prev.filter((item) => item.key !== key));
  }

  const subtotal = items.reduce((sum, item) => {
    const price = Number(item.price);
    const quantity = Number(item.quantity);
    return sum + (Number.isFinite(price) && Number.isFinite(quantity) ? price * quantity : 0);
  }, 0);

  async function criarPedido(e: FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro("");

    const payload = {
      userId: selectedClient || null,
      customerName,
      customerPhone,
      customerEmail,
      status,
      cep,
      endereco,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
      documento: documento.replace(/\D/g, "") || undefined,
      documentoTipo,
      notes,
      items: items.map((item) => ({
        productId: item.productId || null,
        productName: item.productName,
        price: Number(item.price),
        quantity: Number(item.quantity),
        size: item.size,
      })),
    };

    try {
      const response = await fetch("/api/admin/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setErro(data.error ?? "Erro ao criar o pedido.");
        return;
      }
      setOrders((prev) => [data.order, ...prev]);
      setModalOpen(false);
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  async function changeStatus(order: AdminOrder, novoStatus: OrderStatus) {
    setBusyId(order.id);
    try {
      const response = await fetch(`/api/admin/pedidos/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: novoStatus }),
      });
      if (!response.ok) return;
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: novoStatus } : o)),
      );
      setViewOrder((v) => (v && v.id === order.id ? { ...v, status: novoStatus } : v));
    } catch {
      // ignore
    } finally {
      setBusyId(null);
    }
  }

  async function excluir(order: AdminOrder) {
    if (!confirm(`Excluir o pedido de "${order.customerName}"?`)) return;
    setBusyId(order.id);
    try {
      const response = await fetch(`/api/admin/pedidos/${order.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== order.id));
      }
    } catch {
      // ignore
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <button
          type="button"
          onClick={openNew}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-ink transition-colors hover:bg-brand-dark sm:w-auto"
        >
          <Plus size={16} />
          Novo pedido
        </button>
      </div>

      {orders.length === 0 ? (
        <p className="rounded-2xl border border-graphite-border bg-graphite p-8 text-sm text-neutral-500">
          Nenhum pedido cadastrado ainda.
        </p>
      ) : (
        <>
          <div className="space-y-4 lg:hidden">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-graphite-border bg-graphite p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-neutral-400">
                      #{order.id.slice(-6).toUpperCase()}
                    </p>
                    <p className="mt-1 truncate font-semibold text-white">
                      {order.customerName}
                    </p>
                    <p className="text-xs text-neutral-500">{order.customerPhone}</p>
                    {order.cep ? (
                      <p className="mt-0.5 text-xs text-neutral-500">
                        CEP {order.cep}
                        {order.documento
                          ? ` · ${order.documentoTipo ?? "CPF"} ${order.documento}`
                          : ""}
                      </p>
                    ) : null}
                  </div>
                  <select
                    value={order.status}
                    onChange={(e) =>
                      changeStatus(order, e.target.value as OrderStatus)
                    }
                    disabled={busyId === order.id}
                    className="shrink-0 rounded-lg border border-graphite-border bg-graphite px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-200 outline-none focus:border-brand disabled:opacity-50"
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs text-neutral-500">
                    {formatDate(order.createdAt)} ·{" "}
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                    {order.items.reduce((sum, item) => sum + item.quantity, 0) === 1
                      ? "item"
                      : "itens"}
                  </p>
                  <span className="font-semibold text-brand">
                    {formatCurrency(order.total)}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setViewOrder(order)}
                    className="flex items-center gap-1.5 rounded-lg border border-graphite-border px-3 py-2 text-xs font-semibold text-neutral-300 transition-colors hover:border-brand hover:text-brand"
                  >
                    <Eye size={14} />
                    Detalhes
                  </button>
                  <button
                    type="button"
                    onClick={() => excluir(order)}
                    disabled={busyId === order.id}
                    title="Excluir"
                    className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg border border-graphite-border text-neutral-400 transition-colors hover:border-red-500 hover:text-red-400 disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-2xl border border-graphite-border bg-graphite lg:block">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="border-b border-graphite-border text-xs uppercase tracking-wider text-neutral-500">
                  <th className="px-5 py-4 font-semibold">Pedido</th>
                  <th className="px-5 py-4 font-semibold">Cliente</th>
                  <th className="px-5 py-4 font-semibold">Itens</th>
                  <th className="px-5 py-4 font-semibold">Total</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 text-right font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-graphite-border">
                {orders.map((order) => (
                  <tr key={order.id} className="text-neutral-300">
                    <td className="px-5 py-4">
                      <p className="font-mono text-xs text-neutral-400">
                        #{order.id.slice(-6).toUpperCase()}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {formatDate(order.createdAt)}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-white">{order.customerName}</p>
                      <p className="text-xs text-neutral-500">{order.customerPhone}</p>
                      {order.cep ? (
                        <p className="mt-0.5 text-xs text-neutral-500">
                          CEP {order.cep}
                          {order.documento
                            ? ` · ${order.documentoTipo ?? "CPF"} ${order.documento}`
                            : ""}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-5 py-4">
                      {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                    </td>
                    <td className="px-5 py-4 font-semibold text-brand">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          changeStatus(order, e.target.value as OrderStatus)
                        }
                        disabled={busyId === order.id}
                        className="rounded-lg border border-graphite-border bg-graphite px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-200 outline-none focus:border-brand disabled:opacity-50"
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setViewOrder(order)}
                          title="Ver detalhes"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-graphite-border text-neutral-400 transition-colors hover:border-brand hover:text-brand"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => excluir(order)}
                          disabled={busyId === order.id}
                          title="Excluir"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-graphite-border text-neutral-400 transition-colors hover:border-red-500 hover:text-red-400 disabled:opacity-50"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Novo pedido"
        className="max-w-2xl"
      >
        <form onSubmit={criarPedido} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-300">
              Cliente cadastrado (opcional)
            </label>
            <select
              value={selectedClient}
              onChange={(e) => handleClientSelect(e.target.value)}
              className={inputClass}
            >
              <option value="">Selecionar cliente...</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.nome} — {client.email}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-300">
                Nome do cliente *
              </label>
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-300">
                Telefone *
              </label>
              <input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className={inputClass}
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-300">
              E-mail
            </label>
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="rounded-xl border border-graphite-border bg-graphite-light p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-400">
                  CEP (opcional)
                </label>
                <input
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  placeholder="00000-000"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-400">
                  Endereço
                </label>
                <input
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  placeholder="Rua, avenida, logradouro"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-400">
                  Número
                </label>
                <input
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  placeholder="Ex.: 123"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-400">
                  Complemento
                </label>
                <input
                  value={complemento}
                  onChange={(e) => setComplemento(e.target.value)}
                  placeholder="Apto, bloco, casa... (opcional)"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-400">
                  Bairro
                </label>
                <input
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-400">
                    Cidade
                  </label>
                  <input
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-400">
                    UF
                  </label>
                  <input
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                    placeholder="SP"
                    maxLength={2}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-400">
                  Documento para nota fiscal
                </label>
                <div className="flex gap-2">
                  {(["CPF", "CNPJ"] as const).map((tipo) => (
                    <button
                      key={tipo}
                      type="button"
                      onClick={() => setDocumentoTipo(tipo)}
                      className={`flex-1 rounded-lg border px-2 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                        documentoTipo === tipo
                          ? "border-brand bg-brand/10 text-brand"
                          : "border-graphite-border bg-graphite text-neutral-400 hover:border-neutral-600"
                      }`}
                    >
                      {tipo}
                    </button>
                  ))}
                </div>
              </div>
              <div className="sm:col-span-2">
                <input
                  value={documento}
                  onChange={(e) =>
                    setDocumento(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder={
                    documentoTipo === "CPF"
                      ? "000.000.000-00"
                      : "00.000.000/0000-00"
                  }
                  maxLength={documentoTipo === "CPF" ? 11 : 14}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-300">
              Itens
            </label>
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.key}
                  className="grid grid-cols-12 gap-2 rounded-lg border border-graphite-border bg-graphite-light p-3"
                >
                  <select
                    value={item.productId}
                    onChange={(e) => handleProductSelect(item.key, e.target.value)}
                    className={`${inputClass} col-span-12 sm:col-span-5`}
                  >
                    <option value="">Selecionar produto...</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                  <input
                    value={item.size}
                    onChange={(e) => updateItem(item.key, { size: e.target.value })}
                    placeholder="Tam"
                    className={`${inputClass} col-span-4 sm:col-span-2`}
                  />
                  <input
                    value={item.price}
                    onChange={(e) => updateItem(item.key, { price: e.target.value })}
                    placeholder="Preço"
                    inputMode="decimal"
                    className={`${inputClass} col-span-4 sm:col-span-2`}
                  />
                  <input
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(item.key, { quantity: e.target.value })
                    }
                    type="number"
                    min={1}
                    className={`${inputClass} col-span-3 sm:col-span-2`}
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(item.key)}
                    title="Remover item"
                    className="col-span-1 flex items-center justify-center rounded-lg text-neutral-400 transition-colors hover:text-red-400"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setItems((prev) => [...prev, newEmptyItem()])}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-dark"
            >
              <Plus size={15} />
              Adicionar item
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-300">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                className={inputClass}
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-300">
                Observações
              </label>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Opcional"
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-graphite-light px-4 py-3">
            <span className="text-sm text-neutral-400">Total do pedido</span>
            <span className="text-xl font-bold text-brand">
              {formatCurrency(subtotal)}
            </span>
          </div>

          {erro ? <p className="text-sm text-red-400">{erro}</p> : null}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-lg border border-graphite-border px-4 py-2.5 text-sm font-semibold text-neutral-300 transition-colors hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="rounded-lg bg-brand px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-ink transition-colors hover:bg-brand-dark disabled:opacity-50"
            >
              {salvando ? "Criando..." : "Criar pedido"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={viewOrder !== null}
        onClose={() => setViewOrder(null)}
        title={viewOrder ? `Pedido #${viewOrder.id.slice(-6).toUpperCase()}` : ""}
        className="max-w-lg"
      >
        {viewOrder ? (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">{viewOrder.customerName}</p>
                <p className="text-sm text-neutral-400">{viewOrder.customerPhone}</p>
                {viewOrder.customerEmail ? (
                  <p className="text-sm text-neutral-400">{viewOrder.customerEmail}</p>
                ) : null}
              </div>
              <StatusBadge status={viewOrder.status} />
            </div>

            {viewOrder.cep ||
            viewOrder.endereco ||
            viewOrder.numero ||
            viewOrder.bairro ||
            viewOrder.cidade ||
            viewOrder.estado ||
            viewOrder.documento ? (
              <div className="rounded-xl border border-graphite-border bg-graphite-light p-4">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-neutral-500">
                  Entrega e nota fiscal
                </p>
                {viewOrder.endereco ||
                viewOrder.numero ||
                viewOrder.complemento ? (
                  <p className="mt-2 text-sm text-white">
                    {[viewOrder.endereco, viewOrder.numero, viewOrder.complemento]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                ) : null}
                {viewOrder.bairro ||
                viewOrder.cidade ||
                viewOrder.estado ||
                viewOrder.cep ? (
                  <p className="text-sm text-neutral-400">
                    {[viewOrder.bairro, viewOrder.cidade, viewOrder.estado]
                      .filter(Boolean)
                      .join(", ")}
                    {viewOrder.cep ? ` · CEP ${viewOrder.cep}` : ""}
                  </p>
                ) : null}
                {viewOrder.documento ? (
                  <p className="text-sm text-neutral-400">
                    {viewOrder.documentoTipo ?? "CPF"} {viewOrder.documento}
                  </p>
                ) : null}
              </div>
            ) : null}

            <p className="text-xs text-neutral-500">{formatDate(viewOrder.createdAt)}</p>

            <ul className="space-y-2 rounded-xl bg-graphite-light p-4">
              {viewOrder.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-white">
                      {item.productName}
                      {item.size ? <span className="text-neutral-500"> · {item.size}</span> : null}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {item.quantity} x {formatCurrency(item.price)}
                    </p>
                  </div>
                  <span className="shrink-0 font-semibold text-white">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            {viewOrder.notes ? (
              <p className="text-sm text-neutral-400">
                <span className="font-semibold text-neutral-300">Obs:</span>{" "}
                {viewOrder.notes}
              </p>
            ) : null}

            <div className="flex items-center justify-between border-t border-graphite-border pt-4">
              <span className="text-sm text-neutral-400">Total</span>
              <span className="text-xl font-bold text-brand">
                {formatCurrency(viewOrder.total)}
              </span>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-300">
                Alterar status
              </label>
              <select
                value={viewOrder.status}
                onChange={(e) => changeStatus(viewOrder, e.target.value as OrderStatus)}
                className={inputClass}
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
