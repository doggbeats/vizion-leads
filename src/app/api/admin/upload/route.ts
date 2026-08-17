import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { requireAdmin, adminUnauthorized } from "@/lib/admin";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
};

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
    console.error("Erro ao enviar imagem para o Blob:", error);

    const message = error instanceof Error ? error.message : "";
    if (message.includes("OIDC is enabled")) {
      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const ext = path.extname(cleanName) || EXT_BY_TYPE[file.type] || ".jpg";
        const base = path.basename(cleanName, path.extname(cleanName));
        const unique = `${base}-${crypto.randomBytes(8).toString("hex")}${ext}`;
        const dir = path.join(process.cwd(), "public", "uploads");
        await mkdir(dir, { recursive: true });
        await writeFile(path.join(dir, unique), buffer);
        return NextResponse.json({ url: `/uploads/${unique}` });
      } catch (localError) {
        console.error("Erro ao salvar imagem localmente:", localError);
        return NextResponse.json(
          { error: "Erro ao salvar a imagem localmente." },
          { status: 500 },
        );
      }
    }

    return NextResponse.json(
      { error: "Erro ao enviar a imagem. Verifique o armazenamento (BLOB_READ_WRITE_TOKEN)." },
      { status: 500 },
    );
  }
}
