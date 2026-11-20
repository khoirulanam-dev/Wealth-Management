import { numeric, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { users } from "./users";
import { instruments } from "./instruments";
import { financialAccounts } from "./accounts";

export const investmentTransactions = pgTable("investment_transactions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  instrumentId: text("instrument_id").notNull().references(() => instruments.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull().references(() => financialAccounts.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(), // buy, sell, subscription, redemption, deposit_open, deposit_mature, bond_buy, bond_sell, adjustment
  status: varchar("status", { length: 20 }).notNull().default("posted"), // draft, posted, voided
  tradeDate: timestamp("trade_date", { withTimezone: true }).notNull(),
  quantity: numeric("quantity", { precision: 18, scale: 6 }).notNull(),
  unitPrice: numeric("unit_price", { precision: 18, scale: 4 }).notNull(),
  grossAmount: numeric("gross_amount", { precision: 18, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).notNull().default("IDR"),
  note: text("note"),
  importBatchId: text("import_batch_id"),
  reversalOfId: text("reversal_of_id"),
  postedAt: timestamp("posted_at", { withTimezone: true }).defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const realizedProfitLoss = pgTable("realized_profit_loss", {
  id: text("id").primaryKey(),
  transactionId: text("transaction_id").notNull().references(() => investmentTransactions.id, { onDelete: "cascade" }),
  quantityClosed: numeric("quantity_closed", { precision: 18, scale: 6 }).notNull(),
  averageCostAtSale: numeric("average_cost_at_sale", { precision: 18, scale: 4 }).notNull(),
  salePrice: numeric("sale_price", { precision: 18, scale: 4 }).notNull(),
  realizedPL: numeric("realized_pl", { precision: 18, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).notNull().default("IDR"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type InvestmentTransaction = typeof investmentTransactions.$inferSelect;
export type NewInvestmentTransaction = typeof investmentTransactions.$inferInsert;

