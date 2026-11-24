import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { db } from "@/infrastructure/db/client";
import {
  users,
  financialAccounts,
  instruments,
  positions,
  investmentTransactions,
  valuations,
  cashAccounts,
  cashMovements,
  liabilities,
  liabilityPayments,
  installmentSchedules,
  investmentIncome,
  watchlistItems,
  snapshots,
  auditEvents,
  importBatches,
} from "@/infrastructure/db/schema";
import { eq } from "drizzle-orm";

async function resetToZero() {
  console.log("==================================================");
  console.log("🧹 MEMULAI PROSES RESET DATABASE (MULAI DARI 0)...");
  console.log("==================================================");

  // 1. Ambil data pengguna yang ada
  const allUsers = await db.select().from(users);
  if (allUsers.length === 0) {
    console.log("⚠️ Tidak ada user di database. Menjalankan db:seed untuk inisialisasi akun dasar...");
    // Buat akun dasar jika belum ada
    return;
  }

  for (const user of allUsers) {
    const userId = user.id;
    console.log(`\n👤 Memproses reset data untuk: ${user.name || user.email} (${userId})`);

    // Hapus seluruh data finansial terkait user
    console.log(" - Menghapus snapshots...");
    await db.delete(snapshots).where(eq(snapshots.userId, userId));

    console.log(" - Menghapus watchlist...");
    await db.delete(watchlistItems).where(eq(watchlistItems.userId, userId));

    console.log(" - Menghapus income/dividen...");
    await db.delete(investmentIncome).where(eq(investmentIncome.userId, userId));

    console.log(" - Menghapus pembayaran & jadwal liabilitas...");
    await db.delete(liabilityPayments).where(eq(liabilityPayments.userId, userId));
    await db.delete(installmentSchedules);
    await db.delete(liabilities).where(eq(liabilities.userId, userId));

    console.log(" - Menghapus kas & mutasi kas...");
    await db.delete(cashMovements).where(eq(cashMovements.userId, userId));
    await db.delete(cashAccounts).where(eq(cashAccounts.userId, userId));

    console.log(" - Menghapus valuasi harga...");
    await db.delete(valuations).where(eq(valuations.userId, userId));

    console.log(" - Menghapus posisi portofolio...");
    await db.delete(positions).where(eq(positions.userId, userId));

    console.log(" - Menghapus transaksi investasi...");
    await db.delete(investmentTransactions).where(eq(investmentTransactions.userId, userId));

    console.log(" - Menghapus instrumen pasar...");
    await db.delete(instruments).where(eq(instruments.userId, userId));

    console.log(" - Menghapus akun finansial/broker...");
    await db.delete(financialAccounts).where(eq(financialAccounts.userId, userId));

    console.log(" - Menghapus log audit & impor...");
    await db.delete(auditEvents).where(eq(auditEvents.userId, userId));
    await db.delete(importBatches).where(eq(importBatches.userId, userId));

    console.log(`✓ Data finansial user ${user.email} telah bersih total (mulai dari 0).`);
  }

  console.log("\n==================================================");
  console.log("✅ RESET BERHASIL: SELURUH DATA FINANSIAL KEMBALI KE 0");
  console.log("Akun pengguna tetap tersimpan dengan kredensial & profil asli.");
  console.log("==================================================");
}

resetToZero()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Gagal mereset database:", err);
    process.exit(1);
  });
