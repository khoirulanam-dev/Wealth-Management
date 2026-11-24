"use server";

import { requireAuth } from "@/lib/auth";
import { IncomeService } from "@/application/use-cases/income/income-service";
import { revalidatePath } from "next/cache";
import { touchUserSync } from "@/lib/sync";

export async function createIncomeAction(formData: FormData) {
  const session = await requireAuth();

  const instrumentId = (formData.get("instrumentId") as string) || null;
  const accountId = (formData.get("accountId") as string) || null;
  const type = (formData.get("type") as string) || "dividend";
  const status = (formData.get("status") as string) || "received";
  const announcementDate = formData.get("announcementDate") as string;
  const exDate = formData.get("exDate") as string;
  const paymentDate = (formData.get("paymentDate") as string) || new Date();
  const expectedAmount = formData.get("expectedAmount") as string;
  const actualAmount = formData.get("actualAmount") as string;
  const currency = (formData.get("currency") as string) || "IDR";
  const note = formData.get("note") as string;
  const depositToCashAccountId = formData.get("depositToCashAccountId") as string;

  try {
    const result = await IncomeService.createIncome(session.userId, {
      instrumentId,
      accountId,
      type,
      status,
      announcementDate: announcementDate || null,
      exDate: exDate || null,
      paymentDate,
      expectedAmount: expectedAmount || null,
      actualAmount: actualAmount || null,
      currency,
      note,
      depositToCashAccountId: depositToCashAccountId && depositToCashAccountId !== "none" ? depositToCashAccountId : null,
    });

    revalidatePath("/income");
    revalidatePath("/cash");
    revalidatePath("/overview");
    await touchUserSync(session.userId);
    return { success: true, ...result };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal mencatat pendapatan";
    return { success: false, error: message };
  }
}

export async function markIncomeReceivedAction(formData: FormData) {
  const session = await requireAuth();
  const incomeId = formData.get("incomeId") as string;
  const actualAmount = formData.get("actualAmount") as string;
  const depositToCashAccountId = formData.get("depositToCashAccountId") as string;

  try {
    const result = await IncomeService.markAsReceived(
      session.userId,
      incomeId,
      actualAmount,
      depositToCashAccountId && depositToCashAccountId !== "none" ? depositToCashAccountId : null
    );

    revalidatePath("/income");
    revalidatePath("/cash");
    revalidatePath("/overview");
    await touchUserSync(session.userId);
    return result;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal merealisasikan pendapatan";
    return { success: false, error: message };
  }
}

export async function deleteIncomeAction(formData: FormData) {
  const session = await requireAuth();
  const incomeId = formData.get("incomeId") as string;

  try {
    await IncomeService.deleteIncome(session.userId, incomeId);
    revalidatePath("/income");
    revalidatePath("/overview");
    await touchUserSync(session.userId);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal menghapus catatan pendapatan";
    return { success: false, error: message };
  }
}

