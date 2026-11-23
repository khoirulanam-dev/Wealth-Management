import { db } from "@/infrastructure/db/client";
import {
  users,
  financialAccounts,
  instruments,
  positions,
  investmentTransactions,
  realizedProfitLoss,
  valuations,
  cashAccounts,
  cashMovements,
  liabilities,
  liabilityPayments,
  installmentSchedules,
  investmentIncome,
  snapshots,
  auditEvents,
  systemBackups,
} from "@/infrastructure/db/schema";
import { eq, desc } from "drizzle-orm";
import crypto from "crypto";

export interface BackupMetadata {
  version: string;
  system: string;
  exportedAt: string;
  scope: "all" | "single_user";
  userId?: string;
  checksum: string;
  recordCounts: Record<string, number>;
}

export interface BackupPayloadData {
  users: Record<string, unknown>[];
  financialAccounts: Record<string, unknown>[];
  instruments: Record<string, unknown>[];
  positions: Record<string, unknown>[];
  investmentTransactions: Record<string, unknown>[];
  realizedProfitLoss: Record<string, unknown>[];
  valuations: Record<string, unknown>[];
  cashAccounts: Record<string, unknown>[];
  cashMovements: Record<string, unknown>[];
  liabilities: Record<string, unknown>[];
  liabilityPayments: Record<string, unknown>[];
  installmentSchedules: Record<string, unknown>[];
  investmentIncome: Record<string, unknown>[];
  snapshots: Record<string, unknown>[];
  auditEvents: Record<string, unknown>[];
}

export interface FullBackupBundle {
  metadata: BackupMetadata;
  data: BackupPayloadData;
}

export class BackupService {
  /**
   * Generates a complete database dump payload with SHA-256 integrity checksum.
   */
  static async createBackup(userId?: string): Promise<FullBackupBundle> {
    const data: BackupPayloadData = {
      users: userId ? await db.select().from(users).where(eq(users.id, userId)) : await db.select().from(users),
      financialAccounts: userId ? await db.select().from(financialAccounts).where(eq(financialAccounts.userId, userId)) : await db.select().from(financialAccounts),
      instruments: userId ? await db.select().from(instruments).where(eq(instruments.userId, userId)) : await db.select().from(instruments),
      positions: userId ? await db.select().from(positions).where(eq(positions.userId, userId)) : await db.select().from(positions),
      investmentTransactions: userId ? await db.select().from(investmentTransactions).where(eq(investmentTransactions.userId, userId)) : await db.select().from(investmentTransactions),
      realizedProfitLoss: await db.select().from(realizedProfitLoss),
      valuations: await db.select().from(valuations),
      cashAccounts: userId ? await db.select().from(cashAccounts).where(eq(cashAccounts.userId, userId)) : await db.select().from(cashAccounts),
      cashMovements: userId ? await db.select().from(cashMovements).where(eq(cashMovements.userId, userId)) : await db.select().from(cashMovements),
      liabilities: userId ? await db.select().from(liabilities).where(eq(liabilities.userId, userId)) : await db.select().from(liabilities),
      liabilityPayments: userId ? await db.select().from(liabilityPayments).where(eq(liabilityPayments.userId, userId)) : await db.select().from(liabilityPayments),
      installmentSchedules: await db.select().from(installmentSchedules),
      investmentIncome: userId ? await db.select().from(investmentIncome).where(eq(investmentIncome.userId, userId)) : await db.select().from(investmentIncome),
      snapshots: userId ? await db.select().from(snapshots).where(eq(snapshots.userId, userId)) : await db.select().from(snapshots),
      auditEvents: userId ? await db.select().from(auditEvents).where(eq(auditEvents.userId, userId)) : await db.select().from(auditEvents),
    };

    const recordCounts: Record<string, number> = {};
    for (const [key, rows] of Object.entries(data)) {
      recordCounts[key] = rows.length;
    }

    const payloadJson = JSON.stringify(data);
    const checksum = crypto.createHash("sha256").update(payloadJson).digest("hex");

    const metadata: BackupMetadata = {
      version: "1.0.0",
      system: "WEALTH OS — Private Wealth Management",
      exportedAt: new Date().toISOString(),
      scope: userId ? "single_user" : "all",
      userId,
      checksum,
      recordCounts,
    };

    return { metadata, data };
  }

