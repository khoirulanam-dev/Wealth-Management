import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/presentation/components/ui/card";
import { Badge } from "@/presentation/components/ui/badge";
import { EmptyState } from "@/presentation/components/ui/empty-state";
import { TrendingUp, Wallet, CreditCard, PiggyBank } from "lucide-react";
import { formatCurrency } from "@/lib/decimal";

export default function OverviewPage() {
  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Page Title & Period Filter */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Financial Overview</h2>
          <p className="text-xs text-muted-foreground">Consolidated balance of financial assets, cash, liabilities, and net worth.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="h-7 text-xs">As of Today</Badge>
          <Badge variant="secondary" className="h-7 text-xs font-mono">Manual Quote Mode</Badge>
        </div>
      </div>

      {/* Dominant Net Worth Hero Metric */}
      <div className="rounded-xl border border-border bg-gradient-to-br from-card to-muted/30 p-6 shadow-sm">
        <div className="flex flex-col space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Net Worth</span>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-extrabold tracking-tight tabular-nums text-foreground">
              {formatCurrency(0, "IDR")}
            </span>
            <Badge variant="outline" className="text-xs font-mono">IDR</Badge>
          </div>
          <p className="text-xs text-muted-foreground pt-1">
            Calculated as: Total Financial Assets (Investments + Cash) minus Total Outstanding Liabilities.
          </p>
        </div>
      </div>

      {/* Supporting Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Investments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Investments Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold tabular-nums">{formatCurrency(0, "IDR")}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Stocks, Funds, Gold, Deposits</p>
          </CardContent>
        </Card>

        {/* Cash & Savings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Cash & Liquid Balances</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold tabular-nums">{formatCurrency(0, "IDR")}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Bank, E-wallets, Emergency fund</p>
          </CardContent>
        </Card>

        {/* Total Liabilities */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total Liabilities</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold tabular-nums text-foreground">{formatCurrency(0, "IDR")}</div>
            <p className="text-[11px] text-muted-foreground mt-1">PayLater, Loans, Installments</p>
          </CardContent>
        </Card>

        {/* Received Income */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Actual Received Income</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold tabular-nums">{formatCurrency(0, "IDR")}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Dividends, coupons, distributions</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analysis Empty Shell */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Net Worth Trend Chart Placeholder */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Net Worth History</CardTitle>
            <CardDescription className="text-xs">Immutable historical snapshot timeline</CardDescription>
          </CardHeader>
          <CardContent>
            <EmptyState
              title="No Historical Snapshots Yet"
              description="Capture your first daily snapshot or record transactions in Milestone 2 to track net worth progression over time."
            />
          </CardContent>
        </Card>

        {/* Asset Allocation Donut Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Asset Allocation</CardTitle>
            <CardDescription className="text-xs">Distribution by financial category</CardDescription>
          </CardHeader>
          <CardContent>
            <EmptyState
              title="No Assets Recorded"
              description="Asset distribution by category will appear once opening positions or transactions are posted."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
