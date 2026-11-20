import { jsonb, numeric, pgTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import { users } from "./users";

export const snapshots = pgTable(
  "snapshots",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    snapshotDate: timestamp("snapshot_date", { withTimezone: true }).notNull(),
    reportingCurrency: varchar("reporting_currency", { length: 10 }).notNull().default("IDR"),
    totalInvestments: numeric("total_investments", { precision: 18, scale: 2 }).notNull(),
    totalCash: numeric("total_cash", { precision: 18, scale: 2 }).notNull(),
    totalLiabilities: numeric("total_liabilities", { precision: 18, scale: 2 }).notNull(),
    netWorth: numeric("net_worth", { precision: 18, scale: 2 }).notNull(),
    breakdown: jsonb("breakdown").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("snap_user_date_idx").on(table.userId, table.snapshotDate, table.reportingCurrency),
  ]
);

export const fxRates = pgTable("fx_rates", {
  id: text("id").primaryKey(),
  baseCurrency: varchar("base_currency", { length: 10 }).notNull(),
  quoteCurrency: varchar("quote_currency", { length: 10 }).notNull(),
  rate: numeric("rate", { precision: 18, scale: 6 }).notNull(),
  effectiveAt: timestamp("effective_at", { withTimezone: true }).notNull(),
  source: varchar("source", { length: 100 }).notNull(),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Snapshot = typeof snapshots.$inferSelect;
export type NewSnapshot = typeof snapshots.$inferInsert;
export type FXRate = typeof fxRates.$inferSelect;

