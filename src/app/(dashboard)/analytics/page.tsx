import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/presentation/components/ui/card";
import { EmptyState } from "@/presentation/components/ui/empty-state";
import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Analytics & Reports</h2>
        <p className="text-xs text-muted-foreground">
          Historical net worth curves, asset allocation breakdown, and performance analytics.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Portfolio Intelligence</CardTitle>
          <CardDescription className="text-xs">Capital contributions versus true market gain distinction</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={BarChart3}
            title="Analytics Engine Inactive"
            description="Advanced snapshot reporting, allocation donuts, and visual report exports are scheduled for Milestone 7 & 8."
          />
        </CardContent>
      </Card>
    </div>
  );
}

