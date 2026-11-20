import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { users } from "./schema/users";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("Error: DATABASE_URL is not set.");
    process.exit(1);
  }

  const email = (process.argv[2] || "anam@gmail.com").toLowerCase().trim();
  const password = process.argv[3] || "Anam@1405";
  const currency = process.argv[4] || "IDR";

  console.log(`Seeding user account in Neon PostgreSQL...`);
  console.log(`Email: ${email}`);
  console.log(`Currency: ${currency}`);

  const sql = neon(databaseUrl);
  const db = drizzle(sql, { schema: { users } });

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const passwordHash = await bcrypt.hash(password, 12);

  if (existing.length > 0) {
    console.log(`User ${email} already exists. Updating password hash...`);
    await db
      .update(users)
      .set({
        passwordHash,
        reportingCurrency: currency,
        updatedAt: new Date(),
      })
      .where(eq(users.email, email));
    console.log(`[✓] User ${email} updated successfully in Neon database!`);
  } else {
    const userId = `usr_${Date.now()}`;
    await db.insert(users).values({
      id: userId,
      email,
      passwordHash,
      reportingCurrency: currency,
    });
    console.log(`[✓] User ${email} created successfully in Neon database (ID: ${userId})!`);
  }

  const [countResult] = await sql`SELECT count(*) FROM users;`;
  console.log(`Total users in database: ${countResult.count}`);
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});

