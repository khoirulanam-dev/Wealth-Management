import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/presentation/components/ui/card";
import { EmptyState } from "@/presentation/components/ui/empty-state";
import { Wallet } from "lucide-react";

export default function CashPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Cash & Liquid Savings</h2>
        <p className="text-xs text-muted-foreground">
          Monitor bank balances, e-wallets, physical cash, and designated emergency funds.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Liquid Accounts & Balances</CardTitle>
          <CardDescription className="text-xs">Paired transfers, movements, and reconciliation ledger</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Wallet}
            title="No Cash Accounts Configured"
            description="Cash balance management, paired internal transfers, and reconciliation workflows are scheduled for Milestone 3."
          />
        </CardContent>
      </Card>
    </div>
  );
}

