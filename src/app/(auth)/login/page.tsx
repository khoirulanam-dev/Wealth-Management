import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/presentation/components/ui/card";
import { LoginForm } from "@/presentation/components/auth/login-form";

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    redirect("/overview");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-md border-border shadow-md">
        <CardHeader className="space-y-2 text-center pb-6 pt-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">WEALTH OS</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Personal Investment & Wealth Management
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-8 sm:px-8">
          <LoginForm />
          <div className="mt-6 border-t border-border pt-4 text-center">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Sistem privat terproteksi. Akses dibatasi khusus pemilik akun.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
