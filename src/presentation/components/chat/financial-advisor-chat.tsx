"use client";

import { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  Loader2,
  RotateCcw,
  Bot,
  User,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { sendFinancialChatMessageAction } from "@/app/actions/ai-actions";
import { SessionUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  "🔍 Audit Kesehatan Portofolio Saya",
  "🛡️ Cek Rasio Dana Darurat & Utang",
  "⚖️ Analisis Diversifikasi Portofolio",
  "💡 Saran Alokasi Investasi Bulan Ini",
];

export function FinancialAdvisorChat({ user }: { user?: SessionUser | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasInteracted, setHasInteracted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayName = user?.name || (user?.email ? user.email.split("@")[0] : "Investor");

  // Load chat from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("wealth_os_advisor_chat");
      if (saved) {
        setMessages(JSON.parse(saved));
        setHasInteracted(true);
      } else {
        // Initial welcome message from CFP Advisor
        const initialMsg: ChatMessage = {
          id: "welcome",
          role: "model",
          text: `Halo **${displayName}**! 👋 Saya adalah **AI Financial Advisor** pribadi Anda dengan standar Certified Financial Planner (CFP).

Saya memiliki akses langsung ke portofolio Anda untuk:
- Mengaudit kesehatan rasio keuangan & dana darurat.
- Menganalisis keseimbangan alokasi aset & profil risiko.
- Memberikan saran pelunasan utang dan strategi investasi yang aman.

Pilih topik cepat di bawah atau tanyakan apa saja seputar portofolio Anda!`,
          timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages([initialMsg]);
      }
    } catch {
      // ignore
    }
  }, [displayName]);

  // Save chat to sessionStorage
  useEffect(() => {
    if (messages.length > 0) {
      try {
        sessionStorage.setItem("wealth_os_advisor_chat", JSON.stringify(messages));
      } catch {
        // ignore
      }
    }
  }, [messages]);

  // Auto scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  async function handleSendMessage(textToSend?: string) {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    setHasInteracted(true);
    const timeStr = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: "user",
      text,
      timestamp: timeStr,
    };

    const aiMessageId = `ai_${Date.now()}`;
    const initialAiMsg: ChatMessage = {
      id: aiMessageId,
      role: "model",
      text: "",
      timestamp: timeStr,
    };

    const newHistory = [...messages, userMsg];
    setMessages([...newHistory, initialAiMsg]);
    setInputMessage("");
    setIsLoading(true);

    const apiHistory = newHistory
      .filter((m) => m.id !== "welcome")
      .slice(-6)
      .map((m) => ({
        role: m.role,
        text: m.text,
      }));

    try {
      // 1. Ultra-fast streaming via server route
      const response = await fetch("/api/ai/advisor-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: apiHistory,
          message: text,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        accumulated += decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) => (m.id === aiMessageId ? { ...m, text: accumulated } : m))
        );
      }

      if (!accumulated) {
        throw new Error("Respons kosong");
      }
    } catch {
      // 2. Fallback to server action if stream is interrupted
      try {
        const res = await sendFinancialChatMessageAction(apiHistory, text);
        if (res.success && res.text) {
          setMessages((prev) =>
            prev.map((m) => (m.id === aiMessageId ? { ...m, text: res.text } : m))
          );
        } else {
          throw new Error(res.error || "Gagal menghubungi AI");
        }
      } catch (fallbackErr) {
        const errMsg = fallbackErr instanceof Error ? fallbackErr.message : "Gagal memproses analisis";
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMessageId
              ? { ...m, text: `⚠️ **Maaf:** ${errMsg}. Silakan coba klik pertanyaan lagi.` }
              : m
          )
        );
      }
    }

    setIsLoading(false);
  }

  function handleResetChat() {
    sessionStorage.removeItem("wealth_os_advisor_chat");
    const initialMsg: ChatMessage = {
      id: "welcome_reset",
      role: "model",
      text: `Percakapan telah direset. Ada yang bisa saya bantu audit untuk portofolio Anda hari ini, **${displayName}**?`,
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages([initialMsg]);
  }

  // Format simple markdown bold and lists into clean JSX
  function renderFormattedMessage(content: string) {
    const lines = content.split("\n");
    return lines.map((line, idx) => {
      // Bold replacement
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedLine = parts.map((part, pIdx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={pIdx} className="font-bold text-[#0F172A]">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      if (line.trim().startsWith("- ") || line.trim().startsWith("• ")) {
        return (
          <div key={idx} className="flex items-start gap-2 my-0.5 pl-1">
            <span className="text-blue-500 font-bold shrink-0">•</span>
            <span className="flex-1">{formattedLine}</span>
          </div>
        );
      }

      if (line.trim().startsWith("### ")) {
        return (
          <h5 key={idx} className="font-bold text-xs uppercase tracking-wider text-blue-700 mt-2.5 mb-1">
            {line.replace("### ", "")}
          </h5>
        );
      }

      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />;
      }

      return (
        <p key={idx} className="my-0.5 leading-relaxed">
          {formattedLine}
        </p>
      );
    });
  }

  return (
    <>
      {/* --- FLOATING LAUNCHER BUTTON --- */}
      <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40">
        {!isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Buka AI Financial Advisor"
            className="group relative flex h-14 w-14 sm:h-15 sm:w-15 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 text-white shadow-[0_8px_25px_rgba(37,99,235,0.35)] hover:shadow-[0_12px_32px_rgba(37,99,235,0.45)] hover:scale-105 active:scale-95 transition-all duration-200 border border-white/20"
          >
            <Sparkles className="h-6.5 w-6.5 sm:h-7.5 sm:w-7.5 text-white group-hover:rotate-12 transition-transform duration-300" />
            
            {/* Pulsating badge indicator */}
            {!hasInteracted && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white" />
              </span>
            )}

            {/* Micro Tooltip */}
            <span className="absolute right-full mr-3 hidden sm:group-hover:inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-900/90 text-white text-xs font-semibold whitespace-nowrap backdrop-blur-xs shadow-md pointer-events-none animate-in fade-in slide-in-from-right-2">
              Tanya CFP Advisor
            </span>
          </button>
        )}
      </div>

      {/* --- LIVECHAT DRAWER PANEL --- */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-[410px] h-[560px] max-h-[85vh] z-50 flex flex-col rounded-2xl border border-[#E4E8EF] bg-white shadow-[0_20px_50px_rgba(15,23,42,0.18)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md border border-white/20 shrink-0">
                <Bot className="h-4.5 w-4.5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold truncate">Wealth AI Advisor</h3>
                  <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-white/20 border border-white/30 text-white">
                    CFP
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-blue-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span className="truncate">Tersambung ke Portofolio Anda</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleResetChat}
                title="Reset Percakapan"
                className="rounded-lg p-1.5 text-white/80 hover:bg-white/15 hover:text-white transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Tutup Chat"
                className="rounded-lg p-1.5 text-white/80 hover:bg-white/15 hover:text-white transition-colors"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#F8FAFC]/70">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-2.5 max-w-[88%]",
                  msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                {/* Avatar Icon */}
                <div
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold shadow-2xs",
                    msg.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-blue-600 border border-slate-200"
                  )}
                >
                  {msg.role === "user" ? (
                    <User className="h-3.5 w-3.5" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                </div>

                {/* Message Bubble */}
                <div className="space-y-1">
                  <div
                    className={cn(
                      "rounded-2xl px-3.5 py-2.5 text-xs shadow-2xs leading-relaxed",
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-tr-xs"
                        : "bg-white text-[#334155] border border-slate-200/80 rounded-tl-xs"
                    )}
                  >
                    {msg.role === "user" ? (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    ) : (
                      <div className="space-y-1">{renderFormattedMessage(msg.text)}</div>
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-[9px] text-[#94A3B8] block px-1 font-mono",
                      msg.role === "user" ? "text-right" : "text-left"
                    )}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-center gap-2.5 mr-auto">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 border border-slate-200 shadow-2xs">
                  <Sparkles className="h-3.5 w-3.5 animate-spin" />
                </div>
                <div className="rounded-2xl rounded-tl-xs bg-white border border-slate-200/80 px-3.5 py-2.5 text-xs text-[#64748B] flex items-center gap-2 shadow-2xs">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
                  <span>Menganalisis portofolio keuangan...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Chips */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {QUICK_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                disabled={isLoading}
                className="whitespace-nowrap rounded-lg bg-slate-50 border border-slate-200/80 px-2.5 py-1 text-[11px] font-medium text-[#475569] hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors shrink-0 disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Footer Input Area */}
          <div className="p-3 bg-white border-t border-[#EEF1F5] shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                placeholder="Tanyakan analisis portofolio atau saran CFP..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isLoading}
                className="flex-1 rounded-xl border border-[#E4E8EF] bg-[#F8FAFC] px-3.5 py-2 text-xs text-[#1E293B] placeholder-[#94A3B8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all disabled:opacity-50"
              />
              <Button
                type="submit"
                size="sm"
                disabled={isLoading || !inputMessage.trim()}
                className="h-8 w-8 p-0 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shrink-0 disabled:opacity-40 shadow-xs"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
              </Button>
            </form>
            <div className="flex items-center justify-between pt-2 px-1 text-[10px] text-[#94A3B8]">
              <span>Didukung Gemini AI · Persona CFP Standar FPSB</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
