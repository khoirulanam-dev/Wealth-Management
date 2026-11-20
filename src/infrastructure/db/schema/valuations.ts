import { boolean, numeric, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { users } from "./users";
import { instruments } from "./instruments";

export const valuations = pgTable("valuations", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  instrumentId: text("instrument_id").notNull().references(() => instruments.id, { onDelete: "cascade" }),
  price: numeric("price", { precision: 18, scale: 4 }).notNull(),
  currency: varchar("currency", { length: 10 }).notNull().default("IDR"),
  unit: varchar("unit", { length: 50 }).notNull().default("share"),
  effectiveAt: timestamp("effective_at", { withTimezone: true }).notNull(),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull().defaultNow(),
  sourceType: varchar("source_type", { length: 20 }).notNull().default("manual"), // manual, provider
  sourceName: varchar("source_name", { length: 100 }).notNull().default("User Entry"),
  status: varchar("status", { length: 20 }).notNull().default("success"), // success, stale, error, overridden
  isManualOverride: boolean("is_manual_override").notNull().default(false),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Valuation = typeof valuations.$inferSelect;
export type NewValuation = typeof valuations.$inferInsert;

