import { HoldingsService } from "@/application/use-cases/portfolio/holdings-service";
import { CashService } from "@/application/use-cases/cash/cash-service";
import { LiabilityService } from "@/application/use-cases/liabilities/liability-service";
import { IncomeService } from "@/application/use-cases/income/income-service";
import { SnapshotService } from "@/application/use-cases/analytics/snapshot-service";
import { formatCurrency } from "@/lib/decimal";

export interface ChatMessage {
  role: "user" | "model";
  text: string;
}

export class FinancialAdvisorService {
  private static MODELS = [
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
    "gemini-flash-lite-latest",
  ];

  /**
   * Generates a structured financial dossier of the user's real portfolio.
   */
  public static async generateFinancialContext(userId: string): Promise<string> {
    const [
      { holdings, summary: holdingSummary, assetBreakdown },
      cashSummary,
      cashAccounts,
      liabilitySummary,
      liabilities,
      incomeSummary,
      analytics,
    ] = await Promise.all([
      HoldingsService.listActiveHoldings(userId),
      CashService.getCashSummary(userId),
      CashService.listCashAccounts(userId),
      LiabilityService.getSummary(userId),
      LiabilityService.getLiabilities(userId),
      IncomeService.getSummary(userId),
      SnapshotService.getAnalytics(userId),
    ]);

    const netWorth = analytics.netWorth;
    const totalAssets = parseFloat(holdingSummary.totalMarketValue) + parseFloat(cashSummary.totalCashBalance);
    const totalOutstandingNum = Number(liabilitySummary.totalOutstanding || 0);
    const debtRatio = totalAssets > 0 ? ((totalOutstandingNum / totalAssets) * 100).toFixed(1) : "0";

    const holdingsText = holdings.length > 0
      ? holdings.map((h) => `- ${h.instrumentSymbol || "ASET"} (${h.instrumentName}): ${h.quantity} ${h.unit} @ ${formatCurrency(parseFloat(h.currentPrice || "0"), "IDR")} | Nilai: ${formatCurrency(parseFloat(h.marketValue || "0"), "IDR")} (PnL: ${h.unrealizedPLPercentage}%)`).join("\n")
      : "- Belum ada posisi investasi aktif.";

    const cashAccountsText = cashAccounts.length > 0
      ? cashAccounts.map((c) => `- ${c.name} (${c.institution || "Bank"}): ${formatCurrency(parseFloat(c.currentBalance || "0"), "IDR")} [Tipe: ${c.accountType}]`).join("\n")
      : "- Belum ada rekening kas tercatat.";

    const liabilitiesText = liabilities.length > 0
      ? liabilities.map((l) => `- ${l.name} (${l.creditor}): Sisa ${formatCurrency(parseFloat(l.outstandingBalance || "0"), "IDR")} | Tipe: ${l.type} | Cicilan: ${formatCurrency(parseFloat(l.installmentAmount || "0"), "IDR")}/${l.installmentFrequency || "bln"}`).join("\n")
      : "- Bebas Utang (Tidak ada liabilitas aktif).";

    const allocationText = assetBreakdown.length > 0
      ? assetBreakdown.map((a) => `- ${a.assetType.toUpperCase()}: ${formatCurrency(a.value, "IDR")} (${a.percentage}%)`).join("\n")
      : "- Belum ada alokasi aset.";

    return `
RINGKASAN METRIK FINANSIAL RIIL PENGGUNA (PER HARI INI):
- Kekayaan Bersih (Net Worth): ${formatCurrency(netWorth, "IDR")}
- Total Aset (Investasi + Kas): ${formatCurrency(totalAssets, "IDR")}
- Total Saldo Kas & Likuid: ${formatCurrency(parseFloat(cashSummary.totalCashBalance), "IDR")}
- Target Dana Darurat: ${formatCurrency(parseFloat(cashSummary.emergencyFundTarget), "IDR")} (Tercapai: ${cashSummary.emergencyFundCoverage}%)
- Total Liabilitas / Utang: ${formatCurrency(totalOutstandingNum, "IDR")} (Rasio Utang thd Aset: ${debtRatio}%)
- Total Modal Disetor: ${formatCurrency(analytics.contributionsVsGains.totalCapitalInvested, "IDR")}
- Total Pertumbuhan Nilai Pasar: ${formatCurrency(analytics.contributionsVsGains.totalMarketGain, "IDR")} (${analytics.contributionsVsGains.gainPercentage}%)
- Total Pendapatan Dividen/Bunga: ${formatCurrency(incomeSummary.totalRealizedLifetime, "IDR")}

KOMPOSISI ALOKASI ASET:
${allocationText}

DAFTAR REKENING KAS & TABUNGAN:
${cashAccountsText}

DAFTAR KEPEMILIKAN INSTRUMEN INVESTASI (HOLDINGS):
${holdingsText}

STATUS UTANG & LIABILITAS:
${liabilitiesText}
`.trim();
  }

