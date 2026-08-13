import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireAdmin, adminUnauthorized } from "@/lib/admin";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(request: Request) {
  if (!(await requireAdmin())) return adminUnauthorized();

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Formato de imagem inválido. Use JPG, PNG, WEBP, GIF ou AVIF." },
      { status: 400 },
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Imagem muito grande. Máximo de 5 MB." },
      { status: 400 },
    );
  }

  const cleanName = file.name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .toLowerCase();

  try {
    const blob = await put(`produtos/${cleanName}`, file, {
      access: "public",
      addRandomSuffix: true,
    });
    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("Erro ao enviar imagem:", error);
    return NextResponse.json(
      { error: "Erro ao enviar a imagem. Verifique o armazenamento (BLOB_READ_WRITE_TOKEN)." },
      { status: 500 },
    );
  }
}
