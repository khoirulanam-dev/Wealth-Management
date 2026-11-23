"use server";

import { requireAuth } from "@/lib/auth";
import { BackupService } from "@/application/use-cases/system/backup-service";
import { revalidatePath } from "next/cache";

export async function createDatabaseBackupAction(name?: string) {
  await requireAuth();
  try {
    const result = await BackupService.saveBackupToDatabase({ name });
    revalidatePath("/settings");
    return { success: true, backup: result };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal membuat cadangan di database";
    return { success: false, error: message };
  }
}

export async function listDatabaseBackupsAction() {
  await requireAuth();
  try {
    const list = await BackupService.listDatabaseBackups();
    return { success: true, backups: list };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal memuat daftar cadangan";
    return { success: false, backups: [], error: message };
  }
}

export async function restoreDatabaseBackupAction(backupId: string) {
  await requireAuth();
  try {
    const result = await BackupService.restoreFromDatabaseBackup(backupId);
    revalidatePath("/overview");
    revalidatePath("/investments");
    revalidatePath("/cash");
    revalidatePath("/settings");
    return result;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal memulihkan cadangan dari database";
    return { success: false, error: message };
  }
}

export async function deleteDatabaseBackupAction(backupId: string) {
  await requireAuth();
  try {
    await BackupService.deleteDatabaseBackup(backupId);
    revalidatePath("/settings");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal menghapus catatan cadangan";
    return { success: false, error: message };
  }
}

