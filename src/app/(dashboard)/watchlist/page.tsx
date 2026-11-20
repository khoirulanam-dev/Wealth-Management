import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/presentation/components/ui/card";
import { EmptyState } from "@/presentation/components/ui/empty-state";
import { Eye } from "lucide-react";

export default function WatchlistPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Watchlist</h2>
        <p className="text-xs text-muted-foreground">
          Monitor interesting stocks and funds. Watchlist items are strictly excluded from net worth.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Monitored Assets</CardTitle>
          <CardDescription className="text-xs">Price quotes without affecting owned portfolio balance</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Eye}
            title="Watchlist is Empty"
            description="Add instruments you wish to monitor in Milestone 5 without impacting your actual holdings."
          />
        </CardContent>
      </Card>
    </div>
  );
}

