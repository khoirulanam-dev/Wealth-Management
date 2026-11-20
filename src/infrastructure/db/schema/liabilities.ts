import { integer, numeric, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { users } from "./users";

export const liabilities = pgTable("liabilities", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // paylater, credit_card, personal_loan, installment, bank_loan, informal, other
  creditor: varchar("creditor", { length: 100 }).notNull(),
  originalAmount: numeric("original_amount", { precision: 18, scale: 2 }).notNull(),
  outstandingBalance: numeric("outstanding_balance", { precision: 18, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).notNull().default("IDR"),
  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  dueDate: timestamp("due_date", { withTimezone: true }),
  installmentAmount: numeric("installment_amount", { precision: 18, scale: 2 }),
  installmentFrequency: varchar("installment_frequency", { length: 20 }), // monthly, biweekly, weekly
  installmentCount: integer("installment_count"),
  status: varchar("status", { length: 20 }).notNull().default("active"), // active, settled, overdue
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const liabilityPayments = pgTable("liability_payments", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  liabilityId: text("liability_id").notNull().references(() => liabilities.id, { onDelete: "cascade" }),
  paymentDate: timestamp("payment_date", { withTimezone: true }).notNull(),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
  installmentNumber: integer("installment_number"),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const installmentSchedules = pgTable("installment_schedules", {
  id: text("id").primaryKey(),
  liabilityId: text("liability_id").notNull().references(() => liabilities.id, { onDelete: "cascade" }),
  dueDate: timestamp("due_date", { withTimezone: true }).notNull(),
  plannedAmount: numeric("planned_amount", { precision: 18, scale: 2 }).notNull(),
  installmentNumber: integer("installment_number").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("upcoming"), // upcoming, due, overdue, paid, partial
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Liability = typeof liabilities.$inferSelect;
export type NewLiability = typeof liabilities.$inferInsert;
export type LiabilityPayment = typeof liabilityPayments.$inferSelect;

