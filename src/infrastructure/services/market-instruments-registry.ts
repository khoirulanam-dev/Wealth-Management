/**
 * Curated Comprehensive Offline Registry for Instant Search (0ms latency).
 * Covers top actively traded Indonesian Stocks (IDX), Mutual Funds, Bonds, Crypto, and Global Equities.
 */

export interface StaticInstrument {
  symbol: string;
  cleanSymbol: string;
  name: string;
  exchange: string;
  assetType: "stock" | "crypto" | "gold" | "mutual_fund" | "bond";
  currency: string;
  sector?: string;
}

export const INSTANT_REGISTRY: StaticInstrument[] = [
  // --- INDONESIAN STOCKS (IDX) ---
  // Banking & Financials
  { symbol: "BBCA.JK", cleanSymbol: "BBCA", name: "Bank Central Asia Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Financials" },
  { symbol: "BBRI.JK", cleanSymbol: "BBRI", name: "Bank Rakyat Indonesia (Persero) Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Financials" },
  { symbol: "BMRI.JK", cleanSymbol: "BMRI", name: "Bank Mandiri (Persero) Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Financials" },
  { symbol: "BBNI.JK", cleanSymbol: "BBNI", name: "Bank Negara Indonesia (Persero) Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Financials" },
  { symbol: "BRIS.JK", cleanSymbol: "BRIS", name: "Bank Syariah Indonesia Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Financials" },
  { symbol: "BBTN.JK", cleanSymbol: "BBTN", name: "Bank Tabungan Negara (Persero) Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Financials" },
  { symbol: "BDMN.JK", cleanSymbol: "BDMN", name: "Bank Danamon Indonesia Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Financials" },
  { symbol: "BNGA.JK", cleanSymbol: "BNGA", name: "Bank CIMB Niaga Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Financials" },
  { symbol: "ARTO.JK", cleanSymbol: "ARTO", name: "Bank Jago Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Financials" },
  { symbol: "PNBN.JK", cleanSymbol: "PNBN", name: "Bank Pan Indonesia Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Financials" },
  { symbol: "BJBR.JK", cleanSymbol: "BJBR", name: "Bank Pembangunan Daerah Jawa Barat dan Banten Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Financials" },
  { symbol: "BJTM.JK", cleanSymbol: "BJTM", name: "Bank Pembangunan Daerah Jawa Timur Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Financials" },
  { symbol: "BFIN.JK", cleanSymbol: "BFIN", name: "BFI Finance Indonesia Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Financials" },

  // Property, Real Estate & Industrial Estates
  { symbol: "DMAS.JK", cleanSymbol: "DMAS", name: "PT Puradelta Lestari Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Real Estate" },
  { symbol: "BSDE.JK", cleanSymbol: "BSDE", name: "Bumi Serpong Damai Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Real Estate" },
  { symbol: "CTRA.JK", cleanSymbol: "CTRA", name: "Ciputra Development Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Real Estate" },
  { symbol: "PWON.JK", cleanSymbol: "PWON", name: "Pakuwon Jati Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Real Estate" },
  { symbol: "SMRA.JK", cleanSymbol: "SMRA", name: "Summarecon Agung Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Real Estate" },
  { symbol: "ASRI.JK", cleanSymbol: "ASRI", name: "Alam Sutera Realty Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Real Estate" },
  { symbol: "PANI.JK", cleanSymbol: "PANI", name: "Pantai Indah Kapuk Dua Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Real Estate" },
  { symbol: "SSIA.JK", cleanSymbol: "SSIA", name: "Surya Semesta Internusa Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Real Estate" },
  { symbol: "BEST.JK", cleanSymbol: "BEST", name: "Bekasi Fajar Industrial Estate Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Real Estate" },
  { symbol: "KIJA.JK", cleanSymbol: "KIJA", name: "Kawasan Industri Jababeka Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Real Estate" },
  { symbol: "DILD.JK", cleanSymbol: "DILD", name: "Intiland Development Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Real Estate" },

  // Energy, Oil, Gas & Coal
  { symbol: "ADRO.JK", cleanSymbol: "ADRO", name: "Adaro Energy Indonesia Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Energy" },
  { symbol: "PTBA.JK", cleanSymbol: "PTBA", name: "Bukit Asam Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Energy" },
  { symbol: "PGAS.JK", cleanSymbol: "PGAS", name: "Perusahaan Gas Negara Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Energy" },
  { symbol: "ITMG.JK", cleanSymbol: "ITMG", name: "Indo Tambangraya Megah Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Energy" },
  { symbol: "MEDC.JK", cleanSymbol: "MEDC", name: "Medco Energi Internasional Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Energy" },
  { symbol: "BUMI.JK", cleanSymbol: "BUMI", name: "Bumi Resources Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Energy" },
  { symbol: "INDY.JK", cleanSymbol: "INDY", name: "Indika Energy Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Energy" },
  { symbol: "HRUM.JK", cleanSymbol: "HRUM", name: "Harum Energy Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Energy" },
  { symbol: "AKRA.JK", cleanSymbol: "AKRA", name: "AKR Corporindo Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Energy" },
  { symbol: "ENRG.JK", cleanSymbol: "ENRG", name: "Energi Mega Persada Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Energy" },
  { symbol: "ESSA.JK", cleanSymbol: "ESSA", name: "Essenza Industries Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Energy" },
  { symbol: "PTRO.JK", cleanSymbol: "PTRO", name: "Petrosea Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Energy" },
  { symbol: "CUAN.JK", cleanSymbol: "CUAN", name: "Petrindo Jaya Kreasi Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Energy" },
  { symbol: "BREN.JK", cleanSymbol: "BREN", name: "Barito Renewables Energy Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Utilities" },

  // Metals, Mining & Minerals
  { symbol: "ANTM.JK", cleanSymbol: "ANTM", name: "Aneka Tambang Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Basic Materials" },
  { symbol: "MDKA.JK", cleanSymbol: "MDKA", name: "Merdeka Copper Gold Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Basic Materials" },
  { symbol: "INCO.JK", cleanSymbol: "INCO", name: "Vale Indonesia Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Basic Materials" },
  { symbol: "TINS.JK", cleanSymbol: "TINS", name: "Timah Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Basic Materials" },
  { symbol: "AMMN.JK", cleanSymbol: "AMMN", name: "Amman Mineral Internasional Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Basic Materials" },
  { symbol: "MBMA.JK", cleanSymbol: "MBMA", name: "Merdeka Battery Materials Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Basic Materials" },
  { symbol: "BRMS.JK", cleanSymbol: "BRMS", name: "Bumi Resources Minerals Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Basic Materials" },

  // Consumer Non-Cyclicals & Healthcare
  { symbol: "ICBP.JK", cleanSymbol: "ICBP", name: "Indofood CBP Sukses Makmur Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Consumer" },
  { symbol: "INDF.JK", cleanSymbol: "INDF", name: "Indofood Sukses Makmur Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Consumer" },
  { symbol: "UNVR.JK", cleanSymbol: "UNVR", name: "Unilever Indonesia Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Consumer" },
  { symbol: "MYOR.JK", cleanSymbol: "MYOR", name: "Mayora Indah Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Consumer" },
  { symbol: "CMRY.JK", cleanSymbol: "CMRY", name: "Cisarua Mountain Dairy Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Consumer" },
  { symbol: "CPIN.JK", cleanSymbol: "CPIN", name: "Charoen Pokphand Indonesia Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Consumer" },
  { symbol: "JPFA.JK", cleanSymbol: "JPFA", name: "JAPFA Comfeed Indonesia Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Consumer" },
  { symbol: "SIDO.JK", cleanSymbol: "SIDO", name: "Industri Jamu dan Farmasi Sido Muncul Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Healthcare" },
  { symbol: "KLBF.JK", cleanSymbol: "KLBF", name: "Kalbe Farma Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Healthcare" },
  { symbol: "MIKA.JK", cleanSymbol: "MIKA", name: "Mitra Keluarga Karyasehat Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Healthcare" },
  { symbol: "HEAL.JK", cleanSymbol: "HEAL", name: "Medikaloka Hermina Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Healthcare" },
  { symbol: "SILO.JK", cleanSymbol: "SILO", name: "Siloam International Hospitals Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Healthcare" },

  // Consumer Cyclicals, Retail & Auto
  { symbol: "ASII.JK", cleanSymbol: "ASII", name: "Astra International Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Industrials" },
  { symbol: "ACES.JK", cleanSymbol: "ACES", name: "Aspirasi Hidup Indonesia Tbk (Ace Hardware)", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Retail" },
  { symbol: "MAPI.JK", cleanSymbol: "MAPI", name: "Mitra Adiperkasa Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Retail" },
  { symbol: "MAPA.JK", cleanSymbol: "MAPA", name: "MAP Aktif Adiperkasa Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Retail" },
  { symbol: "ERAA.JK", cleanSymbol: "ERAA", name: "Erajaya Swasembada Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Retail" },
  { symbol: "AMRT.JK", cleanSymbol: "AMRT", name: "Sumber Alfaria Trijaya Tbk (Alfamart)", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Retail" },
  { symbol: "MIDI.JK", cleanSymbol: "MIDI", name: "Midi Utama Indonesia Tbk (Alfamidi)", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Retail" },
  { symbol: "AUTO.JK", cleanSymbol: "AUTO", name: "Astra Otoparts Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Industrials" },
  { symbol: "UNTR.JK", cleanSymbol: "UNTR", name: "United Tractors Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Industrials" },

  // Telecommunications & Technology
  { symbol: "TLKM.JK", cleanSymbol: "TLKM", name: "Telkom Indonesia (Persero) Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Infrastructure" },
  { symbol: "ISAT.JK", cleanSymbol: "ISAT", name: "Indosat Ooredoo Hutchison Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Infrastructure" },
  { symbol: "EXCL.JK", cleanSymbol: "EXCL", name: "XL Axiata Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Infrastructure" },
  { symbol: "TOWR.JK", cleanSymbol: "TOWR", name: "Sarana Menara Nusantara Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Infrastructure" },
  { symbol: "MTEL.JK", cleanSymbol: "MTEL", name: "Dayamitra Telekomunikasi Tbk (Mitratel)", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Infrastructure" },
  { symbol: "GOTO.JK", cleanSymbol: "GOTO", name: "GoTo Gojek Tokopedia Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Technology" },
  { symbol: "BUKA.JK", cleanSymbol: "BUKA", name: "Bukalapak.com Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Technology" },
  { symbol: "EMTK.JK", cleanSymbol: "EMTK", name: "Elang Mahkota Teknologi Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Technology" },

  // Basic Materials, Pulp, Paper & Cement
  { symbol: "BRPT.JK", cleanSymbol: "BRPT", name: "Barito Pacific Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Basic Materials" },
  { symbol: "TPIA.JK", cleanSymbol: "TPIA", name: "Chandra Asri Pacific Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Basic Materials" },
  { symbol: "INKP.JK", cleanSymbol: "INKP", name: "Indah Kiat Pulp & Paper Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Basic Materials" },
  { symbol: "TKIM.JK", cleanSymbol: "TKIM", name: "Pabrik Kertas Tjiwi Kimia Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Basic Materials" },
  { symbol: "SMGR.JK", cleanSymbol: "SMGR", name: "Semen Indonesia (Persero) Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Basic Materials" },
  { symbol: "INTP.JK", cleanSymbol: "INTP", name: "Indocement Tunggal Prakarsa Tbk", exchange: "IDX", assetType: "stock", currency: "IDR", sector: "Basic Materials" },

  // --- COMMODITIES & PRECIOUS METALS ---
  { symbol: "ANTAM", cleanSymbol: "ANTAM", name: "Emas Batangan Logam Mulia Antam (IDR/gram)", exchange: "KOMODITAS", assetType: "gold", currency: "IDR" },
  { symbol: "UBS", cleanSymbol: "UBS", name: "Emas Batangan UBS (IDR/gram)", exchange: "KOMODITAS", assetType: "gold", currency: "IDR" },

  // --- CRYPTO (Top 12) ---
  { symbol: "BTC-USD", cleanSymbol: "BTC", name: "Bitcoin (BTC)", exchange: "KRIPTO", assetType: "crypto", currency: "IDR" },
  { symbol: "ETH-USD", cleanSymbol: "ETH", name: "Ethereum (ETH)", exchange: "KRIPTO", assetType: "crypto", currency: "IDR" },
  { symbol: "SOL-USD", cleanSymbol: "SOL", name: "Solana (SOL)", exchange: "KRIPTO", assetType: "crypto", currency: "IDR" },
  { symbol: "BNB-USD", cleanSymbol: "BNB", name: "Binance Coin (BNB)", exchange: "KRIPTO", assetType: "crypto", currency: "IDR" },
  { symbol: "XRP-USD", cleanSymbol: "XRP", name: "Ripple (XRP)", exchange: "KRIPTO", assetType: "crypto", currency: "IDR" },
  { symbol: "DOGE-USD", cleanSymbol: "DOGE", name: "Dogecoin (DOGE)", exchange: "KRIPTO", assetType: "crypto", currency: "IDR" },
  { symbol: "ADA-USD", cleanSymbol: "ADA", name: "Cardano (ADA)", exchange: "KRIPTO", assetType: "crypto", currency: "IDR" },
  { symbol: "AVAX-USD", cleanSymbol: "AVAX", name: "Avalanche (AVAX)", exchange: "KRIPTO", assetType: "crypto", currency: "IDR" },
  { symbol: "USDT-USD", cleanSymbol: "USDT", name: "Tether USD (USDT)", exchange: "KRIPTO", assetType: "crypto", currency: "IDR" },

  // --- GLOBAL MEGA-CAPS ---
  { symbol: "AAPL", cleanSymbol: "AAPL", name: "Apple Inc.", exchange: "NASDAQ", assetType: "stock", currency: "USD" },
  { symbol: "MSFT", cleanSymbol: "MSFT", name: "Microsoft Corporation", exchange: "NASDAQ", assetType: "stock", currency: "USD" },
  { symbol: "NVDA", cleanSymbol: "NVDA", name: "NVIDIA Corporation", exchange: "NASDAQ", assetType: "stock", currency: "USD" },
  { symbol: "GOOGL", cleanSymbol: "GOOGL", name: "Alphabet Inc. (Google)", exchange: "NASDAQ", assetType: "stock", currency: "USD" },
  { symbol: "AMZN", cleanSymbol: "AMZN", name: "Amazon.com Inc.", exchange: "NASDAQ", assetType: "stock", currency: "USD" },
  { symbol: "META", cleanSymbol: "META", name: "Meta Platforms Inc.", exchange: "NASDAQ", assetType: "stock", currency: "USD" },
  { symbol: "TSLA", cleanSymbol: "TSLA", name: "Tesla Inc.", exchange: "NASDAQ", assetType: "stock", currency: "USD" },
];

/**
 * Instant local search with zero network latency (< 1ms).
 */
export function searchLocalRegistry(query: string): StaticInstrument[] {
  const q = query.trim().toUpperCase();
  if (!q) return [];

  const lowerQ = query.trim().toLowerCase();

  return INSTANT_REGISTRY.filter((item) => {
    // 1. Exact or prefix match on clean symbol (highest relevance)
    if (item.cleanSymbol.toUpperCase().startsWith(q)) return true;
    // 2. Substring match on symbol
    if (item.symbol.toUpperCase().includes(q)) return true;
    // 3. Substring match on full company name
    if (item.name.toLowerCase().includes(lowerQ)) return true;
    return false;
  }).slice(0, 10);
}
