"use server";

import { requireAuth } from "@/lib/auth";
import { SnapshotService } from "@/application/use-cases/analytics/snapshot-service";
import { revalidatePath } from "next/cache";

export async function captureSnapshotAction() {
  const session = await requireAuth();

  try {
    const snapshot = await SnapshotService.captureSnapshot(session.userId);
    revalidatePath("/overview");
    revalidatePath("/analytics");
    return { success: true, data: snapshot };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal mengambil snapshot harian";
    return { success: false, error: message };
  }
}

export async function getSnapshotsAction(range = "all") {
  const session = await requireAuth();

  try {
    const data = await SnapshotService.listSnapshots(session.userId, range);
    return { success: true, data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal mengambil data historis";
    return { success: false, error: message };
  }
}

export async function getAnalyticsAction() {
  const session = await requireAuth();

  try {
    const data = await SnapshotService.getAnalytics(session.userId);
    return { success: true, data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal memuat analitik";
    return { success: false, error: message };
  }
}

