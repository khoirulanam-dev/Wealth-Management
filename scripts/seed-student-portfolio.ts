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
} from "@/infrastructure/db/schema";
import { eq } from "drizzle-orm";
import { Decimal } from "decimal.js";
import { TransactionsService } from "@/application/use-cases/portfolio/transactions-service";
import { SnapshotService } from "@/application/use-cases/analytics/snapshot-service";

async function seedStudentPortfolio() {
  console.log("🌱 Menyiapkan seed portofolio realistis mahasiswa Indonesia...");

  // 1. Cari user utama (anam@gmail.com atau user pertama)
  const allUsers = await db.select().from(users).limit(1);
  if (allUsers.length === 0) {
    console.error("❌ Tidak ada user di database. Jalankan `npm run db:seed` terlebih dahulu.");
    process.exit(1);
  }

  const user = allUsers[0];
  const userId = user.id;
  console.log(`👤 Menggunakan profil akun: ${user.name || user.email} (ID: ${userId})`);

  // 2. Pembersihan data lama user agar konsisten dan tidak duplikasi
  console.log("🧹 Membersihkan catatan lama untuk user ini...");
  await db.delete(snapshots).where(eq(snapshots.userId, userId));
  await db.delete(watchlistItems).where(eq(watchlistItems.userId, userId));
  await db.delete(investmentIncome).where(eq(investmentIncome.userId, userId));
  await db.delete(liabilityPayments).where(eq(liabilityPayments.userId, userId));
  await db.delete(installmentSchedules);
  await db.delete(liabilities).where(eq(liabilities.userId, userId));
  await db.delete(cashMovements).where(eq(cashMovements.userId, userId));
  await db.delete(cashAccounts).where(eq(cashAccounts.userId, userId));
  await db.delete(valuations).where(eq(valuations.userId, userId));
  await db.delete(positions).where(eq(positions.userId, userId));
  await db.delete(investmentTransactions).where(eq(investmentTransactions.userId, userId));
  await db.delete(instruments).where(eq(instruments.userId, userId));
  await db.delete(financialAccounts).where(eq(financialAccounts.userId, userId));
  console.log("✓ Catatan lama berhasil dibersihkan.");

  // 3. Buat Akun Finansial (Financial Accounts)
  console.log("🏛️ Membuat akun institusi finansial...");
  const accStockbitId = `acc_stockbit_${Date.now()}`;
  const accBibitId = `acc_bibit_${Date.now()}`;
  const accTreasuryId = `acc_treasury_${Date.now()}`;
  const accJagoId = `acc_jago_${Date.now()}`;
  const accSeaBankId = `acc_seabank_${Date.now()}`;

  await db.insert(financialAccounts).values([
    {
      id: accStockbitId,
      userId,
      name: "Stockbit Sekuritas RDN BCA",
      institution: "Stockbit Sekuritas",
      accountType: "broker",
      currency: "IDR",
      isActive: true,
      notes: "Akun transaksi saham Bursa Efek Indonesia",
    },
    {
      id: accBibitId,
      userId,
      name: "Bibit Reksadana & SBN",
      institution: "PT Bibit Tumbuh Bersama",
      accountType: "mutual_fund_platform",
      currency: "IDR",
      isActive: true,
      notes: "Investasi reksadana pasar uang & obligasi ritel",
    },
    {
      id: accTreasuryId,
      userId,
      name: "Treasury Tabungan Emas",
      institution: "Treasury (PT Indonesia Logam Mulia)",
      accountType: "other",
      currency: "IDR",
      isActive: true,
      notes: "Simpanan logam mulia Antam fisik/digital",
    },
    {
      id: accJagoId,
      userId,
      name: "Bank Jago (Kantong Utama)",
      institution: "Bank Jago",
      accountType: "bank",
      currency: "IDR",
      isActive: true,
      notes: "Rekening operasional bulanan, makan, transport & print",
    },
    {
      id: accSeaBankId,
      userId,
      name: "SeaBank (Dana Darurat)",
      institution: "SeaBank Indonesia",
      accountType: "bank",
      currency: "IDR",
      isActive: true,
      notes: "Simpanan likuid bunga harian khusus dana darurat",
    },
  ]);

  // 4. Buat Kas & Simpanan (Cash Accounts & Movements)
  console.log("💵 Menyiapkan rekening kas & tabungan darurat...");
  const cashJagoId = `cash_jago_${Date.now()}`;
  const cashSeaBankId = `cash_seabank_${Date.now()}`;

  await db.insert(cashAccounts).values([
    {
      id: cashJagoId,
      userId,
      financialAccountId: accJagoId,
      openingBalance: "1500000.00",
      openingBalanceDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      currentBalance: "1500000.00",
      isEmergencyFund: false,
      emergencyFundTarget: null,
      currency: "IDR",
    },
    {
      id: cashSeaBankId,
      userId,
      financialAccountId: accSeaBankId,
      openingBalance: "2000000.00",
      openingBalanceDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      currentBalance: "3000000.00",
      isEmergencyFund: true,
      emergencyFundTarget: "5000000.00",
      currency: "IDR",
    },
  ]);

  // Catat mutasi kas
  await db.insert(cashMovements).values([
    {
      id: `mov_jago_open_${Date.now()}`,
      userId,
      cashAccountId: cashJagoId,
      type: "deposit",
      amount: "1500000.00",
      movementDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      note: "Setoran uang saku bulanan & honor asisten lab",
      status: "posted",
    },
    {
      id: `mov_sea_open_${Date.now()}`,
      userId,
      cashAccountId: cashSeaBankId,
      type: "deposit",
      amount: "2000000.00",
      movementDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      note: "Setoran tabungan dari uang saku magang",
      status: "posted",
    },
    {
      id: `mov_sea_topup_${Date.now()}`,
      userId,
      cashAccountId: cashSeaBankId,
      type: "deposit",
      amount: "1000000.00",
      movementDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      note: "Top up dana darurat dari sisa freelance web design",
      status: "posted",
    },
  ]);

  // 5. Buat Instrumen Investasi
  console.log("📈 Menyiapkan instrumen investasi (Saham, Reksa Dana, Emas)...");
  const instBbcaId = `inst_bbca_${Date.now()}`;
  const instBbriId = `inst_bbri_${Date.now()}`;
  const instSidoId = `inst_sido_${Date.now()}`;
  const instSmmfId = `inst_smmf_${Date.now()}`;
  const instAntamId = `inst_antam_${Date.now()}`;

  await db.insert(instruments).values([
    {
      id: instBbcaId,
      userId,
      name: "PT Bank Central Asia Tbk",
      symbol: "BBCA",
      assetType: "stock",
      market: "IDX",
      currency: "IDR",
      unit: "lembar",
      isActive: true,
    },
    {
      id: instBbriId,
      userId,
      name: "PT Bank Rakyat Indonesia (Persero) Tbk",
      symbol: "BBRI",
      assetType: "stock",
      market: "IDX",
      currency: "IDR",
      unit: "lembar",
      isActive: true,
    },
    {
      id: instSidoId,
      userId,
      name: "PT Industri Jamu dan Farmasi Sido Muncul Tbk",
      symbol: "SIDO",
      assetType: "stock",
      market: "IDX",
      currency: "IDR",
      unit: "lembar",
      isActive: true,
    },
    {
      id: instSmmfId,
      userId,
      name: "Sucorinvest Money Market Fund",
      symbol: "SMMF",
      assetType: "mutual_fund",
      market: "IDX",
      currency: "IDR",
      unit: "unit",
      isActive: true,
    },
    {
      id: instAntamId,
      userId,
      name: "Emas Logam Mulia Antam",
      symbol: "ANTAM",
      assetType: "gold",
      market: "IDX",
      currency: "IDR",
      unit: "gram",
      isActive: true,
    },
  ]);

  // 6. Catat Transaksi Pembelian Investasi
  console.log("📝 Mencatat transaksi pembelian instrumen...");
  // BBCA: Beli 1 lot (100 lembar) @ Rp 9.800
  await TransactionsService.recordTransaction(userId, {
    instrumentId: instBbcaId,
    accountId: accStockbitId,
    type: "buy",
    tradeDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    quantity: "100",
    unitPrice: "9800",
    currency: "IDR",
    note: "Beli 1 lot BBCA cicil jangka panjang dari uang magang",
  });

  // BBRI: Beli 2 lot (200 lembar) @ Rp 4.750
  await TransactionsService.recordTransaction(userId, {
    instrumentId: instBbriId,
    accountId: accStockbitId,
    type: "buy",
    tradeDate: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000),
    quantity: "200",
    unitPrice: "4750",
    currency: "IDR",
    note: "Beli 2 lot BBRI saham BUMN perbankan andalan",
  });

  // SIDO: Beli 5 lot (500 lembar) @ Rp 540
  await TransactionsService.recordTransaction(userId, {
    instrumentId: instSidoId,
    accountId: accStockbitId,
    type: "buy",
    tradeDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    quantity: "500",
    unitPrice: "540",
    currency: "IDR",
    note: "Beli 5 lot SIDO dividen yield menarik modal ramah kantong",
  });

  // SMMF: Subscription Reksa Dana Pasar Uang Rp 3.000.000 (1392.36 unit @ 2154.60)
  await TransactionsService.recordTransaction(userId, {
    instrumentId: instSmmfId,
    accountId: accBibitId,
    type: "subscription",
    tradeDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
    quantity: "1392.36",
    unitPrice: "2154.60",
    currency: "IDR",
    note: "Investasi reksadana pasar uang likuid rendah risiko",
  });

  // ANTAM: Beli 2 gram Emas @ Rp 1.350.000/gram
  await TransactionsService.recordTransaction(userId, {
    instrumentId: instAntamId,
    accountId: accTreasuryId,
    type: "buy",
    tradeDate: new Date(Date.now() - 110 * 24 * 60 * 60 * 1000),
    quantity: "2",
    unitPrice: "1350000",
    currency: "IDR",
    note: "Beli 2 gram emas fisik Antam lindung nilai inflasi",
  });

  // 7. Update Valuasi Terkini & Posisi Untung/Rugi
  console.log("📊 Memperbarui valuasi pasar terkini...");
  const liveValuations = [
    { instId: instBbcaId, price: "10250", change: 4.59 }, // 100 * 10250 = 1,025,000 (+45,000)
    { instId: instBbriId, price: "4950", change: 4.21 },   // 200 * 4950 = 990,000 (+40,000)
    { instId: instSidoId, price: "580", change: 7.41 },    // 500 * 580 = 290,000 (+20,000)
    { instId: instSmmfId, price: "2154.68", change: 0.01 }, // 1392.36 * 2154.68 = 3,000,110.6 (+110.6)
    { instId: instAntamId, price: "1450000", change: 7.41 }, // 2 * 1,450,000 = 2,900,000 (+200,000)
  ];

  for (const v of liveValuations) {
    const valId = `val_seed_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await db.insert(valuations).values({
      id: valId,
      userId,
      instrumentId: v.instId,
      price: v.price,
      currency: "IDR",
      effectiveAt: new Date(),
      fetchedAt: new Date(),
      sourceType: "provider",
      sourceName: "Live Market Sync",
      status: "success",
      isManualOverride: false,
    });

    const userPos = await db
      .select()
      .from(positions)
      .where(eq(positions.instrumentId, v.instId));

    for (const p of userPos) {
      const qty = new Decimal(p.quantity || "0");
      const currentPrice = new Decimal(v.price);
      const marketVal = qty.times(currentPrice).toFixed(2);
      const costBasis = new Decimal(p.totalCostBasis || "0");
      const unrealizedPL = new Decimal(marketVal).minus(costBasis).toFixed(2);

      await db
        .update(positions)
        .set({
          currentPrice: v.price,
          marketValue: marketVal,
          unrealizedPL,
          lastValuationId: valId,
          updatedAt: new Date(),
        })
        .where(eq(positions.id, p.id));
    }
  }

  // 8. Catat Pendapatan Dividen Cair (Dividen Tunai Masuk)
  console.log("💰 Mencatat riwayat dividen tunai yang telah diterima...");
  await db.insert(investmentIncome).values([
    {
      id: `inc_bbca_${Date.now()}`,
      userId,
      instrumentId: instBbcaId,
      accountId: accStockbitId,
      type: "dividend",
      status: "received",
      paymentDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      expectedAmount: "4250.00",
      actualAmount: "4250.00",
      currency: "IDR",
      note: "Dividen Interim BBCA Rp 42.50 per lembar x 100 lembar",
    },
    {
      id: `inc_bbri_${Date.now()}`,
      userId,
      instrumentId: instBbriId,
      accountId: accStockbitId,
      type: "dividend",
      status: "received",
      paymentDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      expectedAmount: "16800.00",
      actualAmount: "16800.00",
      currency: "IDR",
      note: "Dividen Interim BBRI Rp 84.00 per lembar x 200 lembar",
    },
    {
      id: `inc_sido_${Date.now()}`,
      userId,
      instrumentId: instSidoId,
      accountId: accStockbitId,
      type: "dividend",
      status: "received",
      paymentDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      expectedAmount: "9000.00",
      actualAmount: "9000.00",
      currency: "IDR",
      note: "Dividen Interim SIDO Rp 18.00 per lembar x 500 lembar",
    },
  ]);

  // 9. Catat Liabilitas (Utang Cicilan SPayLater Terkelola)
  console.log("💳 Menyiapkan liabilitas cicilan mahasiswa terkelola...");
  const liabId = `liab_spay_${Date.now()}`;
  await db.insert(liabilities).values({
    id: liabId,
    userId,
    name: "SPayLater - Upgrade SSD & RAM Laptop",
    type: "paylater",
    creditor: "PT Commerce Finance (Shopee)",
    originalAmount: "600000.00",
    outstandingBalance: "200000.00",
    currency: "IDR",
    startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // Jatuh tempo 20 hari ke depan
    installmentAmount: "200000.00",
    installmentFrequency: "monthly",
    installmentCount: 3,
    status: "active",
    note: "Cicilan 3 bulan untuk kebutuhan kuliah skripsi/tugas akhir (sisa 1x lagi)",
  });

  // Catat riwayat 2x cicilan yang sudah dibayar lunas
  await db.insert(liabilityPayments).values([
    {
      id: `liab_pay_1_${Date.now()}`,
      userId,
      liabilityId: liabId,
      paymentDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
      amount: "200000.00",
      installmentNumber: 1,
      note: "Pembayaran cicilan bulan ke-1 via Bank Jago",
    },
    {
      id: `liab_pay_2_${Date.now()}`,
      userId,
      liabilityId: liabId,
      paymentDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      amount: "200000.00",
      installmentNumber: 2,
      note: "Pembayaran cicilan bulan ke-2 via Bank Jago",
    },
  ]);

  // Jadwal cicilan
  await db.insert(installmentSchedules).values([
    {
      id: `sched_1_${Date.now()}`,
      liabilityId: liabId,
      dueDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
      plannedAmount: "200000.00",
      installmentNumber: 1,
      status: "paid",
    },
    {
      id: `sched_2_${Date.now()}`,
      liabilityId: liabId,
      dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      plannedAmount: "200000.00",
      installmentNumber: 2,
      status: "paid",
    },
    {
      id: `sched_3_${Date.now()}`,
      liabilityId: liabId,
      dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      plannedAmount: "200000.00",
      installmentNumber: 3,
      status: "upcoming",
    },
  ]);

  // 10. Daftar Pantauan (Watchlist)
  console.log("👁️ Menambahkan instrumen ke watchlist...");
  const watchlistInstruments = [
    { symbol: "ICBP", name: "PT Indofood CBP Sukses Makmur Tbk", assetType: "stock" },
    { symbol: "AMMN", name: "PT Amman Mineral Internasional Tbk", assetType: "stock" },
    { symbol: "ASII", name: "PT Astra International Tbk", assetType: "stock" },
    { symbol: "ORI026", name: "Obligasi Negara Ritel ORI026", assetType: "bond" },
  ];

  for (const item of watchlistInstruments) {
    const instId = `inst_watch_${item.symbol}_${Date.now()}`;
    await db.insert(instruments).values({
      id: instId,
      userId,
      name: item.name,
      symbol: item.symbol,
      assetType: item.assetType,
      market: "IDX",
      currency: "IDR",
      unit: item.assetType === "bond" ? "nominal" : "lembar",
      isActive: true,
    });

    await db.insert(watchlistItems).values({
      id: `watch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      instrumentId: instId,
      note: "Pantau untuk target alokasi berikutnya",
      addedAt: new Date(),
    });
  }

  // 11. Buat Snapshots Historis agar Grafik Pertumbuhan Langsung Terbentuk
  console.log("📸 Mengambil point-in-time snapshot portofolio...");
  // Snapshot 60 hari lalu (Awal mulai menabung: Rp 4.500.000)
  await db.insert(snapshots).values({
    id: `snap_hist_60d_${Date.now()}`,
    userId,
    snapshotDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    reportingCurrency: "IDR",
    totalInvestments: "2700000.00",
    totalCash: "2000000.00",
    totalLiabilities: "200000.00",
    netWorth: "4500000.00",
    breakdown: {
      assetAllocation: [
        { name: "Kas & Simpanan", assetType: "cash", value: "2000000.00", percentage: 42.5 },
        { name: "Emas Batangan", assetType: "gold", value: "2700000.00", percentage: 57.5 },
      ],
      institutionAllocation: [
        { name: "SeaBank", value: "2000000.00", percentage: 42.5 },
        { name: "Treasury", value: "2700000.00", percentage: 57.5 },
      ],
      topHoldings: [
        { symbol: "ANTAM", name: "Emas Antam", marketValue: "2700000.00", percentage: 57.5 },
      ],
    },
  });

  // Snapshot 30 hari lalu (Ekspansi ke reksadana & saham: Rp 8.800.000)
  await db.insert(snapshots).values({
    id: `snap_hist_30d_${Date.now()}`,
    userId,
    snapshotDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    reportingCurrency: "IDR",
    totalInvestments: "4880000.00",
    totalCash: "4500000.00",
    totalLiabilities: "580000.00",
    netWorth: "8800000.00",
    breakdown: {
      assetAllocation: [
        { name: "Kas & Simpanan", assetType: "cash", value: "4500000.00", percentage: 48.0 },
        { name: "Emas Batangan", assetType: "gold", value: "2750000.00", percentage: 29.3 },
        { name: "Saham BBCA & BBRI", assetType: "stock", value: "2130000.00", percentage: 22.7 },
      ],
      institutionAllocation: [
        { name: "Bank Jago & SeaBank", value: "4500000.00", percentage: 48.0 },
        { name: "Treasury", value: "2750000.00", percentage: 29.3 },
        { name: "Stockbit", value: "2130000.00", percentage: 22.7 },
      ],
      topHoldings: [
        { symbol: "ANTAM", name: "Emas Antam", marketValue: "2750000.00", percentage: 29.3 },
        { symbol: "BBCA", name: "Bank BCA", marketValue: "1050000.00", percentage: 11.2 },
        { symbol: "BBRI", name: "Bank BRI", marketValue: "1080000.00", percentage: 11.5 },
      ],
    },
  });

  // Snapshot terkini otomatis melalui SnapshotService
  const latestSnap = await SnapshotService.captureSnapshot(userId, new Date());
  console.log(`✓ Snapshot terkini berhasil disimpan (ID: ${latestSnap.id})`);

  console.log("\n=======================================================");
  console.log("🎉 SEED PORTOFOLIO MAHASISWA BERHASIL SEPENUHNYA!");
  console.log("=======================================================");
  console.log("📊 Rincian Alokasi Mahasiswa:");
  console.log(" • Kas Operasional (Bank Jago)    : Rp 1.500.000");
  console.log(" • Tabungan Darurat (SeaBank)    : Rp 3.000.000 (Target Rp 5.000.000)");
  console.log(" • Reksadana Pasar Uang (Bibit)  : Rp 3.000.111");
  console.log(" • Saham BBCA (1 Lot)            : Rp 1.025.000 (Untung +4.6%)");
  console.log(" • Saham BBRI (2 Lot)            : Rp   990.000 (Untung +4.2%)");
  console.log(" • Saham SIDO (5 Lot)            : Rp   290.000 (Untung +7.4%)");
  console.log(" • Emas Antam (2 Gram)           : Rp 2.900.000 (Untung +7.4%)");
  console.log(" • Liabilitas (SPayLater Laptop) : Rp  -200.000 (Sisa 1x cicilan)");
  console.log(" • Dividen Masuk Tunai           : Rp    30.050 (3 pembayaran)");
  console.log("-------------------------------------------------------");
  console.log("💰 Total Kekayaan Bersih (Net Worth) : ~Rp 12.505.111");
  console.log("📈 Total Untung Investasi (Unrealized): +Rp 305.111 (+3.86%)");
  console.log("=======================================================\n");
}

seedStudentPortfolio().catch((err) => {
  console.error("❌ Seeding gagal:", err);
  process.exit(1);
});
