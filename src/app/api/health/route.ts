import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    app: "WEALTH OS",
    version: "1.0.0",
    environment: env.NODE_ENV,
    reportingCurrency: env.DEFAULT_CURRENCY,
    timestamp: new Date().toISOString(),
  });
}