  /**
   * Generates CFP financial advisor response using Gemini API with failover models.
   */
  public static async chatWithAdvisor(
    userId: string,
    history: ChatMessage[],
    userMessage: string
  ): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY belum dikonfigurasi pada server.");
    }

    const financialContext = await this.generateFinancialContext(userId);

    const systemInstruction = `
Anda adalah "Wealth AI Advisor", seorang Certified Financial Planner (CFP) profesional berstandar FPSB Indonesia (Financial Planning Standards Board Indonesia) dan penasihat keuangan pribadi eksklusif di dalam platform Wealth OS.

PRINSIP AUDIT & KONSULTASI ANDA:
1. Berperilaku seperti CFP profesional: Berempati, analitis, berbasis data riil pengguna, tidak menghakimi, dan memprioritaskan keamanan finansial jangka panjang.
2. Kerangka Kerja Piramida Keuangan (Financial Hierarchy of Needs):
   - Level 1: Arus Kas & Dana Darurat (Mitigasi risiko likuiditas minimal 3-6 bulan pengeluaran).
   - Level 2: Pengendalian Utang Konsumtif (Debt Service Ratio aman < 30%, waspadai bunga tinggi PayLater/Pinjol).
   - Level 3: Akumulasi & Pertumbuhan Aset (Diversifikasi seimbang antara Kas, Saham Blue-Chip BEI, Reksadana, SBN Ritel ORI/SR, dan Emas Antam).
   - Level 4: Pencapaian Tujuan Finansial (Dana pendidikan, rumah, pensiun sejahtera).
3. Anda memiliki akses langsung ke DATA KEUANGAN RIIL PENGGUNA di bawah ini. JANGAN pernah meminta pengguna menyebutkan total uang atau portofolionya secara manual karena data sudah ada di sini. Gunakan angka riil ini secara presisi dan spesifik dalam setiap analisis Anda.
4. Bahasa: Bahasa Indonesia yang profesional, ramah, to-the-point, dan aplikatif.
5. Format Respons: Gunakan markdown yang rapi (bolding angka kunci, bullet points, dan subjudul jelas jika analisis panjang). Selalu sertakan "Rekomendasi Tindakan (Action Items)" konkret yang bisa langsung dilakukan pengguna.

${financialContext}
`.trim();

    // Map conversation history to Gemini contents format
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    for (const msg of history) {
      contents.push({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
      });
    }

    // Append the latest user query
    contents.push({
      role: "user",
      parts: [{ text: userMessage }],
    });

    let lastError: Error | null = null;

    // Multi-model failover for 99.9% uptime
    for (const model of this.MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 28000); // 28s timeout

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemInstruction }],
            },
            contents,
            generationConfig: {
              temperature: 0.7,
              topP: 0.95,
              maxOutputTokens: 2048,
            },
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errBody = await response.text();
          console.warn(`[FinancialAdvisorService] Model ${model} returned ${response.status}:`, errBody);
          continue; // Try next model
        }

        const data = await response.json();
        const candidate = data.candidates?.[0];
        const text = candidate?.content?.parts?.[0]?.text;

        if (text) {
          return text;
        }
      } catch (err) {
        console.warn(`[FinancialAdvisorService] Request to ${model} failed:`, err);
        lastError = err instanceof Error ? err : new Error(String(err));
      }
    }

    throw new Error(
      lastError?.message || "Layanan AI Financial Advisor sedang sibuk. Silakan coba sesaat lagi."
    );
  }
}
