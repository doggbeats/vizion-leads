"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [redirect, setRedirect] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const value = params.get("redirect");
    setRedirect(value && value.startsWith("/") ? value : null);
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setErro("");

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.user?.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push(redirect ?? "/");
        }
      } else {
        setErro(data.error ?? "Erro ao entrar.");
      }
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-8">
        <h1 className="mb-2 text-center text-3xl font-bold text-white">
          LOGIN
        </h1>

        <p className="mb-8 text-center text-zinc-400">
          Entre na sua conta VIZION
        </p>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              E-mail
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-[#B6FF00]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              Senha
            </label>

            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Digite sua senha"
              required
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-[#B6FF00]"
            />
          </div>

          {erro && (
            <p className="text-sm text-red-400">{erro}</p>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-lg bg-[#B6FF00] px-4 py-3 font-bold text-black transition hover:opacity-90 disabled:opacity-50"
          >
            {carregando ? "ENTRANDO..." : "ENTRAR"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-zinc-400">
            Ainda não possui uma conta?
          </p>

          <Link
            href={
              redirect
                ? `/cadastro?redirect=${encodeURIComponent(redirect)}`
                : "/cadastro"
            }
            className="mt-2 inline-block font-semibold text-[#B6FF00] hover:underline"
          >
            Cadastre-se
          </Link>
        </div>
      </div>
    </main>
  );
}
