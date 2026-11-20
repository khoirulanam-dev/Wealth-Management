import { numeric, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { users } from "./users";
import { instruments } from "./instruments";
import { financialAccounts } from "./accounts";

export const positions = pgTable(
  "positions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    instrumentId: text("instrument_id").notNull().references(() => instruments.id, { onDelete: "cascade" }),
    accountId: text("account_id").notNull().references(() => financialAccounts.id, { onDelete: "cascade" }),
    quantity: numeric("quantity", { precision: 18, scale: 6 }).notNull().default("0"),
    averageCostPerUnit: numeric("average_cost_per_unit", { precision: 18, scale: 4 }).notNull().default("0"),
    totalCostBasis: numeric("total_cost_basis", { precision: 18, scale: 2 }).notNull().default("0"),
    currentPrice: numeric("current_price", { precision: 18, scale: 4 }).notNull().default("0"),
    marketValue: numeric("market_value", { precision: 18, scale: 2 }).notNull().default("0"),
    unrealizedPL: numeric("unrealized_pl", { precision: 18, scale: 2 }).notNull().default("0"),
    lastValuationId: text("last_valuation_id"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("pos_user_inst_acc_idx").on(table.userId, table.instrumentId, table.accountId),
  ]
);

export type Position = typeof positions.$inferSelect;
export type NewPosition = typeof positions.$inferInsert;

