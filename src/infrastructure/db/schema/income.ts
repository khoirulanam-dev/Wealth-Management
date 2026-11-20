import { numeric, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { users } from "./users";
import { instruments } from "./instruments";
import { financialAccounts } from "./accounts";

export const investmentIncome = pgTable("investment_income", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  instrumentId: text("instrument_id").references(() => instruments.id, { onDelete: "set null" }),
  accountId: text("account_id").references(() => financialAccounts.id, { onDelete: "set null" }),
  type: varchar("type", { length: 50 }).notNull(), // dividend, distribution, coupon, interest, other
  status: varchar("status", { length: 20 }).notNull().default("forecast"), // forecast, received, cancelled
  announcementDate: timestamp("announcement_date", { withTimezone: true }),
  exDate: timestamp("ex_date", { withTimezone: true }),
  paymentDate: timestamp("payment_date", { withTimezone: true }),
  expectedAmount: numeric("expected_amount", { precision: 18, scale: 2 }),
  actualAmount: numeric("actual_amount", { precision: 18, scale: 2 }),
  currency: varchar("currency", { length: 10 }).notNull().default("IDR"),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type InvestmentIncome = typeof investmentIncome.$inferSelect;
export type NewInvestmentIncome = typeof investmentIncome.$inferInsert;

