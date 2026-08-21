import "dotenv/config";
import { SignJWT } from "jose";
import { PrismaClient } from "./src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { writeFileSync } from "node:fs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });
const admin = await db.user.findFirst({ where: { role: "ADMIN" } });
if (!admin) {
  console.log("NO_ADMIN");
  process.exit(1);
}
const secret = new TextEncoder().encode(process.env.SESSION_SECRET);
const token = await new SignJWT({ userId: admin.id, email: admin.email, role: "ADMIN" })
  .setProtectedHeader({ alg: "HS256" })
  .setIssuedAt()
  .setExpirationTime("7d")
  .sign(secret);
writeFileSync(".test-token", token);
console.log("TOKEN_OK");
await db.$disconnect();
