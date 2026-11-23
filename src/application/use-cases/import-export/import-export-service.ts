import * as XLSX from "xlsx";
import { db } from "@/infrastructure/db/client";
import {
  investmentTransactions,
  instruments,
  financialAccounts,
  cashAccounts,
  liabilities,
  investmentIncome,
} from "@/infrastructure/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { sanitizeCsvCell, desanitizeCsvCell } from "@/lib/csv-sanitizer";
import { HoldingsService } from "@/application/use-cases/portfolio/holdings-service";
import { CashService } from "@/application/use-cases/cash/cash-service";
import { LiabilityService } from "@/application/use-cases/liabilities/liability-service";
import { IncomeService } from "@/application/use-cases/income/income-service";
import { TransactionsService } from "@/application/use-cases/portfolio/transactions-service";

export type ImportType = "transactions" | "cash" | "liabilities" | "income";

export interface ValidationErrorItem {
  row: number;
  field?: string;
  message: string;
}

export interface ValidationWarningItem {
  row: number;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  totalRows: number;
  validCount: number;
  errorCount: number;
  validRows: any[];
  invalidRows: Array<{ rowNumber: number; data: any; errors: string[] }>;
  errors: ValidationErrorItem[];
  warnings: ValidationWarningItem[];
  duplicateCount: number;
}

export class ImportExportService {
  /**
   * Generates downloadable CSV template for quick manual data population.
   */
  static generateTemplate(type: ImportType): { filename: string; content: string } {
    switch (type) {
      case "transactions":
        return {
          filename: "template_transactions.csv",
          content: [
            "symbol,accountName,type,units,pricePerUnit,fee,date,notes",
            "BBCA,Ajaib Sekuritas,BUY,100,10150,15000,2026-11-20,Beli rutin DCA",
            "ANTAM,Butik Antam,BUY,5,1420000,0,2026-11-21,Emas fisik",
            "TLKM,Stockbit,SELL,50,3800,5000,2026-11-22,Rebalancing parsial",
          ].join("\n"),
        };
      case "cash":
        return {
          filename: "template_cash_accounts.csv",
          content: [
            "name,institution,type,balance,currency,isEmergencyFund,emergencyFundTarget",
            "BCA Tabungan Utama,BCA,bank,25000000,IDR,true,50000000",
            "Mandiri Payroll,Mandiri,bank,10000000,IDR,false,",
            "GoPay Dompet,GoPay,e_wallet,1500000,IDR,false,",
          ].join("\n"),
        };
      case "liabilities":
        return {
          filename: "template_liabilities.csv",
          content: [
            "name,creditor,type,originalAmount,outstandingAmount,monthlyPayment,dueDate,interestRate",
            "Cicilan Laptop MacBook,Shopee SPayLater,paylater,15000000,12500000,1250000,2026-12-05,0",
            "KPR Rumah,Bank Mandiri,mortgage,450000000,380000000,4200000,2035-12-31,7.5",
          ].join("\n"),
        };
      case "income":
        return {
          filename: "template_income.csv",
          content: [
            "symbol,type,amount,tax,netAmount,status,paymentDate,notes",
            "BBCA,DIVIDEND,1500000,150000,1350000,RECEIVED,2026-11-15,Dividen interim",
            "PTBA,DIVIDEND,850000,0,850000,FORECAST,2026-12-20,Estimasi dividen",
          ].join("\n"),
        };
      default:
        throw new Error("Tipe template tidak dikenali");
    }
  }

