"use client";

import { useState } from "react";
import { Lock, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { loginAction } from "@/app/actions/auth-actions";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground" htmlFor="email">
          Account Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="owner@wealthos.local"
          defaultValue="owner@wealthos.local"
          required
          disabled={isLoading}
          className="h-9"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground" htmlFor="password">
          Security Passphrase
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••••••"
          required
          disabled={isLoading}
          className="h-9"
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full gap-2 mt-2 h-9 text-xs font-semibold">
        {isLoading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Verifying...
          </>
        ) : (
          <>
            <Lock className="h-3.5 w-3.5" />
            Unlock Terminal
          </>
        )}
      </Button>
    </form>
  );
}

