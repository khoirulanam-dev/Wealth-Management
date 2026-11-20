import { integer, jsonb, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { users } from "./users";

export const auditEvents = pgTable("audit_events", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  entityType: varchar("entity_type", { length: 50 }).notNull(),
  entityId: text("entity_id").notNull(),
  action: varchar("action", { length: 50 }).notNull(), // create, update, void, reverse, override
  beforeData: jsonb("before_data"),
  afterData: jsonb("after_data"),
  reason: text("reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const importBatches = pgTable("import_batches", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileHash: varchar("file_hash", { length: 64 }).notNull(),
  dataType: varchar("data_type", { length: 50 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("completed"),
  rowCount: integer("row_count").notNull().default(0),
  successCount: integer("success_count").notNull().default(0),
  errorCount: integer("error_count").notNull().default(0),
  skippedCount: integer("skipped_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type AuditEvent = typeof auditEvents.$inferSelect;
export type ImportBatch = typeof importBatches.$inferSelect;

