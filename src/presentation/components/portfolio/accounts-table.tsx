"use client";

import { useState } from "react";
import { Building2, Pencil, Trash2, Loader2, X, AlertCircle } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { updateAccountAction, deleteAccountAction } from "@/app/actions/portfolio-actions";
import { AccountDialog } from "./account-dialog";
import { useToast } from "@/presentation/components/ui/toast";

export interface AccountItem {
  id: string;
  name: string;
  institution: string;
  accountType: string;
  currency: string;
  notes: string | null;
  createdAt: Date;
}

interface AccountsTableProps {
  accounts: AccountItem[];
}

export function AccountsTable({ accounts }: AccountsTableProps) {
  const [editingAccount, setEditingAccount] = useState<AccountItem | null>(null);
  const [editAccountType, setEditAccountType] = useState("broker");
  const [editCurrency, setEditCurrency] = useState("IDR");

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toast = useToast();

  function startEditing(acc: AccountItem) {
    setEditingAccount(acc);
    setEditAccountType(acc.accountType || "broker");
    setEditCurrency(acc.currency || "IDR");
    setError(null);
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingAccount) return;
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("accountType", editAccountType);
    formData.set("currency", editCurrency);

    const result = await updateAccountAction(editingAccount.id, formData);

    if (result.success) {
      setIsSubmitting(false);
      setEditingAccount(null);
      toast.success("Perubahan akun berhasil disimpan!", "Data akun telah diperbarui di database.");
    } else {
      setError(result.error || "Gagal memperbarui akun");
      toast.error("Gagal memperbarui akun", result.error);
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    const result = await deleteAccountAction(id);
    setDeletingId(null);
    setConfirmDeleteId(null);

    if (result.success) {
      toast.success("Akun berhasil dihapus!", "Akun finansial telah dihapus dari database.");
    } else {
      toast.error("Gagal menghapus akun", result.error);
    }
  }

  if (accounts.length === 0) {
    return (
      <div className="rounded-2xl border border-[#E4E8EF] bg-white p-12 text-center shadow-card">
        <Building2 className="h-8 w-8 text-[#94A3B8] mx-auto mb-3" strokeWidth={1.5} />
        <h3 className="text-base font-bold text-[#1E293B]">Belum Ada Akun Finansial</h3>
        <p className="text-xs text-[#64748B] max-w-md mx-auto mt-1 mb-6 leading-relaxed">
          Tambahkan rekening sekuritas (Stockbit, IPOT, dll), bank, atau platform investasi Anda untuk mulai mengelola aset.
        </p>
        <div className="flex justify-center">
          <AccountDialog />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl border border-[#E4E8EF] bg-white shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E4E8EF] bg-[#F8FAFC] text-[#64748B] font-semibold uppercase tracking-wider text-xs">
                <th className="py-3.5 px-4">Nama Akun & Portofolio</th>
                <th className="py-3.5 px-4">Institusi / Broker</th>
                <th className="py-3.5 px-4">Tipe Akun</th>
                <th className="py-3.5 px-4 text-center">Mata Uang</th>
                <th className="py-3.5 px-4">Catatan</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E8EF] text-[#1E293B]">
              {accounts.map((acc) => (
                <tr key={acc.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-[#1E293B] text-sm block">{acc.name}</span>
                    <span className="text-xs text-[#94A3B8] font-mono">{acc.id}</span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-[#1E293B]">{acc.institution}</td>
                  <td className="py-3.5 px-4 text-[#64748B]">
                    {acc.accountType === "broker"
                      ? "Sekuritas Saham"
                      : acc.accountType === "mutual_fund_platform"
                      ? "Platform Reksa Dana"
                      : acc.accountType === "gold_platform"
                      ? "Platform Emas"
                      : acc.accountType === "bank"
                      ? "Rekening Bank"
                      : acc.accountType === "e_wallet"
                      ? "Dompet Digital"
                      : acc.accountType}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-semibold text-[#1E293B]">
                    {acc.currency}
                  </td>
                  <td className="py-3.5 px-4 text-[#64748B] max-w-[200px] truncate">
                    {acc.notes || "-"}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {confirmDeleteId === acc.id ? (
                        <div className="flex items-center gap-1 animate-in fade-in duration-100">
                          <button
                            disabled={deletingId === acc.id}
                            onClick={() => handleDelete(acc.id)}
                            className="rounded bg-red-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-red-700"
                          >
                            {deletingId === acc.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              "Hapus"
                            )}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="rounded bg-slate-200 px-2 py-1 text-xs text-slate-700 hover:bg-slate-300"
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => startEditing(acc)}
                            title="Edit Akun"
                            className="p-1.5 rounded-lg text-[#64748B] hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(acc.id)}
                            title="Hapus Akun"
                            className="p-1.5 rounded-lg text-[#64748B] hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Account Modal */}
      {editingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl sm:max-w-2xl rounded-2xl border border-[#E4E8EF] bg-white p-6 sm:p-7 shadow-xl animate-in fade-in zoom-in-95 duration-150 my-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#E4E8EF]">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <h3 className="text-base font-bold text-[#1E293B]">Edit Akun Finansial</h3>
              </div>
              <button
                onClick={() => setEditingAccount(null)}
                className="rounded-lg p-1 text-[#94A3B8] hover:bg-slate-100 hover:text-[#1E293B]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleUpdate} className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Nama Akun / Portofolio
                </label>
                <Input
                  name="name"
                  defaultValue={editingAccount.name}
                  required
                  className="h-10 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Institusi / Broker
                </label>
                <Input
                  name="institution"
                  defaultValue={editingAccount.institution}
                  required
                  className="h-10 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Tipe Platform
                  </label>
                  <Select value={editAccountType} onValueChange={setEditAccountType}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Pilih tipe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="broker">Sekuritas Saham</SelectItem>
                      <SelectItem value="mutual_fund_platform">Platform Reksa Dana</SelectItem>
                      <SelectItem value="gold_platform">Platform Emas</SelectItem>
                      <SelectItem value="bank">Rekening Bank</SelectItem>
                      <SelectItem value="e_wallet">Dompet Digital</SelectItem>
                      <SelectItem value="manual">Penyimpanan Fisik / Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Mata Uang
                  </label>
                  <Select value={editCurrency} onValueChange={setEditCurrency}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Pilih mata uang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IDR">IDR (Rupiah)</SelectItem>
                      <SelectItem value="USD">USD (US Dollar)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Catatan
                </label>
                <Input
                  name="notes"
                  defaultValue={editingAccount.notes || ""}
                  className="h-10 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E4E8EF]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingAccount(null)}
                  disabled={isSubmitting}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Perubahan"
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
