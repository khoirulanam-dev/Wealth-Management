import { boolean, numeric, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { users } from "./users";
import { financialAccounts } from "./accounts";

export const cashAccounts = pgTable("cash_accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  financialAccountId: text("financial_account_id").notNull().references(() => financialAccounts.id, { onDelete: "cascade" }),
  openingBalance: numeric("opening_balance", { precision: 18, scale: 2 }).notNull().default("0"),
  openingBalanceDate: timestamp("opening_balance_date", { withTimezone: true }).notNull().defaultNow(),
  currentBalance: numeric("current_balance", { precision: 18, scale: 2 }).notNull().default("0"),
  isEmergencyFund: boolean("is_emergency_fund").notNull().default(false),
  emergencyFundTarget: numeric("emergency_fund_target", { precision: 18, scale: 2 }),
  currency: varchar("currency", { length: 10 }).notNull().default("IDR"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const cashMovements = pgTable("cash_movements", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  cashAccountId: text("cash_account_id").notNull().references(() => cashAccounts.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(), // opening_balance, deposit, withdrawal, transfer_in, transfer_out, adjustment
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).notNull().default("IDR"),
  movementDate: timestamp("movement_date", { withTimezone: true }).notNull(),
  transferGroupId: text("transfer_group_id"),
  relatedTransactionId: text("related_transaction_id"),
  note: text("note"),
  status: varchar("status", { length: 20 }).notNull().default("posted"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type CashAccount = typeof cashAccounts.$inferSelect;
export type NewCashAccount = typeof cashAccounts.$inferInsert;
export type CashMovement = typeof cashMovements.$inferSelect;