  /**
   * Validates backup integrity using SHA-256 checksum and schema structure.
   */
  static verifyBackup(bundle: FullBackupBundle): { isValid: boolean; error?: string } {
    if (!bundle || !bundle.metadata || !bundle.data) {
      return { isValid: false, error: "Struktur file cadangan tidak valid (hilang metadata/data)" };
    }

    const payloadJson = JSON.stringify(bundle.data);
    const calculatedChecksum = crypto.createHash("sha256").update(payloadJson).digest("hex");

    if (bundle.metadata.checksum !== calculatedChecksum) {
      return {
        isValid: false,
        error: `Integritas file cadangan gagal: Checksum tidak cocok (expected ${bundle.metadata.checksum}, calculated ${calculatedChecksum})`,
      };
    }

    return { isValid: true };
  }

  /**
   * Restores a backup bundle into the database in strict foreign-key order.
   */
  static async restoreBackup(
    bundle: FullBackupBundle
  ): Promise<{ success: boolean; restoredCounts: Record<string, number>; error?: string }> {
    const verification = this.verifyBackup(bundle);
    if (!verification.isValid) {
      return { success: false, restoredCounts: {}, error: verification.error };
    }

    const restoredCounts: Record<string, number> = {};
    const { data } = bundle;

    // Helper to convert ISO date strings back to Date objects for Drizzle pg-core timestamps
    const parseDates = <T extends Record<string, unknown>>(row: T) => {
      if (!row || typeof row !== "object") return row;
      const parsed: Record<string, unknown> = { ...row };
      for (const [key, val] of Object.entries(parsed)) {
        if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(val)) {
          parsed[key] = new Date(val);
        }
      }
      return parsed;
    };

