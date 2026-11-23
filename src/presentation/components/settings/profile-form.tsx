"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  User,
  Camera,
  Trash2,
  Mail,
  Coins,
  ShieldCheck,
  Loader2,
  Save,
  KeyRound,
} from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { useToast } from "@/presentation/components/ui/toast";
import { updateProfileAction } from "@/app/actions/auth-actions";

interface ProfileFormProps {
  initialUser: {
    id: string;
    email: string;
    name?: string | null;
    avatarUrl?: string | null;
    reportingCurrency: string;
  };
}

export function ProfileForm({ initialUser }: ProfileFormProps) {
  const [name, setName] = useState(initialUser.name || "");
  const [email, setEmail] = useState(initialUser.email || "");
  const [currency, setCurrency] = useState(initialUser.reportingCurrency || "IDR");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialUser.avatarUrl || null);
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const displayName = name || (email ? email.split("@")[0] : "Investor");
  const initialLetter = displayName.charAt(0).toUpperCase();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file gambar maksimal 5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Format berkas harus berupa gambar (PNG, JPG, WEBP)");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAvatarPreview(result);
      setAvatarDataUrl(result);
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveAvatar() {
    setAvatarPreview(null);
    setAvatarDataUrl(""); // Empty string signals removal to server action
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email) {
      toast.error("Alamat email wajib diisi");
      return;
    }

    if (newPassword && newPassword.length < 6) {
      toast.error("Kata sandi baru minimal 6 karakter");
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      toast.error("Konfirmasi kata sandi tidak cocok");
      return;
    }

    setIsSaving(true);
    const res = await updateProfileAction({
      name,
      email,
      reportingCurrency: currency,
      newPassword: newPassword || undefined,
      avatarDataUrl,
    });

    if (res.success) {
      toast.success(res.message || "Profil berhasil diperbarui!");
      setNewPassword("");
      setConfirmPassword("");
      setAvatarDataUrl(undefined);
    } else {
      toast.error(res.error || "Gagal memperbarui profil");
    }
    setIsSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Card */}
      <div className="adm-card p-6 sm:p-8 space-y-8">
        {/* Section 1: Avatar Upload Banner */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-[#EEF1F5]">
          <div className="relative group shrink-0">
            {avatarPreview ? (
              <Image
                src={avatarPreview}
                alt={displayName}
                width={96}
                height={96}
                unoptimized
                className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-md ring-2 ring-blue-500/30"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white flex items-center justify-center font-bold text-3xl shadow-md border-4 border-white ring-2 ring-blue-500/20">
                {initialLetter}
              </div>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md transition-transform active:scale-90"
              title="Ganti Foto Profil"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-2 text-center sm:text-left flex-1">
            <h3 className="text-base font-bold text-[#1E293B]">Foto Profil</h3>
            <p className="text-xs text-[#64748B] max-w-md leading-relaxed">
              Unggah foto profil Anda. Format yang didukung: PNG, JPG, atau WEBP (maksimal 5MB).
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="h-8 gap-1.5 text-xs font-semibold text-slate-700 border-slate-200 hover:bg-slate-50"
              >
                <Camera className="h-3.5 w-3.5 text-blue-600" />
                <span>Pilih Foto Baru</span>
              </Button>

              {avatarPreview && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveAvatar}
                  className="h-8 gap-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Hapus Foto</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Personal Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#94A3B8]">
            <User className="h-3.5 w-3.5 text-blue-600" />
            <span>Informasi Pribadi</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nama Lengkap */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1E293B] block">
                Nama Lengkap / Nama Tampilan
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Khoirul Anam"
                className="w-full h-10 px-3 rounded-xl border border-[#E4E8EF] text-sm text-[#1E293B] focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1E293B] flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                <span>Alamat Email</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full h-10 px-3 rounded-xl border border-[#E4E8EF] text-sm text-[#1E293B] focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white font-mono"
              />
            </div>

            {/* Mata Uang Pelaporan */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-[#1E293B] flex items-center gap-1.5">
                <Coins className="h-3.5 w-3.5 text-slate-400" />
                <span>Mata Uang Pelaporan Utama</span>
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#E4E8EF] text-sm text-[#1E293B] focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
              >
                <option value="IDR">IDR — Rupiah Indonesia (Rp)</option>
                <option value="USD">USD — US Dollar ($)</option>
                <option value="SGD">SGD — Singapore Dollar (S$)</option>
                <option value="EUR">EUR — Euro (€)</option>
              </select>
              <p className="text-[11px] text-[#94A3B8]">
                Semua nilai konsolidasi portofolio, kas, dan utang akan ditampilkan dalam mata uang ini.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Keamanan & Kata Sandi */}
        <div className="space-y-4 pt-4 border-t border-[#EEF1F5]">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#94A3B8]">
            <KeyRound className="h-3.5 w-3.5 text-blue-600" />
            <span>Keamanan Akun (Ganti Password)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Password Baru */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1E293B] block">
                Kata Sandi Baru (Opsional)
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full h-10 px-3 rounded-xl border border-[#E4E8EF] text-sm text-[#1E293B] focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
              />
            </div>

            {/* Konfirmasi Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1E293B] block">
                Konfirmasi Kata Sandi Baru
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi kata sandi baru"
                className="w-full h-10 px-3 rounded-xl border border-[#E4E8EF] text-sm text-[#1E293B] focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
              />
            </div>
          </div>
          <p className="text-[11px] text-[#94A3B8]">
            Biarkan kosong jika Anda tidak berencana mengubah kata sandi saat ini.
          </p>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-[#EEF1F5] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium">
            <ShieldCheck className="h-4 w-4" />
            <span>Boundary Otentikasi Privat Terenkripsi</span>
          </div>

          <Button
            type="submit"
            disabled={isSaving}
            className="h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs gap-2 rounded-xl shadow-xs"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Simpan Perubahan</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
