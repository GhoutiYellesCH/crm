export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  officialToDzd: number;    // Official bank exchange rate to DZD
  blackMarketToDzd: number; // Square / Parallel market rate to DZD
}

export const SUPPORTED_CURRENCIES: CurrencyInfo[] = [
  { code: "DZD", symbol: "DA", name: "Algerian Dinar", officialToDzd: 1, blackMarketToDzd: 1 },
  { code: "EUR", symbol: "€", name: "Euro", officialToDzd: 145.2, blackMarketToDzd: 254.0 },
  { code: "USD", symbol: "$", name: "US Dollar", officialToDzd: 134.5, blackMarketToDzd: 238.0 },
  { code: "GBP", symbol: "£", name: "British Pound", officialToDzd: 174.8, blackMarketToDzd: 298.0 },
  { code: "CAD", symbol: "CA$", name: "Canadian Dollar", officialToDzd: 98.2, blackMarketToDzd: 170.0 },
  { code: "AED", symbol: "AED", name: "UAE Dirham", officialToDzd: 36.6, blackMarketToDzd: 64.5 },
  { code: "SAR", symbol: "SAR", name: "Saudi Riyal", officialToDzd: 35.8, blackMarketToDzd: 63.2 },
  { code: "MAD", symbol: "د.م.", name: "Moroccan Dirham", officialToDzd: 13.5, blackMarketToDzd: 23.5 },
  { code: "TND", symbol: "DT", name: "Tunisian Dinar", officialToDzd: 43.1, blackMarketToDzd: 76.0 },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc", officialToDzd: 153.0, blackMarketToDzd: 268.0 },
  { code: "TRY", symbol: "₺", name: "Turkish Lira", officialToDzd: 3.9, blackMarketToDzd: 6.8 },
];

export type RateMode = "black_market" | "official" | "custom";

/**
 * Converts an amount from one currency to another using the chosen rate mode or custom rate.
 */
export function convertCurrency(
  amount: number,
  fromCode: string,
  toCode: string,
  mode: RateMode = "black_market",
  customRate?: number
): { result: number; rateUsed: number } {
  if (fromCode === toCode) {
    return { result: amount, rateUsed: 1 };
  }

  if (mode === "custom" && customRate && customRate > 0) {
    return { result: amount * customRate, rateUsed: customRate };
  }

  const fromCurr =
    SUPPORTED_CURRENCIES.find((c) => c.code === fromCode) || {
      officialToDzd: 1,
      blackMarketToDzd: 1,
    };
  const toCurr =
    SUPPORTED_CURRENCIES.find((c) => c.code === toCode) || {
      officialToDzd: 1,
      blackMarketToDzd: 1,
    };

  const fromFactor =
    mode === "official" ? fromCurr.officialToDzd : fromCurr.blackMarketToDzd;
  const toFactor =
    mode === "official" ? toCurr.officialToDzd : toCurr.blackMarketToDzd;

  // Rate: 1 fromCurr = (fromFactor / toFactor) toCurr
  const rateUsed = toFactor > 0 ? fromFactor / toFactor : 1;
  const result = amount * rateUsed;

  return { result, rateUsed };
}

/**
 * Universal Currency Formatter respecting main currency preferences (e.g. DZD / DA / dz, EUR, USD)
 */
export function formatMoney(amount: number, currencyCode: string = "DZD"): string {
  const norm = currencyCode.toUpperCase();
  const cInfo = SUPPORTED_CURRENCIES.find((c) => c.code === norm);

  if (norm === "DZD" || norm === "DZ" || norm === "DA") {
    return `${new Intl.NumberFormat("fr-DZ", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)} DA`;
  }

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: norm,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    const symbol = cInfo?.symbol || norm;
    return `${new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)} ${symbol}`;
  }
}
