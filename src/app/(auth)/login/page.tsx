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
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm border-border shadow-lg">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl font-bold tracking-tight">WEALTH OS</CardTitle>
          <CardDescription className="text-xs">
            Private Personal Wealth & Investment Terminal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
          <div className="mt-6 border-t border-border pt-4 text-center">
            <p className="text-[11px] text-muted-foreground">
              Single-user private system. Public registration is permanently disabled.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
