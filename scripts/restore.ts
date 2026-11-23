import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import fs from "fs";
import path from "path";
import { BackupService, FullBackupBundle } from "@/application/use-cases/system/backup-service";

async function runRestore() {
  const filePathArg = process.argv[2];

  if (!filePathArg) {
    console.error("❌ [WEALTH OS] Berkas cadangan tidak ditentukan.");
    console.log("Penggunaan: npx tsx scripts/restore.ts <path-to-backup.json>");
    process.exit(1);
  }

  const resolvedPath = path.resolve(process.cwd(), filePathArg);

  if (!fs.existsSync(resolvedPath)) {
    console.error(`❌ [WEALTH OS] Berkas cadangan tidak ditemukan di: ${resolvedPath}`);
    process.exit(1);
  }

  console.log(`🔒 [WEALTH OS] Membaca berkas cadangan: ${resolvedPath}`);
  const fileContent = fs.readFileSync(resolvedPath, "utf-8");
  const bundle = JSON.parse(fileContent) as FullBackupBundle;

  console.log("🔍 [WEALTH OS] Memverifikasi integritas dan SHA-256 Checksum...");
  const verifyResult = BackupService.verifyBackup(bundle);

  if (!verifyResult.isValid) {
    console.error(`❌ [WEALTH OS] Verifikasi gagal: ${verifyResult.error}`);
    process.exit(1);
  }

  console.log(`✅ [WEALTH OS] Integritas terverifikasi (Exported at: ${bundle.metadata.exportedAt})`);
  console.log("📥 [WEALTH OS] Memulihkan data ke database...");

  const restoreResult = await BackupService.restoreBackup(bundle);

  if (!restoreResult.success) {
    console.error(`❌ [WEALTH OS] Pemulihan gagal: ${restoreResult.error}`);
    process.exit(1);
  }

  console.log("🎉 [WEALTH OS] Pemulihan database berhasil tuntas!");
  for (const [table, count] of Object.entries(restoreResult.restoredCounts)) {
    console.log(`   - ${table}: ${count} baris dipulihkan`);
  }
}

runRestore()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ [WEALTH OS] Terjadi kesalahan fatal saat restore:", err);
    process.exit(1);
  });
