import { Pool } from "pg";
import "dotenv/config";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    const cols = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Order' 
      ORDER BY ordinal_position
    `);
    console.log("=== Order columns ===");
    for (const row of cols.rows) {
      console.log(`  ${row.column_name}: ${row.data_type}`);
    }

    const orders = await client.query(`SELECT id, total, desconto FROM "Order" LIMIT 3`);
    console.log("\n=== Recent orders ===");
    for (const row of orders.rows) {
      console.log(`  id: ${row.id}, total: ${row.total}, desconto: ${row.desconto}`);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
