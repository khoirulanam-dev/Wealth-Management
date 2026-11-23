import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import fs from "fs";
import path from "path";
import { BackupService, FullBackupBundle } from "@/application/use-cases/system/backup-service";

async function runRestore() {
  const arg = process.argv[2];

  if (!arg || arg === "--list") {
    console.log("📋 [WEALTH OS] Mengambil daftar cadangan yang tersimpan di Database...");
    const backups = await BackupService.listDatabaseBackups();
    if (backups.length === 0) {
      console.log("Belum ada cadangan yang tersimpan di database.");
      console.log("Gunakan: npm run db:backup untuk membuat cadangan baru.");
    } else {
      console.log(`Ditemukan ${backups.length} cadangan di database:`);
      for (const b of backups) {
        console.log(` - ID: ${b.id}`);
        console.log(`   Nama: ${b.name}`);
        console.log(`   Waktu: ${new Date(b.createdAt).toLocaleString("id-ID")}`);
        console.log(`   Checksum: ${b.checksum.slice(0, 16)}...`);
      }
      console.log("\nUntuk memulihkan, jalankan: npx tsx scripts/restore.ts <ID_CADANGAN>");
    }
    process.exit(0);
  }

  // 1. Jika argumen adalah ID cadangan database (dimulai dengan bkp_)
  if (arg.startsWith("bkp_")) {
    console.log(`🔒 [WEALTH OS] Memulihkan cadangan dari Database (ID: ${arg})...`);
    const restoreResult = await BackupService.restoreFromDatabaseBackup(arg);

    if (!restoreResult.success) {
      console.error(`❌ [WEALTH OS] Pemulihan gagal: ${restoreResult.error}`);
      process.exit(1);
    }

    console.log("🎉 [WEALTH OS] Pemulihan database berhasil tuntas!");
    if ("restoredCounts" in restoreResult && restoreResult.restoredCounts) {
      for (const [table, count] of Object.entries(restoreResult.restoredCounts)) {
        console.log(`   - ${table}: ${count} baris dipulihkan`);
      }
    }
    return;
  }

  // 2. Jika argumen adalah path file JSON
  const resolvedPath = path.resolve(process.cwd(), arg);

  if (!fs.existsSync(resolvedPath)) {
    console.error(`❌ [WEALTH OS] Berkas cadangan atau ID tidak ditemukan: ${arg}`);
    console.log("Jalankan `npx tsx scripts/restore.ts --list` untuk melihat daftar cadangan database.");
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
