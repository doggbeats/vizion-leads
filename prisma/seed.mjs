import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import "dotenv/config";

const require = createRequire(import.meta.url);
const { PrismaClient } = await import("../src/generated/prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(
  readFileSync(path.join(__dirname, "seed-data.json"), "utf-8"),
);

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const db = new PrismaClient({ adapter });

  try {
    for (const category of data.categories) {
      await db.category.upsert({
        where: { slug: category.slug },
        update: {
          name: category.name,
          description: category.description,
          image: category.image,
        },
        create: category,
      });
    }
    console.log(`Categorias: ${data.categories.length} sincronizadas`);

    for (const product of data.products) {
      const { id, category, ...rest } = product;
      await db.product.upsert({
        where: { id },
        update: { ...rest, categorySlug: category },
        create: { id, ...rest, categorySlug: category },
      });
    }
    console.log(`Produtos: ${data.products.length} sincronizados`);
  } catch (error) {
    console.error("Erro no seed:", error);
    process.exitCode = 1;
  } finally {
    await db.$disconnect();
  }
}

main();
