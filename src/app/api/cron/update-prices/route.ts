import { NextResponse } from "next/server";
import { db } from "@/infrastructure/db/client";
import { users } from "@/infrastructure/db/schema";
import { MarketDataSyncService } from "@/application/use-cases/portfolio/market-data-sync-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // Optional verification if CRON_SECRET is configured
    if (cronSecret && authHeader !== `Bearer ${cronSecret}` && searchParams.get("key") !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized cron trigger" }, { status: 401 });
    }

    // Get all users
    const allUsers = await db.select({ id: users.id, email: users.email }).from(users);

    const results = [];
    for (const u of allUsers) {
      const res = await MarketDataSyncService.syncPortfolioQuotes(u.id);
      results.push({ userId: u.id, email: u.email, updatedCount: res.updatedCount });
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      userCount: allUsers.length,
      details: results,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error during cron price update";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

