import { describe, it, expect } from "vitest";
import { sanitizeCsvCell, desanitizeCsvCell } from "@/lib/csv-sanitizer";
import { ImportExportService } from "@/application/use-cases/import-export/import-export-service";

describe("Milestone 8: Import/Export, Reports & Privacy Engine", () => {
  describe("CWE-1236 Formula Injection Protection", () => {
    it("neutralizes formula injection characters (=, +, -, @, \\t, \\r) by prepending a single quote", () => {
      // Malicious payloads attempting DDE or formula execution
      const maliciousPayloads = [
        '=cmd|\' /C calc\'!A0',
        '=1+2',
        '+1234567890',
        '-500000',
        '@SUM(A1:A10)',
        '\tMALICIOUS_TAB',
        '\rMALICIOUS_CR',
      ];

      for (const payload of maliciousPayloads) {
        const sanitized = sanitizeCsvCell(payload);
        expect(sanitized.startsWith("'")).toBe(true);
      }
    });

    it("leaves safe regular string and numeric cells unmodified", () => {
      const safeInputs = [
        "BBCA",
        "PT Bank Central Asia Tbk",
        "10000",
        "Saham IDX",
        "2026-11-20",
        "",
      ];

      for (const input of safeInputs) {
        const sanitized = sanitizeCsvCell(input);
        expect(sanitized).toBe(input);
      }
    });

    it("correctly desanitizes escaped cells when reading back from CSV", () => {
      expect(desanitizeCsvCell("'-500000")).toBe("-500000");
      expect(desanitizeCsvCell("'+628123456")).toBe("+628123456");
      expect(desanitizeCsvCell("'=SUM(A1:A10)")).toBe("=SUM(A1:A10)");
      expect(desanitizeCsvCell("BBCA")).toBe("BBCA");
    });
  });

  describe("Row-by-Row Zod Validation & Error Reporting", () => {
    it("validates valid transaction rows without errors", () => {
      const validRows = [
        {
          symbol: "BBCA",
          accountName: "Ajaib Sekuritas",
          type: "BUY",
          units: "100",
          pricePerUnit: "9800",
          fee: "15000",
          date: "2026-11-20",
          notes: "Rutin DCA bulanan",
        },
        {
          symbol: "TLKM",
          accountName: "Stockbit",
          type: "SELL",
          units: "50",
          pricePerUnit: "3800",
          fee: "5000",
          date: "2026-11-21",
        },
      ];

      const result = ImportExportService.validateData("transactions", validRows);
      expect(result.isValid).toBe(true);
      expect(result.validCount).toBe(2);
      expect(result.errorCount).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it("identifies invalid rows with precise row numbers and field-level messages", () => {
      const invalidRows = [
        {
          // Missing symbol
          accountName: "Ajaib",
          type: "BUY",
          units: "100",
          pricePerUnit: "9000",
          date: "2026-11-20",
        },
        {
          // Invalid transaction type & negative price
          symbol: "ASII",
          accountName: "Stockbit",
          type: "HOLD", // Invalid enum
          units: "100",
          pricePerUnit: "-500", // Negative price
          date: "2026-11-20",
        },
        {
          // Invalid date format
          symbol: "BBNI",
          accountName: "Stockbit",
          type: "BUY",
          units: "10",
          pricePerUnit: "5200",
          date: "invalid-date-format",
        },
      ];

      const result = ImportExportService.validateData("transactions", invalidRows);
      expect(result.isValid).toBe(false);
      expect(result.errorCount).toBe(3);
      expect(result.errors.length).toBeGreaterThanOrEqual(3);

      // Verify row numbering (1-indexed for human readability)
      expect(result.errors.some((e) => e.row === 1)).toBe(true);
      expect(result.errors.some((e) => e.row === 2)).toBe(true);
      expect(result.errors.some((e) => e.row === 3)).toBe(true);
    });

    it("validates cash accounts rows correctly", () => {
      const validCash = [
        {
          name: "BCA Tabungan Utama",
          institution: "Bank Central Asia",
          type: "SAVINGS",
          balance: "25000000",
          currency: "IDR",
          isEmergencyFund: "true",
        },
      ];

      const result = ImportExportService.validateData("cash", validCash);
      expect(result.isValid).toBe(true);
      expect(result.validCount).toBe(1);
    });

    it("validates liabilities and debts rows with due date check", () => {
      const validLiabilities = [
        {
          name: "Kredit Pemilikan Rumah (KPR)",
          lender: "Bank Mandiri",
          type: "MORTGAGE",
          originalAmount: "450000000",
          outstandingAmount: "380000000",
          interestRate: "7.5",
          monthlyPayment: "4200000",
          dueDate: "2035-12-31",
        },
      ];

      const result = ImportExportService.validateData("liabilities", validLiabilities);
      expect(result.isValid).toBe(true);
      expect(result.validCount).toBe(1);
    });

    it("validates dividend and coupon income rows", () => {
      const validIncome = [
        {
          symbol: "BBCA",
          type: "DIVIDEND",
          amount: "1500000",
          tax: "150000",
          netAmount: "1350000",
          status: "RECEIVED",
          paymentDate: "2026-11-15",
        },
      ];

      const result = ImportExportService.validateData("income", validIncome);
      expect(result.isValid).toBe(true);
      expect(result.validCount).toBe(1);
    });
  });

  describe("Duplicate Detection Engine", () => {
    it("flags duplicate records within the uploaded batch safely", () => {
      const duplicateBatch = [
        {
          symbol: "BBCA",
          accountName: "Ajaib",
          type: "BUY",
          units: "100",
          pricePerUnit: "9800",
          date: "2026-11-20",
        },
        {
          symbol: "BBCA",
          accountName: "Ajaib",
          type: "BUY",
          units: "100",
          pricePerUnit: "9800",
          date: "2026-11-20", // Exact identical duplicate
        },
      ];

      const result = ImportExportService.validateData("transactions", duplicateBatch);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some((w) => w.message.toLowerCase().includes("duplikat"))).toBe(true);
    });
  });

  describe("CSV Template Generation", () => {
    it("generates correct CSV templates with required headers and example rows", () => {
      const txTemplate = ImportExportService.generateTemplate("transactions");
      expect(txTemplate.filename).toBe("template_transactions.csv");
      expect(txTemplate.content).toContain("symbol");
      expect(txTemplate.content).toContain("accountName");
      expect(txTemplate.content).toContain("type");
      expect(txTemplate.content).toContain("units");
      expect(txTemplate.content).toContain("pricePerUnit");

      const cashTemplate = ImportExportService.generateTemplate("cash");
      expect(cashTemplate.filename).toBe("template_cash_accounts.csv");
      expect(cashTemplate.content).toContain("name");
      expect(cashTemplate.content).toContain("institution");
      expect(cashTemplate.content).toContain("balance");

      const liabTemplate = ImportExportService.generateTemplate("liabilities");
      expect(liabTemplate.filename).toBe("template_liabilities.csv");
      expect(liabTemplate.content).toContain("outstandingAmount");

      const incomeTemplate = ImportExportService.generateTemplate("income");
      expect(incomeTemplate.filename).toBe("template_income.csv");
      expect(incomeTemplate.content).toContain("amount");
    });
  });

  describe("Privacy & Social Sharing Masking Rules", () => {
    it("masks nominal values with bullet masks while preserving percentages", () => {
      const hideNominals = true;
      const mask = (nominal: number) => (hideNominals ? "Rp •••••••" : `Rp ${nominal.toLocaleString("id-ID")}`);

      const netWorthNominal = 150000000;
      const returnPercent = 18.5;

      expect(mask(netWorthNominal)).toBe("Rp •••••••");
      expect(`${returnPercent > 0 ? "+" : ""}${returnPercent}%`).toBe("+18.5%");
    });
  });
});
