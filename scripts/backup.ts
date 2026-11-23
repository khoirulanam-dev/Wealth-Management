import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import fs from "fs";
import path from "path";
import { BackupService } from "@/application/use-cases/system/backup-service";

async function runBackup() {
  console.log("🔒 [WEALTH OS] Memulai proses pencadangan database...");

  const isFileRequested = process.argv.includes("--file");
  const backupName = process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2] : undefined;

  // 1. Simpan cadangan langsung ke database PostgreSQL (tabel system_backups)
  const result = await BackupService.saveBackupToDatabase({ name: backupName });

  console.log(`✅ [WEALTH OS] Cadangan berhasil disimpan di Database Neon PostgreSQL!`);
  console.log(`📋 [WEALTH OS] ID Cadangan: ${result.backupId}`);
  console.log(`🏷️ [WEALTH OS] Nama: ${result.name}`);
  console.log(`🔑 [WEALTH OS] SHA-256 Checksum: ${result.checksum}`);
  console.log("📊 [WEALTH OS] Rangkuman jumlah entitas tersimpan:");
  for (const [table, count] of Object.entries(result.recordCounts)) {
    console.log(`   - ${table}: ${count} baris`);
  }

  // 2. Jika secara eksplisit meminta ekspor file fisik (--file)
  if (isFileRequested) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupDir = path.resolve(process.cwd(), "backups");
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    const bundle = await BackupService.getDatabaseBackupBundle(result.backupId);
    if (bundle) {
      const filename = `wealth_os_backup_${timestamp}.json`;
      const targetPath = path.join(backupDir, filename);
      fs.writeFileSync(targetPath, JSON.stringify(bundle, null, 2), "utf-8");
      console.log(`📁 [WEALTH OS] Ekspor file lokal cadangan: ${targetPath}`);
    }
  } else {
    console.log("\n💡 Catatan: Cadangan disimpan 100% di database (tanpa membuat file di folder proyek & tanpa commit git).");
  }
}

runBackup()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ [WEALTH OS] Pencadangan gagal:", err);
    process.exit(1);
  });
