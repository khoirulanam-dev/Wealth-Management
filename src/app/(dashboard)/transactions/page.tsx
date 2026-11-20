import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/presentation/components/ui/card";
import { EmptyState } from "@/presentation/components/ui/empty-state";
import { History } from "lucide-react";

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Transaction Feed & Audit</h2>
        <p className="text-xs text-muted-foreground">
          Chronological record of all posted financial activities with immutable audit trails.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Activity Ledger</CardTitle>
          <CardDescription className="text-xs">Unified transaction filter and reversal management</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={History}
            title="No Transactions Logged"
            description="All posted buys, sales, deposits, withdrawals, and payments will appear in this unified feed."
          />
        </CardContent>
      </Card>
    </div>
  );
}

