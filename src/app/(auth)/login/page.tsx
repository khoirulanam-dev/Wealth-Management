import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
import { LoginForm } from "@/presentation/components/auth/login-form";

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    redirect("/overview");
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#F0F4F8]">
      {/* Left Aside (Adminator Signature Gradient Panel) */}
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-12 text-white">
        {/* Glow ambient background circles */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 border border-white/25 backdrop-blur-md shadow-sm font-black text-lg text-white">
            W
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight">WEALTH OS</span>
            <span className="block text-xs uppercase tracking-wider text-blue-200 font-mono">Private Edition</span>
          </div>
        </div>

        {/* Body Hero Copy */}
        <div className="relative z-10 max-w-lg space-y-6">
          <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold tracking-wider text-blue-200 uppercase">
            <Sparkles className="h-3.5 w-3.5 text-blue-300" />
            2026 · PRIVATE WEALTH COCKPIT
          </span>
          <h1 className="text-3xl xl:text-4xl font-bold tracking-tight leading-tight">
            The wealth tracker built for absolute financial precision.
          </h1>
          <p className="text-base text-blue-100/90 leading-relaxed">
            Konsolidasi portofolio investasi, perhitungan weighted-average cost, saldo kas likuid, dan jadwal kewajiban dalam satu sistem privat terproteksi.
          </p>

          {/* Testimonial / Architecture Highlight Box */}
          <div className="rounded-xl border border-white/20 bg-white/10 p-5 backdrop-blur-md text-sm text-blue-50 leading-relaxed shadow-sm">
            <p className="italic">
              &ldquo;Menggabungkan seluruh akun sekuritas, rekening bank, dan liabilitas ke dalam satu kokpit bersih tanpa kompromi pada privasi data.&rdquo;
            </p>
            
          </div>
        </div>

        {/* Aside Footer */}
        <div className="relative z-10 flex items-center justify-between text-xs text-blue-200/80 font-mono">
          <span>© 2026 WEALTH OS</span>
        </div>
      </aside>

      {/* Right Main (Adminator Modern Sign In Form) */}
      <main className="flex flex-col justify-between p-6 sm:p-12 lg:p-16">
        <div className="flex items-center justify-between text-xs text-[#64748B]">
        </div>

        <div className="mx-auto w-full max-w-md my-auto">
          <div className="rounded-2xl border border-[#E4E8EF] bg-white p-8 sm:p-10 shadow-card">
            <div className="space-y-2 mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-[#1E293B]">Selamat Datang</h2>
              <p className="text-sm text-[#64748B]">
                Masuk ke kokpit WEALTH OS untuk mengelola catatan kekayaan bersih Anda.
              </p>
            </div>

            <LoginForm />
          </div>
        </div>
      </main>
    </div>
  );
}
