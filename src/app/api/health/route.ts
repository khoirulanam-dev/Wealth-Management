import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { db } from "@/infrastructure/db/client";
import { sql } from "drizzle-orm";

export async function GET() {
  let dbStatus = "connected";
  try {
    await db.execute(sql`SELECT 1`);
  } catch (err: unknown) {
    dbStatus = "disconnected";
    console.error("Health check database probe failed:", err);
    return NextResponse.json(
      {
        status: "degraded",
        database: dbStatus,
        app: "WEALTH OS",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }

  return NextResponse.json({
    status: "healthy",
    database: dbStatus,
    app: "WEALTH OS",
    version: "1.0.0",
    environment: env.NODE_ENV,
    reportingCurrency: env.DEFAULT_CURRENCY,
    timestamp: new Date().toISOString(),
  });
}
