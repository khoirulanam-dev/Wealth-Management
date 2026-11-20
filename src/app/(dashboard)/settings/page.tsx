import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/presentation/components/ui/card";
import { Badge } from "@/presentation/components/ui/badge";
import { ShieldCheck, Database } from "lucide-react";
import { env } from "@/lib/env";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">System Settings</h2>
        <p className="text-xs text-muted-foreground">
          Private terminal configuration, database connection, and security parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Environment & Security Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <CardTitle className="text-sm font-semibold">Access & Security</CardTitle>
            </div>
            <CardDescription className="text-xs">Private single-user terminal boundary</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground">Authentication Mode</span>
              <Badge variant="outline">Private Single-User</Badge>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground">Public Registration</span>
              <Badge variant="destructive">Disabled</Badge>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground">Owner Account</span>
              <span className="font-mono font-medium">{env.APP_USER_EMAIL}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Reporting Currency</span>
              <Badge variant="default" className="font-mono">{env.DEFAULT_CURRENCY}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Database & Infrastructure */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-indigo-600" />
              <CardTitle className="text-sm font-semibold">Database Infrastructure</CardTitle>
            </div>
            <CardDescription className="text-xs">Serverless PostgreSQL integration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground">Database Engine</span>
              <span className="font-medium">Neon PostgreSQL</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground">ORM</span>
              <span className="font-medium">Drizzle ORM (drizzle-kit)</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground">Connection Mode</span>
              <Badge variant="outline">Serverless Connection Pooler</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Deployment Target</span>
              <Badge variant="secondary">Vercel</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
