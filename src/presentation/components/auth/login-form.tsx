"use client";

import { useState } from "react";
import { Mail, Lock, ArrowRight, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { loginAction } from "@/app/actions/auth-actions";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const result = await loginAction(formData);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Email Field with Adminator Icon Prefix */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]" htmlFor="email">
          Email Akun
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#94A3B8]">
            <Mail className="h-4 w-4" />
          </span>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="nama@email.com"
            required
            disabled={isLoading}
            className="pl-10 h-11 rounded-lg border-[#E4E8EF] bg-white text-sm focus-visible:ring-blue-600 focus-visible:border-blue-600"
          />
        </div>
      </div>

      {/* Password Field with Adminator Icon Prefix */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]" htmlFor="password">
            Password
          </label>
        </div>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#94A3B8]">
            <Lock className="h-4 w-4" />
          </span>
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••••••"
            required
            disabled={isLoading}
            className="pl-10 pr-10 h-11 rounded-lg border-[#E4E8EF] bg-white text-sm focus-visible:ring-blue-600 focus-visible:border-blue-600"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            tabIndex={-1}
            aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#94A3B8] hover:text-[#1E293B] focus:outline-hidden transition-colors"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Keep me signed in checkbox */}
      <div className="flex items-center gap-2 pt-1">
        <input
          id="remember"
          type="checkbox"
          defaultChecked
          className="h-4 w-4 rounded border-[#E4E8EF] text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="remember" className="text-xs text-[#64748B] select-none cursor-pointer">
          Ingat sesi saya di perangkat ini
        </label>
      </div>

      {/* Adminator Primary Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full gap-2 h-11 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition-all mt-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Memverifikasi...
          </>
        ) : (
          <>
            Login
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
}
