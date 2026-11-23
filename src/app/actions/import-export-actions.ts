"use server";

import { requireAuth } from "@/lib/auth";
import { ImportExportService, ImportType } from "@/application/use-cases/import-export/import-export-service";
import { revalidatePath } from "next/cache";

export async function getTemplateAction(type: ImportType) {
  await requireAuth();
  try {
    const template = ImportExportService.generateTemplate(type);
    return { success: true, ...template };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal membuat template";
    return { success: false, error: message };
  }
}

export async function validateImportFileAction(formData: FormData) {
  await requireAuth();
  const file = formData.get("file") as File;
  const type = (formData.get("type") as ImportType) || "transactions";

  if (!file) {
    return { success: false, error: "File tidak ditemukan" };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const result = ImportExportService.parseAndValidate(base64, type);
    return { success: true, ...result };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal memproses file";
    return { success: false, error: message };
  }
}

export async function executeImportAction(type: ImportType, rowsJson: string) {
  const session = await requireAuth();

  try {
    const rows = JSON.parse(rowsJson);
    if (!Array.isArray(rows) || rows.length === 0) {
      return { success: false, error: "Tidak ada baris data valid untuk diimpor" };
    }

    const result = await ImportExportService.executeImport(session.userId, type, rows);

    revalidatePath("/overview");
    revalidatePath("/investments");
    revalidatePath("/cash");
    revalidatePath("/liabilities");
    revalidatePath("/income");
    revalidatePath("/analytics");
    revalidatePath("/transactions");

    return { success: true, ...result };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal menyimpan data import";
    return { success: false, error: message };
  }
}

export async function exportDataAction(
  module: "all" | "transactions" | "holdings" | "cash" | "liabilities" | "income",
  format: "csv" | "xlsx" = "csv"
) {
  const session = await requireAuth();

  try {
    const exportResult = await ImportExportService.exportData(session.userId, module, format);
    const base64 = exportResult.buffer.toString("base64");

    return {
      success: true,
      filename: exportResult.filename,
      mimeType: exportResult.mimeType,
      dataBase64: base64,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal mengekspor data";
    return { success: false, error: message };
  }
}

