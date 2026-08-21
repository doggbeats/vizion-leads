import "dotenv/config";
import { jwtVerify } from "jose";
import { readFileSync } from "node:fs";

const secret = process.env.SESSION_SECRET ?? "";
console.log("secret length:", secret.length);
const token = readFileSync(".test-token", "utf-8").trim();
console.log("token length:", token.length);
try {
  const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
  console.log("VERIFY OK, userId:", payload.userId);
} catch (error) {
  console.log("VERIFY FALHOU:", (error as Error).message);
}
