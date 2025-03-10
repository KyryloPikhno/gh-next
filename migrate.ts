import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { _envObject as env } from "~/env-config.mjs";
import { drizzle } from "drizzle-orm/postgres-js";

const db = drizzle(postgres(env.DATABASE_URL));

async function main() {
  await migrate(db, { migrationsFolder: "drizzle" });
  process.exit(0);
}
main();
