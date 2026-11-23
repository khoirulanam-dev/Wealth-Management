"use server";

import { requireAuth } from "@/lib/auth";
import { WatchlistService } from "@/application/use-cases/portfolio/watchlist-service";
import { revalidatePath } from "next/cache";

export async function addToWatchlistAction(formData: FormData) {
  const session = await requireAuth();

  const symbol = (formData.get("symbol") as string) || "";
  const name = (formData.get("name") as string) || "";
  const assetType = (formData.get("assetType") as string) || "stock";
  const market = (formData.get("market") as string) || "IDX";
  const currency = (formData.get("currency") as string) || "IDR";
  const note = formData.get("note") as string;

  try {
    const result = await WatchlistService.addToWatchlist(session.userId, {
      symbol,
      name: name || symbol,
      assetType,
      market,
      currency,
      note,
    });

    revalidatePath("/watchlist");
    return { success: true, ...result };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal menambahkan ke daftar pantauan";
    return { success: false, error: message };
  }
}

export async function removeFromWatchlistAction(formData: FormData) {
  const session = await requireAuth();
  const watchlistItemId = formData.get("watchlistItemId") as string;

  try {
    await WatchlistService.removeFromWatchlist(session.userId, watchlistItemId);
    revalidatePath("/watchlist");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal menghapus dari daftar pantauan";
    return { success: false, error: message };
  }
}

export async function refreshWatchlistQuotesAction() {
  const session = await requireAuth();

  try {
    const result = await WatchlistService.refreshWatchlistQuotes(session.userId);
    revalidatePath("/watchlist");
    return { success: true, ...result };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal memperbarui kuotasi pantauan";
    return { success: false, error: message };
  }
}
