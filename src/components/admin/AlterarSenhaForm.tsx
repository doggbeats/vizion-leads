"use client";

import { useState, type FormEvent } from "react";
import { Eye, EyeOff, CheckCircle } from "lucide-react";

export function AlterarSenhaForm() {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(false);

  const [mostrarAtual, setMostrarAtual] = useState(false);
  const [mostrarNova, setMostrarNova] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (novaSenha.length < 8) {
      setErro("A nova senha deve ter no mínimo 8 caracteres.");
      return;
    }

    if (novaSenha !== confirmar) {
      setErro("As senhas não coincidem.");
      return;
    }

    if (senhaAtual === novaSenha) {
      setErro("A nova senha deve ser diferente da atual.");
      return;
    }

    setCarregando(true);
    try {
      const response = await fetch("/api/admin/alterar-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senhaAtual, novaSenha }),
      });
      const data = await response.json();

      if (response.ok) {
        setSucesso("Senha alterada com sucesso!");
        setSenhaAtual("");
        setNovaSenha("");
        setConfirmar("");
      } else {
        setErro(data.error ?? "Erro ao alterar senha.");
      }
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-graphite-border bg-graphite px-4 py-3 pr-12 text-sm text-white placeholder:text-neutral-500 outline-none transition-colors focus:border-brand";

  return (
    <div className="max-w-lg">
      <div className="rounded-2xl border border-graphite-border bg-graphite p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-300">
              Senha atual
            </label>
            <div className="relative">
              <input
                type={mostrarAtual ? "text" : "password"}
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
                placeholder="Digite sua senha atual"
                required
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => setMostrarAtual(!mostrarAtual)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 transition-colors hover:text-white"
              >
                {mostrarAtual ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-300">
              Nova senha
            </label>
            <div className="relative">
              <input
                type={mostrarNova ? "text" : "password"}
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                required
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => setMostrarNova(!mostrarNova)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 transition-colors hover:text-white"
              >
                {mostrarNova ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-300">
              Confirmar nova senha
            </label>
            <div className="relative">
              <input
                type={mostrarConfirmar ? "text" : "password"}
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                placeholder="Repita a nova senha"
                required
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 transition-colors hover:text-white"
              >
                {mostrarConfirmar ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {erro && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-400">
              {erro}
            </p>
          )}

          {sucesso && (
            <p className="flex items-center gap-2 rounded-lg border border-[#B6FF00]/30 bg-[#B6FF00]/5 px-4 py-3 text-sm text-[#B6FF00]">
              <CheckCircle size={16} />
              {sucesso}
            </p>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-lg bg-brand px-6 py-3 text-sm font-bold uppercase tracking-wider text-ink transition-colors hover:bg-brand-dark disabled:opacity-50"
          >
            {carregando ? "Alterando..." : "Alterar Senha"}
          </button>
        </form>
      </div>
    </div>
  );
}
