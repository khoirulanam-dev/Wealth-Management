import { jsonb, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const systemBackups = pgTable("system_backups", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  scope: varchar("scope", { length: 50 }).notNull().default("all"),
  checksum: text("checksum").notNull(),
  recordCounts: jsonb("record_counts").notNull(),
  bundleJson: text("bundle_json").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type SystemBackup = typeof systemBackups.$inferSelect;
export type NewSystemBackup = typeof systemBackups.$inferInsert;

