"use client";

import { useState, type FormEvent } from "react";
import { ShieldCheck, Shield, Trash2, Pencil } from "lucide-react";
import { formatDate } from "@/lib/format";
import { Modal } from "@/components/ui/Modal";

export type ClienteItem = {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  role: "ADMIN" | "CLIENT";
  createdAt: string;
  ordersCount: number;
};

export function ClientesManager({
  initial,
  currentUserId,
}: {
  initial: ClienteItem[];
  currentUserId: string;
}) {
  const [clientes, setClientes] = useState(initial);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [erro, setErro] = useState("");

  const [editCliente, setEditCliente] = useState<ClienteItem | null>(null);
  const [editForm, setEditForm] = useState({ nome: "", email: "", telefone: "" });
  const [salvando, setSalvando] = useState(false);

  async function toggleRole(cliente: ClienteItem) {
    setBusyId(cliente.id);
    setErro("");
    const novoRole = cliente.role === "ADMIN" ? "CLIENT" : "ADMIN";
    try {
      const response = await fetch(`/api/admin/clientes/${cliente.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: novoRole }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setErro(data.error ?? "Erro ao atualizar.");
        return;
      }
      setClientes((prev) =>
        prev.map((c) => (c.id === cliente.id ? { ...c, role: novoRole } : c)),
      );
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setBusyId(null);
    }
  }

  function abrirEdicao(cliente: ClienteItem) {
    setEditCliente(cliente);
    setEditForm({
      nome: cliente.nome,
      email: cliente.email,
      telefone: cliente.telefone ?? "",
    });
    setErro("");
  }

  async function salvarEdicao(e: FormEvent) {
    e.preventDefault();
    if (!editCliente) return;
    setSalvando(true);
    setErro("");
    try {
      const response = await fetch(`/api/admin/clientes/${editCliente.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setErro(data.error ?? "Erro ao salvar.");
        return;
      }
      setClientes((prev) =>
        prev.map((c) =>
          c.id === editCliente.id
            ? { ...c, nome: data.user.nome, email: data.user.email, telefone: data.user.telefone }
            : c,
        ),
      );
      setEditCliente(null);
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(cliente: ClienteItem) {
    if (!confirm(`Excluir o cliente "${cliente.nome}"?`)) return;
    setBusyId(cliente.id);
    setErro("");
    try {
      const response = await fetch(`/api/admin/clientes/${cliente.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setErro(data.error ?? "Erro ao excluir.");
        return;
      }
      setClientes((prev) => prev.filter((c) => c.id !== cliente.id));
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setBusyId(null);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-graphite-border bg-graphite px-4 py-3 text-sm text-white placeholder:text-neutral-500 outline-none transition-colors focus:border-brand";

  return (
    <div>
      {clientes.length === 0 ? (
        <p className="rounded-2xl border border-graphite-border bg-graphite p-8 text-sm text-neutral-500">
          Nenhum cliente cadastrado ainda.
        </p>
      ) : (
        <>
          <div className="space-y-4 lg:hidden">
            {clientes.map((cliente) => (
              <div
                key={cliente.id}
                className="rounded-2xl border border-graphite-border bg-graphite p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white">{cliente.nome}</p>
                    <p className="truncate text-xs text-neutral-500">{cliente.email}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                      cliente.role === "ADMIN"
                        ? "bg-brand/15 text-brand"
                        : "bg-neutral-500/15 text-neutral-400"
                    }`}
                  >
                    {cliente.role === "ADMIN" ? "Admin" : "Cliente"}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-neutral-500">Contato</p>
                    <p className="mt-0.5 text-neutral-300">{cliente.telefone ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Pedidos</p>
                    <p className="mt-0.5 text-neutral-300">{cliente.ordersCount}</p>
                  </div>
                </div>

                <p className="mt-2 text-xs text-neutral-500">
                  Cadastro: {formatDate(cliente.createdAt)}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => abrirEdicao(cliente)}
                    className="flex items-center gap-1.5 rounded-lg border border-graphite-border px-3 py-2 text-xs font-semibold text-neutral-300 transition-colors hover:border-brand hover:text-brand"
                  >
                    <Pencil size={14} />
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleRole(cliente)}
                    disabled={busyId === cliente.id}
                    className="flex items-center gap-1.5 rounded-lg border border-graphite-border px-3 py-2 text-xs font-semibold text-neutral-300 transition-colors hover:border-brand hover:text-brand disabled:opacity-50"
                  >
                    {cliente.role === "ADMIN" ? (
                      <ShieldCheck size={14} />
                    ) : (
                      <Shield size={14} />
                    )}
                    {cliente.role === "ADMIN" ? "Remover admin" : "Tornar admin"}
                  </button>
                  {cliente.id !== currentUserId ? (
                    <button
                      type="button"
                      onClick={() => excluir(cliente)}
                      disabled={busyId === cliente.id}
                      className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg border border-graphite-border text-neutral-400 transition-colors hover:border-red-500 hover:text-red-400 disabled:opacity-50"
                    >
                      <Trash2 size={15} />
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-2xl border border-graphite-border bg-graphite lg:block">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-graphite-border text-xs uppercase tracking-wider text-neutral-500">
                  <th className="px-5 py-4 font-semibold">Cliente</th>
                  <th className="px-5 py-4 font-semibold">Contato</th>
                  <th className="px-5 py-4 font-semibold">Tipo</th>
                  <th className="px-5 py-4 font-semibold">Pedidos</th>
                  <th className="px-5 py-4 font-semibold">Cadastro</th>
                  <th className="px-5 py-4 text-right font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-graphite-border">
                {clientes.map((cliente) => (
                  <tr key={cliente.id} className="text-neutral-300">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-white">{cliente.nome}</p>
                      <p className="text-xs text-neutral-500">{cliente.email}</p>
                    </td>
                    <td className="px-5 py-4">{cliente.telefone ?? "—"}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                          cliente.role === "ADMIN"
                            ? "bg-brand/15 text-brand"
                            : "bg-neutral-500/15 text-neutral-400"
                        }`}
                      >
                        {cliente.role === "ADMIN" ? "Admin" : "Cliente"}
                      </span>
                    </td>
                    <td className="px-5 py-4">{cliente.ordersCount}</td>
                    <td className="px-5 py-4 text-neutral-500">
                      {formatDate(cliente.createdAt)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => abrirEdicao(cliente)}
                          title="Editar dados"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-graphite-border text-neutral-400 transition-colors hover:border-brand hover:text-brand"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleRole(cliente)}
                          disabled={busyId === cliente.id}
                          title={
                            cliente.role === "ADMIN"
                              ? "Remover acesso admin"
                              : "Tornar admin"
                          }
                          className="flex items-center gap-1.5 rounded-lg border border-graphite-border px-3 py-2 text-xs font-semibold text-neutral-300 transition-colors hover:border-brand hover:text-brand disabled:opacity-50"
                        >
                          {cliente.role === "ADMIN" ? (
                            <ShieldCheck size={14} />
                          ) : (
                            <Shield size={14} />
                          )}
                          {cliente.role === "ADMIN" ? "Remover admin" : "Tornar admin"}
                        </button>
                        {cliente.id !== currentUserId ? (
                          <button
                            type="button"
                            onClick={() => excluir(cliente)}
                            disabled={busyId === cliente.id}
                            title="Excluir cliente"
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-graphite-border text-neutral-400 transition-colors hover:border-red-500 hover:text-red-400 disabled:opacity-50"
                          >
                            <Trash2 size={15} />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {erro ? (
        <p className="mt-4 text-sm text-red-400">{erro}</p>
      ) : null}

      <Modal
        open={editCliente !== null}
        onClose={() => setEditCliente(null)}
        title={editCliente ? `Editar ${editCliente.nome}` : ""}
        className="max-w-md"
      >
        {editCliente ? (
          <form onSubmit={salvarEdicao} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-300">
                Nome
              </label>
              <input
                value={editForm.nome}
                onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-300">
                E-mail
              </label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-300">
                Telefone / WhatsApp
              </label>
              <input
                value={editForm.telefone}
                onChange={(e) => setEditForm({ ...editForm, telefone: e.target.value })}
                className={inputClass}
              />
            </div>

            {erro ? <p className="text-sm text-red-400">{erro}</p> : null}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditCliente(null)}
                className="rounded-lg border border-graphite-border px-4 py-2.5 text-sm font-semibold text-neutral-300 transition-colors hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={salvando}
                className="rounded-lg bg-brand px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-ink transition-colors hover:bg-brand-dark disabled:opacity-50"
              >
                {salvando ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </form>
        ) : null}
      </Modal>
    </div>
  );
}
