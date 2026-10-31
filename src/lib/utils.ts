import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Generate a UUID-like ID */
export function generateId(): string {
  return crypto.randomUUID();
}

/** Unix timestamp (seconds or ms) → Date */
export function fromUnix(ts: number): Date {
  if (typeof ts !== "number" || isNaN(ts)) return new Date();
  if (ts > 1e11) return new Date(ts);
  return new Date(ts * 1000);
}

/** Date → Unix timestamp (seconds) */
export function toUnix(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

/** Current Unix timestamp */
export function nowUnix(): number {
  return toUnix(new Date());
}

/** Format a Unix timestamp for display (safe against undefined / invalid numbers) */
export function formatDate(
  ts: number | string | Date | null | undefined,
  fmt = "dd/MM/yyyy"
): string {
  if (ts === null || ts === undefined || ts === "") return "—";
  if (ts instanceof Date) {
    return isNaN(ts.getTime()) ? "—" : format(ts, fmt);
  }
  const num = typeof ts === "number" ? ts : Number(ts);
  if (isNaN(num) || num <= 0) return "—";
  try {
    const d = fromUnix(num);
    if (isNaN(d.getTime())) return "—";
    return format(d, fmt);
  } catch {
    return "—";
  }
}

/** Converts snake_case keys in objects/arrays to camelCase while preserving original keys */
export function snakeToCamel<T = any>(obj: any): T {
  if (Array.isArray(obj)) {
    return obj.map((v) => snakeToCamel(v)) as unknown as T;
  }
  if (
    obj !== null &&
    obj !== undefined &&
    typeof obj === "object" &&
    obj.constructor === Object
  ) {
    const newObj: any = {};
    for (const key of Object.keys(obj)) {
      const camelKey = key.replace(/_([a-z0-9])/g, (_, letter) =>
        letter.toUpperCase()
      );
      newObj[camelKey] = snakeToCamel(obj[key]);
      if (camelKey !== key) {
        newObj[key] = obj[key];
      }
    }
    return newObj;
  }
  return obj;
}

/** Format currency amount */
export function formatCurrency(
  amount: number,
  currency: string = "DZD"
): string {
  const norm = (currency || "DZD").toUpperCase();
  if (norm === "DZD" || norm === "DZ" || norm === "DA") {
    return `${new Intl.NumberFormat("fr-DZ", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)} DA`;
  }
  try {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: norm,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)} ${norm}`;
  }
}

/** Parse JSON safely */
export function safeJson<T>(json: string | null | undefined, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/** Status color map for clients */
export const CLIENT_STATUS_COLORS: Record<string, string> = {
  lead: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  prospect: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  proposal: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  active: "bg-green-500/20 text-green-400 border-green-500/30",
  inactive: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  closed: "bg-red-500/20 text-red-400 border-red-500/30",
};

/** Priority color map */
export const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-gray-500/20 text-gray-400",
  medium: "bg-blue-500/20 text-blue-400",
  high: "bg-orange-500/20 text-orange-400",
  urgent: "bg-red-500/20 text-red-400",
};

/** Lead stage color map */
export const LEAD_STAGE_COLORS: Record<string, string> = {
  discovered: "bg-gray-500/20 text-gray-400",
  enriched: "bg-blue-500/20 text-blue-400",
  scored: "bg-purple-500/20 text-purple-400",
  shortlisted: "bg-yellow-500/20 text-yellow-400",
  contacted: "bg-orange-500/20 text-orange-400",
  qualified: "bg-green-500/20 text-green-400",
  converted: "bg-emerald-500/20 text-emerald-400",
  rejected: "bg-red-500/20 text-red-400",
};

/** Audit severity colors */
export const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-red-600/20 text-red-400 border-red-600/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  info: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

/** Invoice status colors */
export const INVOICE_STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-500/20 text-gray-400",
  sent: "bg-blue-500/20 text-blue-400",
  paid: "bg-green-500/20 text-green-400",
  overdue: "bg-red-500/20 text-red-400",
  cancelled: "bg-gray-500/20 text-gray-500",
};

/** Supported currencies */
export const CURRENCIES = [
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "DZD", symbol: "DA", name: "Algerian Dinar" },
  { code: "MAD", symbol: "د.م.", name: "Moroccan Dirham" },
  { code: "TND", symbol: "DT", name: "Tunisian Dinar" },
  { code: "GBP", symbol: "£", name: "British Pound" },
];

/** Supported languages */
export const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "ar", label: "العربية", flag: "🇩🇿", rtl: true },
];
