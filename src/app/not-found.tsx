import Link from "next/link";
import { Button } from "@/presentation/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <h2 className="text-3xl font-bold tracking-tight text-foreground">404</h2>
      <p className="mt-2 text-sm text-muted-foreground">Halaman tidak ditemukan.</p>
      <Link href="/overview" className="mt-6">
        <Button size="sm">Kembali ke Overview</Button>
      </Link>
    </div>
  );
}

