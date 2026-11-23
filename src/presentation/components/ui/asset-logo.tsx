"use client";

import { useState } from "react";
import { Coins, Gem, Landmark, Building2, TrendingUp } from "lucide-react";

interface AssetLogoProps {
  symbol?: string | null;
  name?: string | null;
  assetType?: string | null;
  market?: string | null;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

export function AssetLogo({
  symbol,
  name,
  assetType,
  market,
  size = "md",
  className = "",
}: AssetLogoProps) {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    xs: "h-6 w-6 text-[10px] rounded-md",
    sm: "h-7 w-7 text-xs rounded-md",
    md: "h-8 w-8 text-xs rounded-lg",
    lg: "h-10 w-10 text-sm rounded-xl",
  }[size];

  const iconSizes = {
    xs: "h-3 w-3",
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }[size];

  const rawSym = (symbol || "").trim().toUpperCase();
  const cleanSym = rawSym.replace(/\.JK$/i, "").replace(/-USD$/i, "").trim();
  const normalizedMarket = (market || "").trim().toUpperCase();
  const combinedText = `${cleanSym} ${(name || "")}`.toLowerCase();

  // Detect asset categories
  const isCrypto =
    assetType === "crypto" ||
    rawSym.endsWith("-USD") ||
    normalizedMarket === "CRYPTO" ||
    ["BTC", "ETH", "SOL", "USDT", "USDC", "BNB", "XRP", "DOGE", "ADA", "AVAX", "DOT"].includes(cleanSym);

  const isGold =
    assetType === "gold" ||
    cleanSym === "ANTAM" ||
    cleanSym === "XAU" ||
    combinedText.includes("emas") ||
    combinedText.includes("antam") ||
    combinedText.includes("logam mulia");

  const isBond =
    assetType === "bond" ||
    /^(ORI|SR|SBR|FR|PBS|INDON)\d+/i.test(cleanSym) ||
    combinedText.includes("sbn") ||
    combinedText.includes("obligasi");

  const isMutualFund =
    assetType === "mutual_fund" ||
    combinedText.includes("reksa dana") ||
    combinedText.includes("rdpu") ||
    combinedText.includes("rdpt");

  // Determine potential logo URL
  let logoUrl: string | null = null;

  if (isCrypto && cleanSym) {
    logoUrl = `https://assets.coincap.io/assets/icons/${cleanSym.toLowerCase()}@2x.png`;
  } else if (isGold) {
    logoUrl = `https://assets.stockbit.com/logos/companies/ANTM.png`;
  } else if (cleanSym && /^[A-Z]{4}$/.test(cleanSym) && normalizedMarket !== "US" && normalizedMarket !== "NASDAQ" && normalizedMarket !== "NYSE") {
    // Indonesian IDX stocks (4-letter tickers: BBCA, PTBA, MPMX, DMAS, TLKM, GOTO, etc.)
    logoUrl = `https://assets.stockbit.com/logos/companies/${cleanSym}.png`;
  } else if (
    cleanSym &&
    (normalizedMarket === "US" || normalizedMarket === "NASDAQ" || normalizedMarket === "NYSE")
  ) {
    // US or global stocks
    logoUrl = `https://financialmodelingprep.com/image-stock/${cleanSym}.png`;
  } else if (
    combinedText.includes("bca")
  ) {
    logoUrl = `https://assets.stockbit.com/logos/companies/BBCA.png`;
  } else if (combinedText.includes("mandiri")) {
    logoUrl = `https://assets.stockbit.com/logos/companies/BMRI.png`;
  } else if (combinedText.includes("bri") || combinedText.includes("danareksa")) {
    logoUrl = `https://assets.stockbit.com/logos/companies/BBRI.png`;
  } else if (combinedText.includes("bni")) {
    logoUrl = `https://assets.stockbit.com/logos/companies/BBNI.png`;
  } else if (combinedText.includes("cimb") || combinedText.includes("niaga")) {
    logoUrl = `https://assets.stockbit.com/logos/companies/BNGA.png`;
  } else if (combinedText.includes("danamon")) {
    logoUrl = `https://assets.stockbit.com/logos/companies/BDMN.png`;
  } else if (combinedText.includes("permata")) {
    logoUrl = `https://assets.stockbit.com/logos/companies/BNLI.png`;
  } else if (combinedText.includes("jago") || combinedText.includes("arto")) {
    logoUrl = `https://assets.stockbit.com/logos/companies/ARTO.png`;
  } else if (combinedText.includes("jenius") || combinedText.includes("btpn")) {
    logoUrl = `https://assets.stockbit.com/logos/companies/BTPN.png`;
  } else if (combinedText.includes("panin")) {
    logoUrl = `https://assets.stockbit.com/logos/companies/PANS.png`;
  } else if (combinedText.includes("trimegah") || combinedText.includes("sucor")) {
    logoUrl = `https://assets.stockbit.com/logos/companies/TRIM.png`;
  } else if (combinedText.includes("gopay") || combinedText.includes("gojek") || combinedText.includes("goto")) {
    logoUrl = `https://assets.stockbit.com/logos/companies/GOTO.png`;
  } else if (combinedText.includes("shopee") || combinedText.includes("spaylater")) {
    logoUrl = `https://financialmodelingprep.com/image-stock/SE.png`;
  } else if (cleanSym && /^[A-Z]{1,5}$/.test(cleanSym)) {
    // Fallback: try FMP for US symbol
    logoUrl = `https://financialmodelingprep.com/image-stock/${cleanSym}.png`;
  }

  // Fallback badge text
  const fallbackInitials = cleanSym
    ? cleanSym.slice(0, 3)
    : (name || "ID").trim().slice(0, 2).toUpperCase();

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 overflow-hidden bg-white border border-[#E4E8EF] shadow-sm ${sizeClasses} ${className}`}
      title={name || symbol || undefined}
    >
      {logoUrl && !hasError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt={cleanSym || name || "Logo"}
          onError={() => setHasError(true)}
          className="h-full w-full object-contain p-0.5"
          loading="lazy"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-slate-50 font-bold font-mono text-[#475569] select-none">
          {isCrypto ? (
            <Coins className={`${iconSizes} text-amber-500`} />
          ) : isGold ? (
            <Gem className={`${iconSizes} text-yellow-500`} />
          ) : isBond ? (
            <Landmark className={`${iconSizes} text-blue-600`} />
          ) : isMutualFund ? (
            <TrendingUp className={`${iconSizes} text-emerald-600`} />
          ) : cleanSym ? (
            <span className="text-[11px] tracking-tight">{fallbackInitials}</span>
          ) : (
            <Building2 className={`${iconSizes} text-[#94A3B8]`} />
          )}
        </div>
      )}
    </div>
  );
}
