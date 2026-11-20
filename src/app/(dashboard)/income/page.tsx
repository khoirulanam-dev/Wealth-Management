import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/presentation/components/ui/card";
import { EmptyState } from "@/presentation/components/ui/empty-state";
import { PiggyBank } from "lucide-react";

export default function IncomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Dividend & Passive Income</h2>
        <p className="text-xs text-muted-foreground">
          Track received dividends, coupons, distributions, and forecast earnings separately.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Income Stream & Calendar</CardTitle>
          <CardDescription className="text-xs">Strict separation of received cash vs forecast expectations</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={PiggyBank}
            title="No Income Recorded"
            description="Dividend recording, yield on cost analysis, and dividend calendar are scheduled for Milestone 6."
          />
        </CardContent>
      </Card>
    </div>
  );
}

