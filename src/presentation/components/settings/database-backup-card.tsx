"use client";

import { useState } from "react";
import { Database, ShieldCheck, Trash2, RotateCcw, Plus, Loader2 } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { useToast } from "@/presentation/components/ui/toast";
import { createDatabaseBackupAction, restoreDatabaseBackupAction, deleteDatabaseBackupAction } from "@/app/actions/backup-actions";

export interface DatabaseBackupItem {
  id: string;
  name: string;
  scope: string;
  checksum: string;
  recordCounts: unknown;
  createdAt: Date | string;
}

interface DatabaseBackupCardProps {
  initialBackups: DatabaseBackupItem[];
}

export function DatabaseBackupCard({ initialBackups }: DatabaseBackupCardProps) {
  const [backups, setBackups] = useState<DatabaseBackupItem[]>(initialBackups);
  const [isCreating, setIsCreating] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  async function handleCreateBackup() {
    setIsCreating(true);
    try {
      const res = await createDatabaseBackupAction();
      if (res.success && res.backup) {
        toast.success("Cadangan baru berhasil disimpan di database!");
        setBackups((prev) => [
          {
            id: res.backup.backupId,
            name: res.backup.name,
            scope: "all",
            checksum: res.backup.checksum,
            recordCounts: res.backup.recordCounts,
            createdAt: res.backup.createdAt,
          },
          ...prev,
        ]);
      } else {
        toast.error(res.error || "Gagal membuat cadangan database");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan saat membuat cadangan");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleRestore(backupId: string, name: string) {
    if (!window.confirm(`Apakah Anda yakin ingin memulihkan data dari cadangan "${name}"? Tindakan ini akan memperbarui status database saat ini.`)) {
      return;
    }

    setRestoringId(backupId);
    try {
      const res = await restoreDatabaseBackupAction(backupId);
      if (res.success) {
        toast.success(`Berhasil memulihkan cadangan "${name}"!`);
      } else {
        toast.error(res.error || "Gagal memulihkan cadangan");
      }
    } catch {
      toast.error("Terjadi kesalahan saat memulihkan database");
    } finally {
      setRestoringId(null);
    }
  }

  async function handleDelete(backupId: string) {
    if (!window.confirm("Hapus catatan cadangan ini dari database?")) return;

    setDeletingId(backupId);
    try {
      const res = await deleteDatabaseBackupAction(backupId);
      if (res.success) {
        toast.success("Catatan cadangan berhasil dihapus");
        setBackups((prev) => prev.filter((b) => b.id !== backupId));
      } else {
        toast.error(res.error || "Gagal menghapus cadangan");
      }
    } catch {
      toast.error("Terjadi kesalahan saat menghapus cadangan");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="rounded-2xl border border-[#E4E8EF] bg-white p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#EEF1F5]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 shrink-0">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1E293B]">Cadangan Sistem di Database</h2>
            <p className="text-xs text-[#64748B]">
              Disimpan aman 100% di tabel database Neon PostgreSQL (tanpa file fisik di proyek).
            </p>
          </div>
        </div>
        <Button
          type="button"
          onClick={handleCreateBackup}
          disabled={isCreating}
          size="sm"
          className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white shrink-0 shadow-xs"
        >
          {isCreating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Buat Cadangan Baru
            </>
          )}
        </Button>
      </div>

      <div className="mt-5 space-y-3">
        {backups.length === 0 ? (
          <div className="py-8 text-center border border-dashed border-slate-200 rounded-xl bg-[#F8FAFC]">
            <Database className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-[#1E293B]">Belum ada cadangan di database</p>
            <p className="text-[11px] text-[#64748B] mt-0.5">
              Klik &quot;Buat Cadangan Baru&quot; untuk menyimpan snapshot penuh seluruh tabel.
            </p>
          </div>
        ) : (
          backups.map((item) => {
            const dateStr = new Date(item.createdAt).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
            const counts = item.recordCounts as Record<string, number> | undefined;
            const totalEntities = counts ? Object.values(counts).reduce((a, b) => a + b, 0) : 0;

            return (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-[#EEF1F5] hover:border-slate-300 bg-[#F8FAFC] transition-colors"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-[#1E293B] truncate">{item.name}</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200/60">
                      <ShieldCheck className="h-3 w-3" />
                      SHA-256 Valid
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-[#64748B] flex-wrap">
                    <span>{dateStr}</span>
                    <span>•</span>
                    <span>{totalEntities} entitas data tersimpan</span>
                    <span>•</span>
                    <span className="font-mono text-[10px] text-slate-400">
                      Hash: {item.checksum.slice(0, 12)}...
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={restoringId === item.id || deletingId === item.id}
                    onClick={() => handleRestore(item.id, item.name)}
                    className="h-8 gap-1.5 border-[#E4E8EF] bg-white text-xs font-medium text-[#1E293B] hover:bg-slate-50"
                  >
                    {restoringId === item.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
                    ) : (
                      <RotateCcw className="h-3.5 w-3.5 text-blue-600" />
                    )}
                    <span>Pulihkan</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={restoringId === item.id || deletingId === item.id}
                    onClick={() => handleDelete(item.id)}
                    className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    title="Hapus cadangan"
                  >
                    {deletingId === item.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
