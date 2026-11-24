"use server";

import { requireAuth } from "@/lib/auth";
import { FinancialAdvisorService, ChatMessage } from "@/application/use-cases/ai/financial-advisor-service";

export async function sendFinancialChatMessageAction(history: ChatMessage[], message: string) {
  try {
    const session = await requireAuth();

    const trimmed = message.trim();
    if (!trimmed) {
      return { success: false, error: "Pesan tidak boleh kosong." };
    }

    const reply = await FinancialAdvisorService.chatWithAdvisor(session.userId, history, trimmed);

    return { success: true, text: reply };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "Terjadi kesalahan saat memproses jawaban AI.";
    return { success: false, error: errMsg };
  }
}