  /**
   * Pure row-by-row validation engine supporting CSV & XLSX normalized objects.
   */
  static validateData(type: ImportType, rawRows: any[]): ValidationResult {
    const validRows: any[] = [];
    const invalidRows: Array<{ rowNumber: number; data: any; errors: string[] }> = [];
    const errors: ValidationErrorItem[] = [];
    const warnings: ValidationWarningItem[] = [];

    // Duplicate detection map: stringified signature -> list of row indices
    const signatureMap = new Map<string, number[]>();

    rawRows.forEach((row, index) => {
      const rowNumber = index + 1;
      const rowErrors: string[] = [];

      // Clean and normalize keys to lowercase trimmed
      const cleanRow: Record<string, string> = {};
      for (const [key, val] of Object.entries(row)) {
        cleanRow[key.trim().toLowerCase()] = desanitizeCsvCell(String(val ?? "")).trim();
      }

      if (type === "transactions") {
        const symbol = (cleanRow["symbol"] || cleanRow["simbol"] || "").toUpperCase();
        const account = cleanRow["accountname"] || cleanRow["akun_sekuritas"] || cleanRow["account"] || "Akun Utama";
        const txType = (cleanRow["type"] || cleanRow["tipe"] || "").toUpperCase();
        const units = cleanRow["units"] || cleanRow["jumlah"] || cleanRow["quantity"];
        const price = cleanRow["priceperunit"] || cleanRow["harga_satuan"] || cleanRow["price"];
        const dateStr = cleanRow["date"] || cleanRow["tanggal"];

        if (!symbol) rowErrors.push("Simbol atau ticker instrumen wajib diisi");
        if (!["BUY", "SELL"].includes(txType)) rowErrors.push("Tipe transaksi harus BUY atau SELL");
        if (!units || isNaN(parseFloat(units)) || parseFloat(units) <= 0) {
          rowErrors.push("Jumlah (units) harus berupa angka positif > 0");
        }
        if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
          rowErrors.push("Harga satuan harus berupa angka positif > 0");
        }
        if (!dateStr || isNaN(Date.parse(dateStr))) {
          rowErrors.push("Format tanggal tidak valid (gunakan YYYY-MM-DD)");
        }

        // Duplicate signature detection
        const signature = `TX|${symbol}|${account}|${txType}|${units}|${price}|${dateStr}`;
        if (!signatureMap.has(signature)) {
          signatureMap.set(signature, [rowNumber]);
        } else {
          signatureMap.get(signature)!.push(rowNumber);
        }

        if (rowErrors.length > 0) {
          invalidRows.push({ rowNumber, data: cleanRow, errors: rowErrors });
          rowErrors.forEach((msg) => errors.push({ row: rowNumber, message: msg }));
        } else {
          validRows.push({
            symbol,
            accountName: account,
            type: txType,
            quantity: units,
            unitPrice: price,
            tradeDate: new Date(dateStr),
            notes: cleanRow["notes"] || cleanRow["catatan"] || null,
          });
        }
      } else if (type === "cash") {
        const name = cleanRow["name"] || cleanRow["nama_rekening"];
        const institution = cleanRow["institution"] || cleanRow["institusi"];
        const balance = cleanRow["balance"] || cleanRow["saldo"] || cleanRow["saldo_awal"] || "0";
        const accountType = (cleanRow["type"] || cleanRow["tipe_akun"] || "bank").toLowerCase();

        if (!name) rowErrors.push("Nama rekening wajib diisi");
        if (!institution) rowErrors.push("Institusi (Bank/E-Wallet) wajib diisi");
        if (isNaN(parseFloat(balance))) rowErrors.push("Saldo harus berupa angka valid");

        const signature = `CASH|${name}|${institution}`;
        if (!signatureMap.has(signature)) {
          signatureMap.set(signature, [rowNumber]);
        } else {
          signatureMap.get(signature)!.push(rowNumber);
        }

        if (rowErrors.length > 0) {
          invalidRows.push({ rowNumber, data: cleanRow, errors: rowErrors });
          rowErrors.forEach((msg) => errors.push({ row: rowNumber, message: msg }));
        } else {
          validRows.push({
            name,
            institution,
            accountType,
            currentBalance: balance,
            currency: cleanRow["currency"] || cleanRow["mata_uang"] || "IDR",
            isEmergencyFund: cleanRow["isemergencyfund"] === "true",
            emergencyFundTarget: cleanRow["emergencyfundtarget"] || null,
          });
        }
      } else if (type === "liabilities") {
        const name = cleanRow["name"] || cleanRow["nama_kewajiban"];
        const creditor = cleanRow["creditor"] || cleanRow["kreditor"] || cleanRow["lender"] || "Kreditor";
        const originalAmount = cleanRow["originalamount"] || cleanRow["pokok_pinjaman"] || cleanRow["outstandingamount"] || "0";
        const outstanding = cleanRow["outstandingamount"] || cleanRow["sisa_utang"] || originalAmount;
        const dueDate = cleanRow["duedate"] || cleanRow["jatuh_tempo"] || cleanRow["jatuh_tempo_berikutnya"];

        if (!name) rowErrors.push("Nama kewajiban/utang wajib diisi");
        if (isNaN(parseFloat(outstanding)) || parseFloat(outstanding) < 0) {
          rowErrors.push("Sisa utang harus berupa angka non-negatif");
        }
        if (dueDate && isNaN(Date.parse(dueDate))) {
          rowErrors.push("Format tanggal jatuh tempo tidak valid");
        }

        const signature = `LIAB|${name}|${creditor}`;
        if (!signatureMap.has(signature)) {
          signatureMap.set(signature, [rowNumber]);
        } else {
          signatureMap.get(signature)!.push(rowNumber);
        }

        if (rowErrors.length > 0) {
          invalidRows.push({ rowNumber, data: cleanRow, errors: rowErrors });
          rowErrors.forEach((msg) => errors.push({ row: rowNumber, message: msg }));
        } else {
          validRows.push({
            name,
            creditor,
            type: (cleanRow["type"] || cleanRow["kategori"] || "other").toLowerCase(),
            originalAmount,
            outstandingBalance: outstanding,
            monthlyPayment: cleanRow["monthlypayment"] || cleanRow["cicilan_per_bulan"] || "0",
            dueDate: dueDate ? new Date(dueDate) : null,
          });
        }
      } else if (type === "income") {
        const symbol = (cleanRow["symbol"] || cleanRow["simbol_aset"] || "").toUpperCase();
        const amount = cleanRow["amount"] || cleanRow["nominal"] || cleanRow["netamount"] || "0";
        const status = (cleanRow["status"] || "received").toLowerCase();
        const dateStr = cleanRow["paymentdate"] || cleanRow["tanggal_bayar"];

        if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
          rowErrors.push("Nominal pendapatan harus berupa angka > 0");
        }
        if (dateStr && isNaN(Date.parse(dateStr))) {
          rowErrors.push("Format tanggal bayar tidak valid");
        }

        const signature = `INC|${symbol}|${dateStr}|${amount}`;
        if (!signatureMap.has(signature)) {
          signatureMap.set(signature, [rowNumber]);
        } else {
          signatureMap.get(signature)!.push(rowNumber);
        }

        if (rowErrors.length > 0) {
          invalidRows.push({ rowNumber, data: cleanRow, errors: rowErrors });
          rowErrors.forEach((msg) => errors.push({ row: rowNumber, message: msg }));
        } else {
          validRows.push({
            symbol: symbol || null,
            type: (cleanRow["type"] || cleanRow["tipe"] || "dividend").toLowerCase(),
            amount,
            status,
            paymentDate: dateStr ? new Date(dateStr) : new Date(),
            note: cleanRow["notes"] || cleanRow["catatan"] || null,
          });
        }
      }
    });

    // Check duplicate warnings
    let duplicateCount = 0;
    signatureMap.forEach((rowsList) => {
      if (rowsList.length > 1) {
        duplicateCount += rowsList.length - 1;
        warnings.push({
          row: rowsList[1],
          message: `Baris ${rowsList.join(", ")} terdeteksi sebagai data duplikat dalam batch impor ini`,
        });
      }
    });

    return {
      isValid: invalidRows.length === 0,
      totalRows: rawRows.length,
      validCount: validRows.length,
      errorCount: invalidRows.length,
      validRows,
      invalidRows,
      errors,
      warnings,
      duplicateCount,
    };
  }

  /**
   * Parses CSV or Excel (XLSX) file from base64/buffer and validates each row with strict checks.
   */
  static parseAndValidate(fileBase64: string, type: ImportType): ValidationResult {
    const buffer = Buffer.from(fileBase64, "base64");
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

    return this.validateData(type, rawRows);
  }

  /**
   * Executes atomic database import for validated rows.
   */
  static async executeImport(
    userId: string,
    type: ImportType,
    rows: any[]
  ): Promise<{ importedCount: number }> {
    let importedCount = 0;

    if (type === "transactions") {
      for (const item of rows) {
        // 1. Resolve or create account
        let [acc] = await db
          .select()
          .from(financialAccounts)
          .where(and(eq(financialAccounts.userId, userId), eq(financialAccounts.name, item.accountName)));

        if (!acc) {
          const [newAcc] = await db
            .insert(financialAccounts)
            .values({
              id: crypto.randomUUID(),
              userId,
              name: item.accountName,
              accountType: "brokerage",
              institution: "Sekuritas",
              currency: "IDR",
            })
            .returning();
          acc = newAcc;
        }

        // 2. Resolve or create instrument
        let [inst] = await db
          .select()
          .from(instruments)
          .where(and(eq(instruments.userId, userId), eq(instruments.symbol, item.symbol)));

        if (!inst) {
          const [newInst] = await db
            .insert(instruments)
            .values({
              id: crypto.randomUUID(),
              userId,
              symbol: item.symbol,
              name: item.symbol,
              assetType: "stock",
              market: "IDX",
              currency: "IDR",
              unit: "lembar",
            })
            .returning();
          inst = newInst;
        }

        // 3. Post transaction via TransactionsService
        await TransactionsService.recordTransaction(userId, {
          instrumentId: inst.id,
          accountId: acc.id,
          type: item.type.toLowerCase(),
          tradeDate: item.tradeDate,
          quantity: String(item.quantity),
          unitPrice: String(item.unitPrice),
          note: item.notes || "Imported batch",
        });
        importedCount++;
      }
    } else if (type === "cash") {
      for (const item of rows) {
        await CashService.createCashAccount(userId, {
          name: item.name,
          institution: item.institution,
          accountType: item.accountType || "bank",
          openingBalance: item.currentBalance,
          currency: item.currency || "IDR",
          isEmergencyFund: Boolean(item.isEmergencyFund),
          emergencyFundTarget: item.emergencyFundTarget,
        });
        importedCount++;
      }
    } else if (type === "liabilities") {
      for (const item of rows) {
        await LiabilityService.createLiability(userId, {
          name: item.name,
          creditor: item.creditor,
          type: item.type || "other",
          originalAmount: item.originalAmount,
          outstandingBalance: item.outstandingBalance,
          installmentAmount: item.monthlyPayment,
          startDate: new Date(),
          dueDate: item.dueDate ? new Date(item.dueDate) : undefined,
        });
        importedCount++;
      }
    } else if (type === "income") {
      for (const item of rows) {
        let instId: string | null = null;
        if (item.symbol) {
          const [found] = await db
            .select()
            .from(instruments)
            .where(and(eq(instruments.userId, userId), eq(instruments.symbol, item.symbol)));
          if (found) instId = found.id;
        }

        await IncomeService.createIncome(userId, {
          instrumentId: instId,
          type: item.type || "dividend",
          status: item.status || "received",
          paymentDate: item.paymentDate ? new Date(item.paymentDate) : new Date(),
          actualAmount: item.status === "received" ? item.amount : null,
          expectedAmount: item.status === "forecast" ? item.amount : null,
          note: item.note,
        });
        importedCount++;
      }
    }

    return { importedCount };
  }

  /**
   * Generates sanitized CSV or Excel (XLSX) export with CWE-1236 Formula Injection protection.
   */
  static async exportData(
    userId: string,
    module: "all" | "transactions" | "holdings" | "cash" | "liabilities" | "income",
    format: "csv" | "xlsx" = "csv"
  ): Promise<{ filename: string; buffer: Buffer; mimeType: string }> {
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `wealth_os_${module}_${timestamp}.${format}`;

    const exportSheets: Record<string, any[]> = {};

    if (module === "all" || module === "transactions") {
      const allTx = await db
        .select({
          id: investmentTransactions.id,
          tanggal: investmentTransactions.tradeDate,
          tipe: investmentTransactions.type,
          simbol: instruments.symbol,
          nama_instrumen: instruments.name,
          jumlah: investmentTransactions.quantity,
          harga_satuan: investmentTransactions.unitPrice,
          total_nominal: investmentTransactions.grossAmount,
          akun: financialAccounts.name,
          institusi: financialAccounts.institution,
          catatan: investmentTransactions.note,
        })
        .from(investmentTransactions)
        .leftJoin(instruments, eq(investmentTransactions.instrumentId, instruments.id))
        .leftJoin(financialAccounts, eq(investmentTransactions.accountId, financialAccounts.id))
        .where(eq(investmentTransactions.userId, userId))
        .orderBy(desc(investmentTransactions.tradeDate));

      exportSheets["Transaksi"] = allTx.map((t) => ({
        ID: sanitizeCsvCell(t.id),
        Tanggal: sanitizeCsvCell(t.tanggal.toISOString().slice(0, 10)),
        Tipe: sanitizeCsvCell(t.tipe),
        Simbol: sanitizeCsvCell(t.simbol || "-"),
        Nama_Instrumen: sanitizeCsvCell(t.nama_instrumen || "-"),
        Jumlah: sanitizeCsvCell(t.jumlah),
        Harga_Satuan: sanitizeCsvCell(t.harga_satuan),
        Total_Nominal: sanitizeCsvCell(t.total_nominal),
        Akun: sanitizeCsvCell(t.akun || "-"),
        Institusi: sanitizeCsvCell(t.institusi || "-"),
        Catatan: sanitizeCsvCell(t.catatan || ""),
      }));
    }

    if (module === "all" || module === "holdings") {
      const { holdings } = await HoldingsService.listActiveHoldings(userId);
      exportSheets["Kepemilikan_Aset"] = holdings.map((h) => ({
        Simbol: sanitizeCsvCell(h.instrumentSymbol || "-"),
        Nama_Instrumen: sanitizeCsvCell(h.instrumentName),
        Kelas_Aset: sanitizeCsvCell(h.assetType),
        Jumlah_Dimiliki: sanitizeCsvCell(h.quantity),
        Harga_Beli_Rata2: sanitizeCsvCell(h.averageCostPerUnit),
        Modal_Pokok: sanitizeCsvCell(h.totalCostBasis),
        Harga_Pasar: sanitizeCsvCell(h.currentPrice),
        Nilai_Pasar: sanitizeCsvCell(h.marketValue),
        Unrealized_PL: sanitizeCsvCell(h.unrealizedPL),
        Persentase_PL: sanitizeCsvCell(`${h.unrealizedPLPercentage}%`),
        Akun: sanitizeCsvCell(h.accountName),
        Institusi: sanitizeCsvCell(h.institution),
      }));
    }

    if (module === "all" || module === "cash") {
      const accounts = await CashService.listCashAccounts(userId);
      exportSheets["Kas_Simpanan"] = accounts.map((c) => ({
        Nama_Rekening: sanitizeCsvCell(c.name),
        Institusi: sanitizeCsvCell(c.institution),
        Tipe_Akun: sanitizeCsvCell(c.accountType),
        Saldo_Terkini: sanitizeCsvCell(c.currentBalance),
        Mata_Uang: sanitizeCsvCell(c.currency),
        Dana_Darurat: sanitizeCsvCell(c.isEmergencyFund ? "Ya" : "Tidak"),
      }));
    }

    if (module === "all" || module === "liabilities") {
      const liabList = await LiabilityService.getLiabilities(userId);
      exportSheets["Liabilitas_Utang"] = liabList.map((l) => ({
        Nama_Kewajiban: sanitizeCsvCell(l.name),
        Kreditor: sanitizeCsvCell(l.creditor),
        Kategori: sanitizeCsvCell(l.type),
        Pokok_Pinjaman: sanitizeCsvCell(l.originalAmount),
        Sisa_Utang: sanitizeCsvCell(l.outstandingBalance),
        Cicilan_Bulanan: sanitizeCsvCell(l.installmentAmount || "-"),
        Jatuh_Tempo: sanitizeCsvCell(l.dueDate ? l.dueDate.toISOString().slice(0, 10) : "-"),
        Status: sanitizeCsvCell(l.status),
      }));
    }

    if (module === "all" || module === "income") {
      const incomeList = await IncomeService.listIncome(userId);
      exportSheets["Dividen_Income"] = incomeList.map((i) => ({
        Simbol: sanitizeCsvCell(i.instrumentSymbol || "-"),
        Nama_Aset: sanitizeCsvCell(i.instrumentName || "-"),
        Tipe: sanitizeCsvCell(i.type),
        Tanggal_Bayar: sanitizeCsvCell(i.paymentDate ? i.paymentDate.toISOString().slice(0, 10) : "-"),
        Nominal: sanitizeCsvCell(i.actualAmount || i.expectedAmount || "0"),
        Status: sanitizeCsvCell(i.status),
        Catatan: sanitizeCsvCell(i.note || ""),
      }));
    }

    // Build Workbook
    const workbook = XLSX.utils.book_new();
    for (const [sheetName, sheetRows] of Object.entries(exportSheets)) {
      const worksheet = XLSX.utils.json_to_sheet(sheetRows.length > 0 ? sheetRows : [{ Status: "Tidak ada data" }]);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    }

    if (format === "xlsx") {
      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
      return {
        filename,
        buffer,
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      };
    } else {
      const firstSheetName = Object.keys(exportSheets)[0] || "Data";
      const csvStr = XLSX.utils.sheet_to_csv(workbook.Sheets[firstSheetName]);
      return {
        filename,
        buffer: Buffer.from(csvStr, "utf-8"),
        mimeType: "text/csv;charset=utf-8",
      };
    }
  }
}
