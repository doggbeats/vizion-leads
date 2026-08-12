import { ClientRegistration } from "@/components/home/ClientRegistration";

export default async function CadastroPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-black">
      <ClientRegistration redirect={params.redirect} />
    </main>
  );
}
