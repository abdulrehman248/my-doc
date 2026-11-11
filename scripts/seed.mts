import { config } from "dotenv";
import { inArray } from "drizzle-orm";
import { getDb } from "../db/index.ts";
import { users } from "../db/schema.ts";
import { hashPassword } from "../lib/password.ts";

config({ path: ".env.local" });

const accounts = ["ada@ajaia.test", "grace@ajaia.test", "lin@ajaia.test"];

const passwordHash = await hashPassword("docs-demo-password");
const db = getDb();

for (const email of accounts) {
  const inserted = await db
    .insert(users)
    .values({ email, passwordHash })
    .onConflictDoNothing({ target: users.email })
    .returning({ email: users.email });

  console.log(inserted.length > 0 ? `created ${email}` : `already present ${email}`);
}

const rows = await db
  .select({ email: users.email })
  .from(users)
  .where(inArray(users.email, accounts));

console.log(`seeded accounts present: ${rows.length}`);
