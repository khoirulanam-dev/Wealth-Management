"use server";

import { requireAuth } from "@/lib/auth";
import { LiabilityService } from "@/application/use-cases/liabilities/liability-service";
import { revalidatePath } from "next/cache";

export async function createLiabilityAction(formData: FormData) {
  const session = await requireAuth();

  const name = formData.get("name") as string;
  const type = (formData.get("type") as string) || "paylater";
  const creditor = formData.get("creditor") as string;
  const originalAmount = formData.get("originalAmount") as string;
  const outstandingBalance = formData.get("outstandingBalance") as string;
  const currency = (formData.get("currency") as string) || "IDR";
  const startDate = formData.get("startDate") as string;
  const dueDate = formData.get("dueDate") as string;
  const installmentAmount = formData.get("installmentAmount") as string;
  const installmentFrequency = (formData.get("installmentFrequency") as string) || "monthly";
  const installmentCount = formData.get("installmentCount") as string;
  const note = formData.get("note") as string;

  try {
    const result = await LiabilityService.createLiability(session.userId, {
      name,
      type,
      creditor,
      originalAmount,
      outstandingBalance: outstandingBalance || undefined,
      currency,
      startDate: startDate || new Date(),
      dueDate: dueDate || undefined,
      installmentAmount: installmentAmount || undefined,
      installmentFrequency,
      installmentCount: installmentCount ? parseInt(installmentCount, 10) : undefined,
      note,
    });

    revalidatePath("/liabilities");
    revalidatePath("/overview");
    return { success: true, ...result };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal menyimpan liabilitas";
    return { success: false, error: message };
  }
}

export async function recordLiabilityPaymentAction(formData: FormData) {
  const session = await requireAuth();

  const liabilityId = formData.get("liabilityId") as string;
  const amount = formData.get("amount") as string;
  const paymentDate = formData.get("paymentDate") as string;
  const installmentNumber = formData.get("installmentNumber") as string;
  const fromCashAccountId = formData.get("fromCashAccountId") as string;
  const note = formData.get("note") as string;

  try {
    const result = await LiabilityService.recordPayment(session.userId, {
      liabilityId,
      amount,
      paymentDate: paymentDate || new Date(),
      installmentNumber: installmentNumber ? parseInt(installmentNumber, 10) : undefined,
      fromCashAccountId: fromCashAccountId || undefined,
      note,
    });

    revalidatePath("/liabilities");
    revalidatePath("/cash");
    revalidatePath("/overview");
    return { success: true, ...result };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal mencatat pembayaran liabilitas";
    return { success: false, error: message };
  }
}

export async function deleteLiabilityAction(formData: FormData) {
  const session = await requireAuth();
  const liabilityId = formData.get("liabilityId") as string;

  try {
    await LiabilityService.deleteLiability(session.userId, liabilityId);
    revalidatePath("/liabilities");
    revalidatePath("/overview");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal menghapus liabilitas";
    return { success: false, error: message };
  }
}

