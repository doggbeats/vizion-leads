"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function EsqueciSenhaPage() {
  const router = useRouter();

  const [identificador, setIdentificador] = useState("");
  const [codigo, setCodigo] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [etapa, setEtapa] = useState<"solicitar" | "redefinir" | "sucesso">("solicitar");
  const [erro, setErro] = useState("");
  const [info, setInfo] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSolicitar(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setErro("");

    try {
      const response = await fetch("/api/esqueci-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identificador }),
      });
      const data = await response.json();

      if (response.ok) {
        setInfo(data.mensagem ?? "Código de recuperação enviado. Verifique seu e-mail ou WhatsApp.");
        setEtapa("redefinir");
      } else {
        setErro(data.error ?? "Erro ao solicitar recuperação.");
      }
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  async function handleRedefinir(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (novaSenha.length < 8) {
      setErro("A nova senha deve ter no mínimo 8 caracteres.");
      return;
    }

    if (novaSenha !== confirmar) {
      setErro("As senhas não coincidem.");
      return;
    }

    setCarregando(true);
    try {
      const response = await fetch("/api/redefinir-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo, novaSenha }),
      });
      const data = await response.json();

      if (response.ok) {
        setEtapa("sucesso");
      } else {
        setErro(data.error ?? "Erro ao redefinir a senha.");
      }
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-[#B6FF00]";

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-8">
        <h1 className="mb-2 text-center text-3xl font-bold text-white">
          ESQUECI MINHA SENHA
        </h1>

        <p className="mb-8 text-center text-zinc-400">
          Recupere o acesso à sua conta VIZION
        </p>

        {etapa === "solicitar" ? (
          <form onSubmit={handleSolicitar} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm text-zinc-300">
                E-mail ou WhatsApp cadastrado
              </label>
              <input
                type="text"
                value={identificador}
                onChange={(e) => setIdentificador(e.target.value)}
                placeholder="seu@email.com ou (61) 99999-9999"
                required
                className={inputClass}
              />
            </div>

            {erro && <p className="text-sm text-red-400">{erro}</p>}

            <button
              type="submit"
              disabled={carregando}
              className="w-full rounded-lg bg-[#B6FF00] px-4 py-3 font-bold text-black transition hover:opacity-90 disabled:opacity-50"
            >
              {carregando ? "GERANDO CÓDIGO..." : "GERAR CÓDIGO"}
            </button>
          </form>
        ) : etapa === "redefinir" ? (
          <form onSubmit={handleRedefinir} className="space-y-5">
            {info && (
              <p className="rounded-lg border border-[#B6FF00]/30 bg-[#B6FF00]/5 px-4 py-3 text-sm text-zinc-200">
                {info}
              </p>
            )}

            <div>
              <label className="mb-2 block text-sm text-zinc-300">
                Código de recuperação
              </label>
              <input
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                maxLength={6}
                inputMode="numeric"
                required
                className={`${inputClass} text-center text-xl tracking-[0.4em]`}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-300">
                Nova senha
              </label>
              <input
                type="password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-300">
                Confirmar nova senha
              </label>
              <input
                type="password"
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                placeholder="Repita a nova senha"
                required
                className={inputClass}
              />
            </div>

            {erro && <p className="text-sm text-red-400">{erro}</p>}

            <button
              type="submit"
              disabled={carregando}
              className="w-full rounded-lg bg-[#B6FF00] px-4 py-3 font-bold text-black transition hover:opacity-90 disabled:opacity-50"
            >
              {carregando ? "REDEFININDO..." : "REDEFINIR SENHA"}
            </button>
          </form>
        ) : (
          <div className="space-y-5 text-center">
            <p className="text-zinc-300">Senha redefinida com sucesso!</p>
            <p className="text-sm text-zinc-400">
              Agora você já pode entrar com sua nova senha.
            </p>
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="w-full rounded-lg bg-[#B6FF00] px-4 py-3 font-bold text-black transition hover:opacity-90"
            >
              IR PARA O LOGIN
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm font-semibold text-[#B6FF00] hover:underline">
            Voltar para o login
          </Link>
        </div>
      </div>
    </main>
  );
}
