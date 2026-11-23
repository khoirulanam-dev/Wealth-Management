import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import fs from "fs";
import path from "path";
import { BackupService } from "@/application/use-cases/system/backup-service";

async function runBackup() {
  console.log("🔒 [WEALTH OS] Memulai proses pencadangan database...");

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = path.resolve(process.cwd(), "backups");

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const bundle = await BackupService.createBackup();
  const filename = `wealth_os_backup_${timestamp}.json`;
  const targetPath = path.join(backupDir, filename);

  fs.writeFileSync(targetPath, JSON.stringify(bundle, null, 2), "utf-8");

  console.log(`✅ [WEALTH OS] Cadangan berhasil disimpan di: ${targetPath}`);
  console.log(`🔑 [WEALTH OS] SHA-256 Checksum: ${bundle.metadata.checksum}`);
  console.log("📊 [WEALTH OS] Rangkuman jumlah entitas tersimpan:");
  for (const [table, count] of Object.entries(bundle.metadata.recordCounts)) {
    console.log(`   - ${table}: ${count} baris`);
  }
}

runBackup()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ [WEALTH OS] Pencadangan gagal:", err);
    process.exit(1);
  });
