import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/presentation/components/ui/card";
import { EmptyState } from "@/presentation/components/ui/empty-state";
import { TrendingUp } from "lucide-react";

export default function InvestmentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Investments & Holdings</h2>
        <p className="text-xs text-muted-foreground">
          Track owned stocks, mutual funds, gold, deposits, bonds, and custom investment instruments.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Holdings Portfolio</CardTitle>
          <CardDescription className="text-xs">Weighted average cost and market valuation engine</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={TrendingUp}
            title="No Investment Holdings Recorded"
            description="The source-of-truth investment ledger and weighted-average cost engine will be fully active in Milestone 2."
          />
        </CardContent>
      </Card>
    </div>
  );
}

