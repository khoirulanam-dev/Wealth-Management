import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/presentation/components/ui/card";
import { EmptyState } from "@/presentation/components/ui/empty-state";
import { RefreshCw } from "lucide-react";

export default function MarketDataPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Market Data Center</h2>
        <p className="text-xs text-muted-foreground">
          User-triggered manual quote refresh, source timestamps, and manual price overrides.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Valuation & Quotes</CardTitle>
          <CardDescription className="text-xs">Manual quote entry and provider adapter hub</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={RefreshCw}
            title="No Active Quotes Configured"
            description="Market data refresh orchestration and immutable price histories will be active in Milestone 5."
          />
        </CardContent>
      </Card>
    </div>
  );
}

