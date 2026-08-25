import { requireAdmin } from "@/lib/admin";
import { redirect } from "next/navigation";
import { AlterarSenhaForm } from "@/components/admin/AlterarSenhaForm";

export const dynamic = "force-dynamic";

export default async function AdminAlterarSenhaPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/login");

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-brand">
          Conta
        </p>
        <h1 className="font-display text-3xl tracking-wide text-white sm:text-4xl lg:text-5xl">
          Alterar Senha
        </h1>
        <p className="mt-2 text-sm text-neutral-400">
          Mantenha sua conta segura com uma senha forte.
        </p>
      </div>

      <AlterarSenhaForm />
    </div>
  );
}
