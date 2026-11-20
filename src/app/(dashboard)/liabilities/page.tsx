import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/presentation/components/ui/card";
import { EmptyState } from "@/presentation/components/ui/empty-state";
import { CreditCard } from "lucide-react";

export default function LiabilitiesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Liabilities & Debts</h2>
        <p className="text-xs text-muted-foreground">
          Manage PayLater, credit cards, installments, and loans with actual payment tracking.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Outstanding Debt Registry</CardTitle>
          <CardDescription className="text-xs">Installment schedules and payment reduction rules</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={CreditCard}
            title="No Outstanding Liabilities"
            description="Liability schedule planning and payment tracking modules will be implemented in Milestone 4."
          />
        </CardContent>
      </Card>
    </div>
  );
}

