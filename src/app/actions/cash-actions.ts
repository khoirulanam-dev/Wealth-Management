"use server";

import { requireAuth } from "@/lib/auth";
import { CashService } from "@/application/use-cases/cash/cash-service";
import { revalidatePath } from "next/cache";

export async function createCashAccountAction(formData: FormData) {
  const session = await requireAuth();
  const name = formData.get("name") as string;
  const institution = formData.get("institution") as string;
  const accountType = (formData.get("accountType") as string) || "bank";
  const openingBalance = formData.get("openingBalance") as string;
  const openingBalanceDate = formData.get("openingBalanceDate") as string;
  const isEmergencyFund = formData.get("isEmergencyFund") === "true";
  const emergencyFundTarget = formData.get("emergencyFundTarget") as string;
  const currency = (formData.get("currency") as string) || "IDR";
  const notes = formData.get("notes") as string;

  try {
    const result = await CashService.createCashAccount(session.userId, {
      name,
      institution,
      accountType,
      openingBalance,
      openingBalanceDate,
      isEmergencyFund,
      emergencyFundTarget: emergencyFundTarget ? emergencyFundTarget : null,
      currency,
      notes,
    });
    revalidatePath("/cash");
    revalidatePath("/overview");
    return { success: true, ...result };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal membuat rekening kas";
    return { success: false, error: message };
  }
}

export async function recordCashMovementAction(formData: FormData) {
  const session = await requireAuth();
  const cashAccountId = formData.get("cashAccountId") as string;
  const type = formData.get("type") as "deposit" | "withdrawal";
  const amount = formData.get("amount") as string;
  const movementDate = formData.get("movementDate") as string;
  const note = formData.get("note") as string;

  try {
    const result = await CashService.recordMovement(session.userId, {
      cashAccountId,
      type,
      amount,
      movementDate,
      note,
    });
    revalidatePath("/cash");
    revalidatePath("/overview");
    return { success: true, ...result };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal mencatat mutasi kas";
    return { success: false, error: message };
  }
}

export async function recordInternalTransferAction(formData: FormData) {
  const session = await requireAuth();
  const fromCashAccountId = formData.get("fromCashAccountId") as string;
  const toCashAccountId = formData.get("toCashAccountId") as string;
  const amount = formData.get("amount") as string;
  const transferDate = formData.get("transferDate") as string;
  const note = formData.get("note") as string;

  try {
    const result = await CashService.recordInternalTransfer(session.userId, {
      fromCashAccountId,
      toCashAccountId,
      amount,
      transferDate,
      note,
    });
    revalidatePath("/cash");
    revalidatePath("/overview");
    return { success: true, ...result };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal melakukan transfer internal";
    return { success: false, error: message };
  }
}

export async function reconcileCashAccountAction(formData: FormData) {
  const session = await requireAuth();
  const cashAccountId = formData.get("cashAccountId") as string;
  const observedBalance = formData.get("observedBalance") as string;
  const reconcileDate = formData.get("reconcileDate") as string;
  const reason = formData.get("reason") as string;

  try {
    const result = await CashService.reconcileBalance(session.userId, {
      cashAccountId,
      observedBalance,
      reconcileDate,
      reason,
    });
    revalidatePath("/cash");
    revalidatePath("/overview");
    return { success: true, ...result };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal melakukan rekonsiliasi saldo";
    return { success: false, error: message };
  }
}