    try {
      // 1. Users (if not exists)
      for (const row of data.users) {
        await db.insert(users).values(parseDates(row) as unknown as typeof users.$inferInsert).onConflictDoNothing();
      }
      restoredCounts["users"] = data.users.length;

      // 2. Financial Accounts
      for (const row of data.financialAccounts) {
        await db.insert(financialAccounts).values(parseDates(row) as unknown as typeof financialAccounts.$inferInsert).onConflictDoNothing();
      }
      restoredCounts["financialAccounts"] = data.financialAccounts.length;

      // 3. Instruments
      for (const row of data.instruments) {
        await db.insert(instruments).values(parseDates(row) as unknown as typeof instruments.$inferInsert).onConflictDoNothing();
      }
      restoredCounts["instruments"] = data.instruments.length;

      // 4. Positions
      for (const row of data.positions) {
        await db.insert(positions).values(parseDates(row) as unknown as typeof positions.$inferInsert).onConflictDoNothing();
      }
      restoredCounts["positions"] = data.positions.length;

      // 5. Investment Transactions
      for (const row of data.investmentTransactions) {
        await db.insert(investmentTransactions).values(parseDates(row) as unknown as typeof investmentTransactions.$inferInsert).onConflictDoNothing();
      }
      restoredCounts["investmentTransactions"] = data.investmentTransactions.length;

      // 6. Realized P/L
      for (const row of data.realizedProfitLoss) {
        await db.insert(realizedProfitLoss).values(parseDates(row) as unknown as typeof realizedProfitLoss.$inferInsert).onConflictDoNothing();
      }
      restoredCounts["realizedProfitLoss"] = data.realizedProfitLoss.length;

      // 7. Valuations
      for (const row of data.valuations) {
        await db.insert(valuations).values(parseDates(row) as unknown as typeof valuations.$inferInsert).onConflictDoNothing();
      }
      restoredCounts["valuations"] = data.valuations.length;

      // 8. Cash Accounts
      for (const row of data.cashAccounts) {
        await db.insert(cashAccounts).values(parseDates(row) as unknown as typeof cashAccounts.$inferInsert).onConflictDoNothing();
      }
      restoredCounts["cashAccounts"] = data.cashAccounts.length;

      // 9. Cash Movements
      for (const row of data.cashMovements) {
        await db.insert(cashMovements).values(parseDates(row) as unknown as typeof cashMovements.$inferInsert).onConflictDoNothing();
      }
      restoredCounts["cashMovements"] = data.cashMovements.length;

      // 10. Liabilities
      for (const row of data.liabilities) {
        await db.insert(liabilities).values(parseDates(row) as unknown as typeof liabilities.$inferInsert).onConflictDoNothing();
      }
      restoredCounts["liabilities"] = data.liabilities.length;

      // 11. Liability Payments
      for (const row of data.liabilityPayments) {
        await db.insert(liabilityPayments).values(parseDates(row) as unknown as typeof liabilityPayments.$inferInsert).onConflictDoNothing();
      }
      restoredCounts["liabilityPayments"] = data.liabilityPayments.length;

      // 12. Installment Schedules
      for (const row of data.installmentSchedules) {
        await db.insert(installmentSchedules).values(parseDates(row) as unknown as typeof installmentSchedules.$inferInsert).onConflictDoNothing();
      }
      restoredCounts["installmentSchedules"] = data.installmentSchedules.length;

      // 13. Investment Income
      for (const row of data.investmentIncome) {
        await db.insert(investmentIncome).values(parseDates(row) as unknown as typeof investmentIncome.$inferInsert).onConflictDoNothing();
      }
      restoredCounts["investmentIncome"] = data.investmentIncome.length;

      // 14. Snapshots
      for (const row of data.snapshots) {
        await db.insert(snapshots).values(parseDates(row) as unknown as typeof snapshots.$inferInsert).onConflictDoNothing();
      }
      restoredCounts["snapshots"] = data.snapshots.length;

      // 15. Audit Events
      for (const row of data.auditEvents) {
        await db.insert(auditEvents).values(parseDates(row) as unknown as typeof auditEvents.$inferInsert).onConflictDoNothing();
      }
      restoredCounts["auditEvents"] = data.auditEvents.length;

      return { success: true, restoredCounts };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal memulihkan cadangan database";
      return { success: false, restoredCounts, error: message };
    }
  }

  /**
   * Saves a full system backup directly into the Neon PostgreSQL `system_backups` table.
   * Eliminates the need to commit new JSON files into the git repository.
   */
  static async saveBackupToDatabase(options?: { name?: string; userId?: string }) {
    const bundle = await this.createBackup(options?.userId);
    const backupId = `bkp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const backupName =
      options?.name?.trim() ||
      `Cadangan Sistem ${new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}`;

    const bundleJson = JSON.stringify(bundle);

    await db.insert(systemBackups).values({
      id: backupId,
      name: backupName,
      scope: bundle.metadata.scope,
      checksum: bundle.metadata.checksum,
      recordCounts: bundle.metadata.recordCounts,
      bundleJson,
      createdAt: new Date(),
    });

    return {
      backupId,
      name: backupName,
      checksum: bundle.metadata.checksum,
      recordCounts: bundle.metadata.recordCounts,
      createdAt: new Date(),
    };
  }

  /**
   * Lists all existing system backups stored in the database.
   */
  static async listDatabaseBackups() {
    return await db
      .select({
        id: systemBackups.id,
        name: systemBackups.name,
        scope: systemBackups.scope,
        checksum: systemBackups.checksum,
        recordCounts: systemBackups.recordCounts,
        createdAt: systemBackups.createdAt,
      })
      .from(systemBackups)
      .orderBy(desc(systemBackups.createdAt));
  }

  /**
   * Retrieves full backup bundle from database for inspection or user download.
   */
  static async getDatabaseBackupBundle(backupId: string): Promise<FullBackupBundle | null> {
    const [record] = await db
      .select()
      .from(systemBackups)
      .where(eq(systemBackups.id, backupId))
      .limit(1);

    if (!record || !record.bundleJson) return null;
    return JSON.parse(record.bundleJson) as FullBackupBundle;
  }

  /**
   * Restores database state directly from a database-stored backup record.
   */
  static async restoreFromDatabaseBackup(backupId: string) {
    const bundle = await this.getDatabaseBackupBundle(backupId);
    if (!bundle) {
      return { success: false, restoredCounts: {}, error: "Catatan cadangan database tidak ditemukan." };
    }

    const verification = this.verifyBackup(bundle);
    if (!verification.isValid) {
      return { success: false, restoredCounts: {}, error: verification.error };
    }

    return await this.restoreBackup(bundle);
  }

  /**
   * Deletes a backup record from the database.
   */
  static async deleteDatabaseBackup(backupId: string) {
    await db.delete(systemBackups).where(eq(systemBackups.id, backupId));
    return true;
  }
}
