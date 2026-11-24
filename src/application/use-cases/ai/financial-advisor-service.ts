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
  // Ultra-fast low-latency models (prioritizing sub-second response)
  private static MODELS = [
    "gemini-flash-lite-latest",
    "gemini-3.1-flash-lite",
    "gemini-3.5-flash-lite",
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
Anda adalah "Wealth AI Advisor", Certified Financial Planner (CFP) profesional berstandar FPSB Indonesia.

ATURAN KECEPATAN & KUALITAS AUDIT:
1. JAWAB LANGSUNG PADA INTI DIAGNOSIS (Zero Fluff). DILARANG menggunakan basa-basi seperti "Halo, selamat datang", "Berikut adalah analisis saya", atau pengantar panjang.
2. FORMAT AUDIT CFP (Padat, Terstruktur, Maksimal 300 kata):
   - **Status Kesehatan Finansial**: 1 kalimat kesimpulan objektif (Sangat Sehat / Seimbang / Perlu Rebalancing).
   - **Diagnosis Kunci (Maks 3 Poin)**:
     * Dana Darurat & Kas Likuid (Rasio kecukupan target)
     * Utang & Beban Bunga (Bebas utang / Debt Service Ratio)
     * Kinerja & Alokasi Portofolio (Keseimbangan Emas vs Saham vs Reksadana)
   - **Rekomendasi Tindakan (Action Items)**: 1-2 langkah konkret prioritas utama yang bisa langsung dieksekusi pengguna.
3. Anda memiliki akses penuh ke data keuangan riil pengguna di bawah. Gunakan angka riil secara presisi.

DATA KEUANGAN PENGGUNA:
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
              temperature: 0.25,
              topP: 0.9,
              maxOutputTokens: 650,
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

  /**
   * Streams CFP response chunk by chunk for ultra-fast first token (< 700ms).
   */
  public static async *streamAdvisorResponse(
    userId: string,
    history: ChatMessage[],
    userMessage: string
  ): AsyncGenerator<string, void, unknown> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY belum dikonfigurasi.");
    }

    const financialContext = await this.generateFinancialContext(userId);

    const systemInstruction = `
Anda adalah "Wealth AI Advisor", Certified Financial Planner (CFP) profesional berstandar FPSB Indonesia.

ATURAN KECEPATAN & KUALITAS AUDIT:
1. JAWAB LANGSUNG PADA INTI DIAGNOSIS (Zero Fluff). DILARANG menggunakan basa-basi seperti "Halo, selamat datang", "Berikut adalah analisis saya", atau pengantar panjang.
2. FORMAT AUDIT CFP (Padat, Terstruktur, Maksimal 300 kata):
   - **Status Kesehatan Finansial**: 1 kalimat kesimpulan objektif (Sangat Sehat / Seimbang / Perlu Rebalancing).
   - **Diagnosis Kunci (Maks 3 Poin)**:
     * Dana Darurat & Kas Likuid (Rasio kecukupan target)
     * Utang & Beban Bunga (Bebas utang / Debt Service Ratio)
     * Kinerja & Alokasi Portofolio (Keseimbangan Emas vs Saham vs Reksadana)
   - **Rekomendasi Tindakan (Action Items)**: 1-2 langkah konkret prioritas utama yang bisa langsung dieksekusi pengguna.
3. Anda memiliki akses penuh ke data keuangan riil pengguna di bawah. Gunakan angka riil secara presisi.

DATA KEUANGAN PENGGUNA:
${financialContext}
`.trim();

    const contents = history.map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    }));
    contents.push({
      role: "user",
      parts: [{ text: userMessage }],
    });

    for (const model of this.MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);

        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemInstruction }] },
            contents,
            generationConfig: {
              temperature: 0.25,
              topP: 0.9,
              maxOutputTokens: 650,
            },
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        if (!response.ok || !response.body) continue;

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const jsonStr = line.slice(6).trim();
              if (jsonStr === "[DONE]") return;
              try {
                const parsed = JSON.parse(jsonStr);
                const chunk = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                if (chunk) yield chunk;
              } catch {
                // partial json chunk
              }
            }
          }
        }
        return;
      } catch (err) {
        console.warn(`[FinancialAdvisorService] Stream from ${model} failed, trying next:`, err);
      }
    }

    // Fallback to non-streaming response if stream mirrors fail
    const fallback = await this.chatWithAdvisor(userId, history, userMessage);
    yield fallback;
  }
}
