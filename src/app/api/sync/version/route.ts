import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/infrastructure/db/client";
import { users } from "@/infrastructure/db/schema/users";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [user] = await db
      .select({ updatedAt: users.updatedAt })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    const version = user?.updatedAt ? new Date(user.updatedAt).getTime() : 0;

    return NextResponse.json(
      { version },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (err) {
    console.error("Error fetching sync version:", err);
    return NextResponse.json({ error: "Failed to fetch version" }, { status: 500 });
  }
}
