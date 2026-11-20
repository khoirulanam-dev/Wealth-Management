"use server";

import { requireAuth } from "@/lib/auth";
import { AccountsService } from "@/application/use-cases/portfolio/accounts-service";
import { InstrumentsService } from "@/application/use-cases/portfolio/instruments-service";
import { TransactionsService } from "@/application/use-cases/portfolio/transactions-service";
import { revalidatePath } from "next/cache";

export async function createAccountAction(formData: FormData) {
  const session = await requireAuth();
  const name = formData.get("name") as string;
  const institution = formData.get("institution") as string;
  const accountType = (formData.get("accountType") as string) || "broker";
  const currency = (formData.get("currency") as string) || "IDR";
  const notes = formData.get("notes") as string;

  try {
    const account = await AccountsService.createAccount(session.userId, {
      name,
      institution,
      accountType,
      currency,
      notes,
    });
    revalidatePath("/investments");
    revalidatePath("/transactions");
    revalidatePath("/overview");
    return { success: true, account };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal membuat akun finansial";
    return { success: false, error: message };
  }
}

export async function createInstrumentAction(formData: FormData) {
  const session = await requireAuth();
  const name = formData.get("name") as string;
  const symbol = formData.get("symbol") as string;
  const assetType = (formData.get("assetType") as string) || "stock";
  const market = (formData.get("market") as string) || "IDX";
  const currency = (formData.get("currency") as string) || "IDR";
  const unit = formData.get("unit") as string;

  try {
    const instrument = await InstrumentsService.createInstrument(session.userId, {
      name,
      symbol,
      assetType,
      market,
      currency,
      unit,
    });
    revalidatePath("/investments");
    revalidatePath("/transactions");
    return { success: true, instrument };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal menambahkan instrumen";
    return { success: false, error: message };
  }
}

export async function previewTransactionAction(
  instrumentId: string,
  accountId: string,
  type: string,
  quantity: string,
  unitPrice: string
) {
  const session = await requireAuth();
  try {
    return await TransactionsService.previewTransaction(
      session.userId,
      instrumentId,
      accountId,
      type,
      quantity,
      unitPrice
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal memproses kalkulasi preview";
    return { isValid: false, error: message };
  }
}

export async function recordTransactionAction(formData: FormData) {
  const session = await requireAuth();
  const instrumentId = formData.get("instrumentId") as string;
  const accountId = formData.get("accountId") as string;
  const type = formData.get("type") as string;
  const tradeDate = formData.get("tradeDate") as string;
  const quantity = formData.get("quantity") as string;
  const unitPrice = formData.get("unitPrice") as string;
  const note = formData.get("note") as string;

  try {
    const tx = await TransactionsService.recordTransaction(session.userId, {
      instrumentId,
      accountId,
      type,
      tradeDate: tradeDate ? new Date(tradeDate) : new Date(),
      quantity,
      unitPrice,
      note,
      status: "posted",
    });

    revalidatePath("/investments");
    revalidatePath("/transactions");
    revalidatePath("/overview");
    return { success: true, transaction: tx };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal mencatat transaksi";
    return { success: false, error: message };
  }
}

export async function voidTransactionAction(transactionId: string) {
  const session = await requireAuth();
  try {
    await TransactionsService.voidTransaction(session.userId, transactionId);
    revalidatePath("/investments");
    revalidatePath("/transactions");
    revalidatePath("/overview");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal membatalkan transaksi";
    return { success: false, error: message };
  }
}

export async function updateAccountAction(accountId: string, formData: FormData) {
  const session = await requireAuth();
  const name = formData.get("name") as string;
  const institution = formData.get("institution") as string;
  const accountType = formData.get("accountType") as string;
  const currency = formData.get("currency") as string;
  const notes = formData.get("notes") as string;

  try {
    await AccountsService.updateAccount(session.userId, accountId, {
      name,
      institution,
      accountType,
      currency,
      notes,
    });
    revalidatePath("/investments");
    revalidatePath("/transactions");
    revalidatePath("/overview");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal memperbarui akun";
    return { success: false, error: message };
  }
}

export async function deleteAccountAction(accountId: string) {
  const session = await requireAuth();
  try {
    await AccountsService.deleteAccount(session.userId, accountId);
    revalidatePath("/investments");
    revalidatePath("/transactions");
    revalidatePath("/overview");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal menghapus akun";
    return { success: false, error: message };
  }
}

export async function updateInstrumentAction(instrumentId: string, formData: FormData) {
  const session = await requireAuth();
  const name = formData.get("name") as string;
  const symbol = formData.get("symbol") as string;
  const assetType = formData.get("assetType") as string;
  const market = formData.get("market") as string;
  const unit = formData.get("unit") as string;

  try {
    await InstrumentsService.updateInstrument(session.userId, instrumentId, {
      name,
      symbol,
      assetType,
      market,
      unit,
    });
    revalidatePath("/investments");
    revalidatePath("/transactions");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal memperbarui instrumen";
    return { success: false, error: message };
  }
}

export async function deleteInstrumentAction(instrumentId: string) {
  const session = await requireAuth();
  try {
    await InstrumentsService.deleteInstrument(session.userId, instrumentId);
    revalidatePath("/investments");
    revalidatePath("/transactions");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal menghapus instrumen";
    return { success: false, error: message };
  }
}
