import { db } from "@/infrastructure/db/client";
import { instruments, NewInstrument } from "@/infrastructure/db/schema";
import { eq, and, desc } from "drizzle-orm";

export interface CreateInstrumentDTO {
  name: string;
  symbol?: string;
  assetType: string; // stock, mutual_fund, gold, deposit, bond, other_investment
  market?: string;
  currency?: string;
  unit?: string; // share, unit, gram, nominal
}

export class InstrumentsService {
  static async listInstruments(userId: string) {
    return db
      .select()
      .from(instruments)
      .where(and(eq(instruments.userId, userId), eq(instruments.isActive, true)))
      .orderBy(desc(instruments.createdAt));
  }

  static async getInstrumentById(userId: string, id: string) {
    const [instrument] = await db
      .select()
      .from(instruments)
      .where(and(eq(instruments.id, id), eq(instruments.userId, userId)))
      .limit(1);
    return instrument || null;
  }

  static async createInstrument(userId: string, dto: CreateInstrumentDTO) {
    if (!dto.name.trim()) {
      throw new Error("Nama instrumen wajib diisi");
    }

    const id = `inst_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const symbol = dto.symbol?.trim().toUpperCase() || null;

    // Default units based on assetType
    let defaultUnit = "share";
    if (dto.assetType === "gold") defaultUnit = "gram";
    else if (dto.assetType === "mutual_fund") defaultUnit = "unit";
    else if (dto.assetType === "deposit" || dto.assetType === "bond") defaultUnit = "nominal";

    const newInstrument: NewInstrument = {
      id,
      userId,
      name: dto.name.trim(),
      symbol,
      assetType: dto.assetType || "stock",
      market: dto.market?.trim().toUpperCase() || "IDX",
      currency: dto.currency || "IDR",
      unit: dto.unit || defaultUnit,
      isActive: true,
    };

    await db.insert(instruments).values(newInstrument);
    return newInstrument;
  }
}
