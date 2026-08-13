"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/session";

export function ClientRegistration({ redirect }: { redirect?: string }) {
  const router = useRouter();
  const { refresh } = useSession();
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    senha: "",
  });

  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setMensagem("");
    setErro("");

    try {
      const response = await fetch("/api/clientes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        setMensagem("Cadastro realizado com sucesso!");
        setForm({
          nome: "",
          email: "",
          telefone: "",
          senha: "",
        });
        setTimeout(
          () => {
            refresh();
            router.push(redirect && redirect.startsWith("/") ? redirect : "/");
          },
          1200,
        );
      } else {
        setErro(data.error ?? "Erro ao realizar cadastro.");
      }
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <section className="bg-black px-6 py-16">
      <div className="mx-auto max-w-xl">
        <h2 className="mb-2 text-center text-3xl font-bold text-white">
          Cadastre-se
        </h2>

        <p className="mb-8 text-center text-gray-400">
          Faça seu cadastro e fique por dentro das novidades da VIZION.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nome completo"
            value={form.nome}
            onChange={(e) =>
              setForm({ ...form, nome: e.target.value })
            }
            className="w-full rounded-lg border border-gray-700 bg-zinc-900 p-4 text-white outline-none"
            required
          />

          <input
            type="email"
            placeholder="E-mail"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            className="w-full rounded-lg border border-gray-700 bg-zinc-900 p-4 text-white outline-none"
            required
          />

          <input
            type="tel"
            placeholder="WhatsApp"
            value={form.telefone}
            onChange={(e) =>
              setForm({ ...form, telefone: e.target.value })
            }
            className="w-full rounded-lg border border-gray-700 bg-zinc-900 p-4 text-white outline-none"
          />

          <input
            type="password"
            placeholder="Senha (mínimo 6 caracteres)"
            value={form.senha}
            onChange={(e) =>
              setForm({ ...form, senha: e.target.value })
            }
            className="w-full rounded-lg border border-gray-700 bg-zinc-900 p-4 text-white outline-none"
            required
            minLength={6}
          />

          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-lg bg-[#B6FF00] p-4 font-bold text-black transition hover:opacity-90 disabled:opacity-50"
          >
            {carregando ? "CADASTRANDO..." : "CADASTRAR"}
          </button>

          {erro && (
            <p className="text-center text-sm text-red-400">{erro}</p>
          )}

          {mensagem && (
            <p className="text-center text-sm text-[#B6FF00]">
              {mensagem}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
