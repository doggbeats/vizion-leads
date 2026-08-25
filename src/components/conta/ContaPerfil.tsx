"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Pencil, CheckCircle } from "lucide-react";
import { useSession } from "@/lib/session";

type UserData = {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  role: string;
  createdAt: string;
};

export function ContaPerfil() {
  const { refresh } = useSession();
  const [user, setUser] = useState<UserData | null>(null);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({ nome: "", email: "", telefone: "" });
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    fetch("/api/conta")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          setForm({
            nome: data.user.nome,
            email: data.user.email,
            telefone: data.user.telefone ?? "",
          });
        }
      })
      .catch(() => {});
  }, []);

  async function handleSalvar(e: FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro("");
    setSucesso("");

    try {
      const response = await fetch("/api/conta", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setEditando(false);
        setSucesso("Dados atualizados com sucesso!");
        await refresh();
      } else {
        setErro(data.error ?? "Erro ao salvar.");
      }
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-[#B6FF00]";

  if (!user) {
    return <p className="text-zinc-400">Carregando dados...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Meus Dados</h2>
        {!editando && (
          <button
            type="button"
            onClick={() => setEditando(true)}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-2 text-sm font-semibold text-zinc-300 transition-colors hover:border-[#B6FF00] hover:text-[#B6FF00]"
          >
            <Pencil size={14} />
            Editar
          </button>
        )}
      </div>

      {sucesso && (
        <p className="flex items-center gap-2 rounded-lg border border-[#B6FF00]/30 bg-[#B6FF00]/5 px-4 py-3 text-sm text-[#B6FF00]">
          <CheckCircle size={16} />
          {sucesso}
        </p>
      )}

      {editando ? (
        <form onSubmit={handleSalvar} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-zinc-300">Nome</label>
            <input
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-zinc-300">E-mail</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              Telefone / WhatsApp
            </label>
            <input
              value={form.telefone}
              onChange={(e) => setForm({ ...form, telefone: e.target.value })}
              placeholder="(61) 99999-9999"
              className={inputClass}
            />
          </div>

          {erro && <p className="text-sm text-red-400">{erro}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setEditando(false);
                setForm({
                  nome: user.nome,
                  email: user.email,
                  telefone: user.telefone ?? "",
                });
                setErro("");
              }}
              className="rounded-lg border border-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition-colors hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="rounded-lg bg-[#B6FF00] px-6 py-2.5 text-sm font-bold text-black transition hover:opacity-90 disabled:opacity-50"
            >
              {salvando ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <p className="text-xs text-zinc-500">Nome</p>
            <p className="mt-1 text-white">{user.nome}</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <p className="text-xs text-zinc-500">E-mail</p>
            <p className="mt-1 text-white">{user.email}</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <p className="text-xs text-zinc-500">Telefone</p>
            <p className="mt-1 text-white">{user.telefone ?? "—"}</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <p className="text-xs text-zinc-500">Tipo de conta</p>
            <p className="mt-1 text-white">
              {user.role === "ADMIN" ? "Administrador" : "Cliente"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
