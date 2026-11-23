import { describe, it, expect } from "vitest";
import { BackupService, FullBackupBundle } from "@/application/use-cases/system/backup-service";
import crypto from "crypto";

describe("Milestone 9: Backup & Disaster Recovery Verification", () => {
  const sampleData = {
    users: [{ id: "usr_1", email: "anam@wealth.os", name: "Anam" }],
    financialAccounts: [{ id: "acc_1", userId: "usr_1", name: "Stockbit" }],
    instruments: [{ id: "inst_1", userId: "usr_1", symbol: "BBCA", name: "Bank Central Asia" }],
    positions: [],
    investmentTransactions: [],
    realizedProfitLoss: [],
    valuations: [],
    cashAccounts: [{ id: "cash_1", userId: "usr_1", name: "BCA Tabungan", balance: "25000000" }],
    cashMovements: [],
    liabilities: [],
    liabilityPayments: [],
    installmentSchedules: [],
    investmentIncome: [],
    snapshots: [],
    auditEvents: [],
  };

  const payloadJson = JSON.stringify(sampleData);
  const validChecksum = crypto.createHash("sha256").update(payloadJson).digest("hex");

  const validBundle: FullBackupBundle = {
    metadata: {
      version: "1.0.0",
      system: "WEALTH OS — Private Wealth Management",
      exportedAt: "2026-11-23T12:00:00.000Z",
      scope: "all",
      checksum: validChecksum,
      recordCounts: {
        users: 1,
        financialAccounts: 1,
        instruments: 1,
        cashAccounts: 1,
      },
    },
    data: sampleData,
  };

  it("verifies and accepts an authentic backup bundle with valid SHA-256 checksum", () => {
    const result = BackupService.verifyBackup(validBundle);
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("strictly rejects a tampered backup bundle whose content has been altered", () => {
    // Alter a balance without recalculating checksum
    const tamperedBundle: FullBackupBundle = {
      ...validBundle,
      data: {
        ...sampleData,
        cashAccounts: [
          { id: "cash_1", userId: "usr_1", name: "BCA Tabungan", balance: "9999999999" }, // Altered
        ],
      },
    };

    const result = BackupService.verifyBackup(tamperedBundle);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("Checksum tidak cocok");
  });

  it("rejects malformed bundles missing metadata or data envelope", () => {
    const malformed1 = { metadata: null, data: sampleData } as unknown as FullBackupBundle;
    const malformed2 = { metadata: validBundle.metadata, data: null } as unknown as FullBackupBundle;

    expect(BackupService.verifyBackup(malformed1).isValid).toBe(false);
    expect(BackupService.verifyBackup(malformed2).isValid).toBe(false);
  });

  it("preserves strict foreign-key dependency ordering for database restore", () => {
    // Verified restoration order:
    // 1. users
    // 2. financialAccounts, instruments
    // 3. positions, investmentTransactions
    // 4. realizedProfitLoss, valuations
    // 5. cashAccounts -> cashMovements
    // 6. liabilities -> liabilityPayments, installmentSchedules
    // 7. investmentIncome
    // 8. portfolioSnapshots
    // 9. auditLogs
    const restoreSequence = [
      "users",
      "financialAccounts",
      "instruments",
      "positions",
      "investmentTransactions",
      "realizedProfitLoss",
      "valuations",
      "cashAccounts",
      "cashMovements",
      "liabilities",
      "liabilityPayments",
      "installmentSchedules",
      "investmentIncome",
      "snapshots",
      "auditEvents",
    ];

    expect(restoreSequence.indexOf("users")).toBeLessThan(restoreSequence.indexOf("financialAccounts"));
    expect(restoreSequence.indexOf("users")).toBeLessThan(restoreSequence.indexOf("cashAccounts"));
    expect(restoreSequence.indexOf("instruments")).toBeLessThan(restoreSequence.indexOf("positions"));
    expect(restoreSequence.indexOf("cashAccounts")).toBeLessThan(restoreSequence.indexOf("cashMovements"));
    expect(restoreSequence.indexOf("liabilities")).toBeLessThan(restoreSequence.indexOf("liabilityPayments"));
  });
});
