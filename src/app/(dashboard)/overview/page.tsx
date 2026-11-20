import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/presentation/components/ui/card";
import { Badge } from "@/presentation/components/ui/badge";
import { EmptyState } from "@/presentation/components/ui/empty-state";
import { TrendingUp, Wallet, CreditCard, PiggyBank } from "lucide-react";
import { formatCurrency } from "@/lib/decimal";

export default function OverviewPage() {
  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Page Title & Status */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Ringkasan Portofolio</h2>
          <p className="text-sm text-muted-foreground">Konsolidasi total aset investasi, kas, liabilitas, dan kekayaan bersih.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="h-7 text-xs font-medium">Hari Ini</Badge>
          <Badge variant="secondary" className="h-7 text-xs font-mono">Mode Manual</Badge>
        </div>
      </div>

      {/* Dominant Net Worth Hero Metric */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Kekayaan Bersih (Net Worth)</span>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-extrabold tracking-tight tabular-nums text-foreground">
              {formatCurrency(0, "IDR")}
            </span>
            <Badge variant="outline" className="text-xs font-mono font-bold">IDR</Badge>
          </div>
          <p className="text-xs text-muted-foreground pt-1">
            Total Aset Finansial (Investasi + Kas) dikurangi Total Liabilitas / Kewajiban.
          </p>
        </div>
      </div>

      {/* Supporting Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Investments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Nilai Investasi</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold tabular-nums">{formatCurrency(0, "IDR")}</div>
            <p className="text-xs text-muted-foreground mt-1">Saham, Reksa Dana, Emas, Obligasi</p>
          </CardContent>
        </Card>

        {/* Cash & Savings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Kas & Simpanan</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold tabular-nums">{formatCurrency(0, "IDR")}</div>
            <p className="text-xs text-muted-foreground mt-1">Rekening Bank, E-wallet, Dana Darurat</p>
          </CardContent>
        </Card>

        {/* Total Liabilities */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total Liabilitas</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold tabular-nums text-foreground">{formatCurrency(0, "IDR")}</div>
            <p className="text-xs text-muted-foreground mt-1">PayLater, Kartu Kredit, Pinjaman</p>
          </CardContent>
        </Card>

        {/* Received Income */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Pendapatan Diterima</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold tabular-nums">{formatCurrency(0, "IDR")}</div>
            <p className="text-xs text-muted-foreground mt-1">Dividen, Kupon Obligasi, Bagi Hasil</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analysis Empty Shell */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Net Worth Trend Chart Placeholder */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Riwayat Kekayaan Bersih</CardTitle>
            <CardDescription className="text-xs">Timeline snapshot historis immutable</CardDescription>
          </CardHeader>
          <CardContent>
            <EmptyState
              title="Belum Ada Snapshot Historis"
              description="Catat transaksi portofolio pada Milestone 2 untuk mulai memantau tren perkembangan kekayaan bersih dari waktu ke waktu."
            />
          </CardContent>
        </Card>

        {/* Asset Allocation Donut Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Alokasi Aset</CardTitle>
            <CardDescription className="text-xs">Distribusi berdasarkan kategori instrumen</CardDescription>
          </CardHeader>
          <CardContent>
            <EmptyState
              title="Belum Ada Aset Terdaftar"
              description="Diagram distribusi portofolio akan muncul setelah posisi awal atau transaksi pertama dicatat."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
