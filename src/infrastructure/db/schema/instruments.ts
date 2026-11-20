import { boolean, jsonb, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { users } from "./users";

export const instruments = pgTable("instruments", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  symbol: varchar("symbol", { length: 50 }),
  assetType: varchar("asset_type", { length: 50 }).notNull(), // stock, mutual_fund, gold, deposit, bond, cash_equivalent, other_investment
  market: varchar("market", { length: 50 }).default("IDX"),
  currency: varchar("currency", { length: 10 }).notNull().default("IDR"),
  unit: varchar("unit", { length: 50 }).notNull().default("share"), // share, unit, gram, nominal, etc.
  isActive: boolean("is_active").notNull().default(true),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const watchlistItems = pgTable("watchlist_items", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  instrumentId: text("instrument_id").notNull().references(() => instruments.id, { onDelete: "cascade" }),
  note: text("note"),
  addedAt: timestamp("added_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Instrument = typeof instruments.$inferSelect;
export type NewInstrument = typeof instruments.$inferInsert;

