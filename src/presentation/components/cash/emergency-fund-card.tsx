import { AlertCircle, CheckCircle2, Target, Info } from "lucide-react";
import { formatCurrency } from "@/lib/decimal";

interface EmergencyFundCardProps {
  currentAmount: string | number;
  targetAmount: string | number;
  coveragePercent: string | number;
  accountCount: number;
  currency?: string;
}

export function EmergencyFundCard({
  currentAmount,
  targetAmount,
  coveragePercent,
  accountCount,
  currency = "IDR",
}: EmergencyFundCardProps) {
  const currentNum = parseFloat(String(currentAmount)) || 0;
  const targetNum = parseFloat(String(targetAmount)) || 0;
  const coverageNum = Math.min(100, Math.max(0, parseFloat(String(coveragePercent)) || 0));
  const isTargetSet = targetNum > 0;
  const isTargetAchieved = isTargetSet && currentNum >= targetNum;

  return (
    <div className="rounded-2xl border border-[#E4E8EF] bg-white p-6 shadow-card space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EEF1F5] pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            {isTargetAchieved ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-emerald-600" />
            )}
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1E293B]">
              Alokasi Dana Darurat (Emergency Fund)
            </h2>
            <p className="text-xs text-[#64748B]">
              Cadangan likuiditas darurat terisolasi untuk mitigasi risiko tak terduga
            </p>
          </div>
        </div>

        <div>
          {isTargetSet ? (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${
                isTargetAchieved
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-blue-50 text-blue-700 border border-blue-200"
              }`}
            >
              <Target className="h-3.5 w-3.5" />
              Tercapai {coveragePercent}%
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-50 text-[#64748B] border border-[#E4E8EF]">
              Target Belum Ditentukan
            </span>
          )}
        </div>
      </div>

      {/* Numerical Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#EEF1F5]">
          <span className="text-xs font-medium text-[#64748B] block mb-1">
            Saldo Dana Darurat Saat Ini
          </span>
          <div className="text-2xl font-bold tracking-tight text-emerald-600 font-mono">
            {formatCurrency(currentNum, currency)}
          </div>
          <span className="text-xs text-[#94A3B8] mt-1 block">
            Tersimpan di {accountCount} rekening berlabel dana darurat
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#EEF1F5]">
          <span className="text-xs font-medium text-[#64748B] block mb-1">
            Target Kebutuhan Ideal
          </span>
          <div className="text-2xl font-bold tracking-tight text-[#1E293B] font-mono">
            {isTargetSet ? formatCurrency(targetNum, currency) : formatCurrency(0, currency)}
          </div>
          <span className="text-xs text-[#94A3B8] mt-1 block">
            {isTargetSet
              ? `Kekurangan: ${formatCurrency(Math.max(0, targetNum - currentNum), currency)}`
              : "Dapat ditentukan saat menambah atau mengedit rekening"}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      {isTargetSet && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-[#64748B]">Progres Pencapaian</span>
            <span className="text-[#1E293B] font-mono">{coveragePercent}%</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isTargetAchieved ? "bg-emerald-500" : "bg-blue-600"
              }`}
              style={{ width: `${coverageNum}%` }}
            />
          </div>
        </div>
      )}

      {/* Guideline advisory box */}
      <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-[#E4E8EF] text-xs text-[#64748B]">
        <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-[#1E293B] font-medium">Panduan Alokasi:</strong> Disarankan
          menyimpan 3 hingga 6 bulan pengeluaran rutin (atau 12 bulan bagi wirausahawan) pada
          instrumen yang sangat likuid seperti rekening tabungan bank atau kas fisik tanpa risiko
          fluktuasi pasar modal.
        </p>
      </div>
    </div>
  );
}

