import { requireAuth } from "@/lib/auth";
import { db } from "@/infrastructure/db/client";
import { users } from "@/infrastructure/db/schema/users";
import { eq } from "drizzle-orm";
import { ProfileForm } from "@/presentation/components/settings/profile-form";
import { UserCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await requireAuth();

  // Fetch latest user details from Neon PostgreSQL
  const [currentUser] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      avatarUrl: users.avatarUrl,
      reportingCurrency: users.reportingCurrency,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  const userData = currentUser || {
    id: session.userId,
    email: session.email,
    name: session.name || null,
    avatarUrl: session.avatarUrl || null,
    reportingCurrency: session.reportingCurrency || "IDR",
    createdAt: new Date(),
  };

  const formattedDate = userData.createdAt
    ? new Date(userData.createdAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "-";

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E4E8EF]">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 block mb-0.5">
            PENGATURAN AKUN &amp; PROFIL
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[#1E293B]">
            Profil Pengguna
          </h1>
          <p className="text-sm text-[#64748B]">
            Kelola nama profil, foto akun, preferensi mata uang pelaporan, dan keamanan akses Anda.
          </p>
        </div>
      </div>

      {/* Main Profile Form */}
      <ProfileForm initialUser={userData} />

      {/* Account Status & Security Card */}
      <div className="adm-card p-5 bg-[#F8FAFC]/80 border border-[#E4E8EF] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B]">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <UserCheck className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="font-bold text-[#1E293B] flex items-center gap-1.5">
              <span>Status Akun: Aktif</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </div>
            <div className="text-[11px] text-[#94A3B8] font-mono">
              ID: {userData.id} · Terdaftar sejak {formattedDate}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
