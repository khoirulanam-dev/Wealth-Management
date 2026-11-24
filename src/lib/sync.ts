import { revalidatePath } from "next/cache";
import { db } from "@/infrastructure/db/client";
import { users } from "@/infrastructure/db/schema/users";
import { eq } from "drizzle-orm";

/**
 * Updates the user's updatedAt timestamp in Neon PostgreSQL to trigger
 * real-time cross-device synchronization (e.g. mobile phone -> laptop)
 * without requiring the user to manually refresh their browser.
 */
export async function touchUserSync(userId: string): Promise<void> {
  if (!userId) return;
  try {
    await db
      .update(users)
      .set({ updatedAt: new Date() })
      .where(eq(users.id, userId));
  } catch (err) {
    console.error("Failed to touch sync timestamp:", err);
  }
}

/**
 * Convenience helper to touch the sync timestamp and revalidate affected paths.
 */
export async function syncAndRevalidate(userId: string, paths: string[] = []): Promise<void> {
  await touchUserSync(userId);
  for (const p of paths) {
    revalidatePath(p);
  }
}
