import { db } from "@/infrastructure/db/client";
import { financialAccounts, NewFinancialAccount } from "@/infrastructure/db/schema";
import { eq, and, desc } from "drizzle-orm";

export interface CreateAccountDTO {
  name: string;
  institution: string;
  accountType: string;
  currency?: string;
  notes?: string;
}

export class AccountsService {
  static async listAccounts(userId: string) {
    return db
      .select()
      .from(financialAccounts)
      .where(and(eq(financialAccounts.userId, userId), eq(financialAccounts.isActive, true)))
      .orderBy(desc(financialAccounts.createdAt));
  }

  static async getAccountById(userId: string, id: string) {
    const [account] = await db
      .select()
      .from(financialAccounts)
      .where(and(eq(financialAccounts.id, id), eq(financialAccounts.userId, userId)))
      .limit(1);
    return account || null;
  }

  static async createAccount(userId: string, dto: CreateAccountDTO) {
    if (!dto.name.trim()) {
      throw new Error("Nama akun wajib diisi");
    }
    if (!dto.institution.trim()) {
      throw new Error("Nama institusi/broker wajib diisi");
    }

    const id = `acc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newAccount: NewFinancialAccount = {
      id,
      userId,
      name: dto.name.trim(),
      institution: dto.institution.trim(),
      accountType: dto.accountType || "broker",
      currency: dto.currency || "IDR",
      notes: dto.notes?.trim() || null,
      isActive: true,
    };

    await db.insert(financialAccounts).values(newAccount);
    return newAccount;
  }

  static async updateAccount(userId: string, id: string, dto: Partial<CreateAccountDTO>) {
    if (dto.name !== undefined && !dto.name.trim()) {
      throw new Error("Nama akun tidak boleh kosong");
    }
    if (dto.institution !== undefined && !dto.institution.trim()) {
      throw new Error("Nama institusi tidak boleh kosong");
    }

    await db
      .update(financialAccounts)
      .set({
        ...(dto.name ? { name: dto.name.trim() } : {}),
        ...(dto.institution ? { institution: dto.institution.trim() } : {}),
        ...(dto.accountType ? { accountType: dto.accountType } : {}),
        ...(dto.currency ? { currency: dto.currency } : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes?.trim() || null } : {}),
        updatedAt: new Date(),
      })
      .where(and(eq(financialAccounts.id, id), eq(financialAccounts.userId, userId)));
  }

  static async deleteAccount(userId: string, id: string) {
    // Delete account from database
    await db
      .delete(financialAccounts)
      .where(and(eq(financialAccounts.id, id), eq(financialAccounts.userId, userId)));
  }
}
