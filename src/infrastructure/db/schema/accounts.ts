import { boolean, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { users } from "./users";

export const financialAccounts = pgTable("financial_accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  institution: varchar("institution", { length: 100 }).notNull(),
  accountType: varchar("account_type", { length: 50 }).notNull(), // broker, mutual_fund_platform, bank, e_wallet, gold_platform, manual, other
  currency: varchar("currency", { length: 10 }).notNull().default("IDR"),
  isActive: boolean("is_active").notNull().default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type FinancialAccount = typeof financialAccounts.$inferSelect;
export type NewFinancialAccount = typeof financialAccounts.$inferInsert;

