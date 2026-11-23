"use client";

import { useState } from "react";
import { Plus, PiggyBank, AlertCircle, Loader2, X, Wallet } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { useToast } from "@/presentation/components/ui/toast";
import { createIncomeAction } from "@/app/actions/income-actions";

interface InstrumentOption {
  id: string;
  name: string;
  symbol: string | null;
  assetType: string;
}

interface AccountOption {
  id: string;
  name: string;
  institution: string;
}

interface CashAccountOption {
  id: string;
  name: string;
  institution: string;
  currentBalance: string;
}

interface IncomeDialogProps {
  instruments: InstrumentOption[];
  accounts: AccountOption[];
  cashAccounts: CashAccountOption[];
  onIncomeCreated?: () => void;
}

export function IncomeDialog({
  instruments,
  accounts,
  cashAccounts,
  onIncomeCreated,
}: IncomeDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [type, setType] = useState("dividend");
  const [status, setStatus] = useState("received");
  const [instrumentId, setInstrumentId] = useState("none");
  const [accountId, setAccountId] = useState("none");
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [exDate, setExDate] = useState("");
  const [depositToCashAccountId, setDepositToCashAccountId] = useState("none");
  const [note, setNote] = useState("");

  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    if (instrumentId && instrumentId !== "none") formData.set("instrumentId", instrumentId);
    if (accountId && accountId !== "none") formData.set("accountId", accountId);
    formData.set("type", type);
    formData.set("status", status);
    formData.set("paymentDate", paymentDate);
    if (exDate) formData.set("exDate", exDate);

    if (status === "received") {
      formData.set("actualAmount", amount);
    } else {
      formData.set("expectedAmount", amount);
    }

    if (depositToCashAccountId && depositToCashAccountId !== "none") {
      formData.set("depositToCashAccountId", depositToCashAccountId);
    }
    if (note) formData.set("note", note);

    const result = await createIncomeAction(formData);

    if (result.success) {
      toast.success(
        status === "received"
          ? "Pendapatan pasif berhasil dicatat!"
          : "Proyeksi pendapatan (forecast) berhasil ditambahkan!"
      );
      setIsLoading(false);
      setIsOpen(false);
      setAmount("");
      setNote("");
      if (onIncomeCreated) onIncomeCreated();
    } else {
      const errMsg = result.error || "Gagal mencatat pendapatan";
      setError(errMsg);
      toast.error(errMsg);
      setIsLoading(false);
    }
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs h-9 shadow-sm"
      >
        <Plus className="h-4 w-4" />
        Catat Pendapatan
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl sm:max-w-3xl rounded-2xl border border-[#E4E8EF] bg-white p-6 sm:p-7 shadow-xl animate-in fade-in zoom-in-95 duration-150 my-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E4E8EF]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <PiggyBank className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1E293B]">Catat Pendapatan Pasif</h3>
                  <p className="text-xs text-[#64748B]">Dividen saham, kupon obligasi/SBN, atau bunga simpanan</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-[#94A3B8] hover:bg-slate-100 hover:text-[#1E293B] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {/* Status Switcher: Received vs Forecast */}
              <div className="grid grid-cols-2 gap-3 p-1 rounded-xl bg-[#F8FAFC] border border-[#E4E8EF]">
                <button
                  type="button"
                  onClick={() => setStatus("received")}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                    status === "received"
                      ? "bg-white text-emerald-700 shadow-sm border border-emerald-200"
                      : "text-[#64748B] hover:text-[#1E293B]"
                  }`}
                >
                  Riil Diterima (Received)
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("forecast")}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                    status === "forecast"
                      ? "bg-white text-blue-700 shadow-sm border border-blue-200"
                      : "text-[#64748B] hover:text-[#1E293B]"
                  }`}
                >
                  Proyeksi Mendatang (Forecast)
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Jenis Pendapatan
                  </label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih jenis pendapatan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dividend">Dividen Saham (Cash Dividend)</SelectItem>
                      <SelectItem value="coupon">Kupon Obligasi / SBN (ORI/SR/FR)</SelectItem>
                      <SelectItem value="distribution">Bagi Hasil Reksa Dana</SelectItem>
                      <SelectItem value="interest">Bunga Deposito / Tabungan</SelectItem>
                      <SelectItem value="other">Pendapatan Pasif Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Instrumen Terkait (Opsional)
                  </label>
                  <Select value={instrumentId} onValueChange={setInstrumentId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih instrumen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Bukan dari instrumen terdaftar</SelectItem>
                      {instruments.map((inst) => (
                        <SelectItem key={inst.id} value={inst.id}>
                          {inst.symbol ? `${inst.symbol} — ` : ""}{inst.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Akun Sekuritas / Sumber (Opsional)
                  </label>
                  <Select value={accountId} onValueChange={setAccountId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih akun sekuritas/bank" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Tidak spesifik</SelectItem>
                      {accounts.map((acc) => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {acc.name} ({acc.institution})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    {status === "received" ? "Nominal Riil Diterima (Rp)" : "Estimasi Nominal (Rp)"}
                  </label>
                  <Input
                    type="number"
                    step="any"
                    name="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    placeholder="Contoh: 1500000"
                    className="h-10 text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Tanggal Ex-Date / Cum-Date (Opsional)
                  </label>
                  <Input
                    type="date"
                    name="exDate"
                    value={exDate}
                    onChange={(e) => setExDate(e.target.value)}
                    className="h-10 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    {status === "received" ? "Tanggal Pembayaran Masuk" : "Estimasi Tanggal Pembayaran"}
                  </label>
                  <Input
                    type="date"
                    name="paymentDate"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    required
                    className="h-10 text-sm"
                  />
                </div>
              </div>

              {/* Deposit to Cash Account (Only when Received) */}
              {status === "received" && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                      Setor Otomatis ke Rekening Kas
                    </label>
                    <span className="text-xs text-[#94A3B8] flex items-center gap-1">
                      <Wallet className="h-3 w-3" /> Opsional
                    </span>
                  </div>
                  <Select value={depositToCashAccountId} onValueChange={setDepositToCashAccountId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih rekening kas penerima" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Tidak menyetor ke kas (Pencatatan laporan saja)</SelectItem>
                      {cashAccounts.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} ({c.institution})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-xs text-[#64748B] block">
                    Jika dipilih, saldo kas di rekening bank/RDN Anda akan langsung bertambah sebagai mutasi setoran.
                  </span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Catatan Tambahan (Opsional)
                </label>
                <Input
                  name="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Contoh: Dividen final tahun buku 2025, Rp 250/lembar"
                  className="h-10 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E4E8EF]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !amount}
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-2 font-medium"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Simpan Pendapatan
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
