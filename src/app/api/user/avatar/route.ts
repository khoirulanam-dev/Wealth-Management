import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/infrastructure/db/client";
import { users } from "@/infrastructure/db/schema/users";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await getSession();
  const searchParams = request.nextUrl.searchParams;
  const targetUserId = searchParams.get("userId") || session?.userId;

  if (!targetUserId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const [user] = await db
    .select({ avatarUrl: users.avatarUrl })
    .from(users)
    .where(eq(users.id, targetUserId))
    .limit(1);

  if (!user || !user.avatarUrl) {
    return new NextResponse("Avatar not found", { status: 404 });
  }

  // If avatarUrl is stored as Base64 Data URL in PostgreSQL
  if (user.avatarUrl.startsWith("data:image/")) {
    const matches = user.avatarUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
    if (matches) {
      const mimeType = matches[1];
      const buffer = Buffer.from(matches[2], "base64");
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": mimeType,
          "Cache-Control": "private, max-age=86400, stale-while-revalidate=604800",
        },
      });
    }
  }

  // If already an absolute URL
  return NextResponse.redirect(new URL(user.avatarUrl, request.url));
}

