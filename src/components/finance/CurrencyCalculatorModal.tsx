import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeftRight,
  Calculator,
  Copy,
  Check,
  TrendingUp,
  Landmark,
  Edit3,
  Sparkles,
} from "lucide-react";
import {
  SUPPORTED_CURRENCIES,
  type RateMode,
  convertCurrency,
  formatMoney,
} from "@/lib/currencies";
import { useUIStore } from "@/store/useUIStore";

interface CurrencyCalculatorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultAmount?: number;
  defaultFrom?: string;
}

export function CurrencyCalculatorModal({
  open,
  onOpenChange,
  defaultAmount = 100,
  defaultFrom = "EUR",
}: CurrencyCalculatorModalProps) {
  const { mainCurrency } = useUIStore();

  const [amount, setAmount] = useState<number>(defaultAmount);
  const [fromCurrency, setFromCurrency] = useState<string>(defaultFrom);
  const [toCurrency, setToCurrency] = useState<string>(mainCurrency || "DZD");
  const [rateMode, setRateMode] = useState<RateMode>("black_market");
  const [customRate, setCustomRate] = useState<number>(254);
  const [copied, setCopied] = useState<boolean>(false);

  // Quick swap
  const handleSwap = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const { result, rateUsed } = convertCurrency(
    amount || 0,
    fromCurrency,
    toCurrency,
    rateMode,
    customRate
  );

  // Also calculate comparison between official and black market
  const officialCalc = convertCurrency(
    amount || 0,
    fromCurrency,
    toCurrency,
    "official"
  );
  const blackMarketCalc = convertCurrency(
    amount || 0,
    fromCurrency,
    toCurrency,
    "black_market"
  );

  const handleCopy = () => {
    const text = `${formatMoney(result, toCurrency)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Calculator className="h-5 w-5 text-primary" />
            Currency Exchange Calculator
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1 text-xs">
          {/* Rate Mode Selector */}
          <div className="space-y-1.5">
            <label className="font-semibold text-muted-foreground block">
              Exchange Rate Calculation Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRateMode("black_market")}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all ${
                  rateMode === "black_market"
                    ? "bg-emerald-500/15 border-emerald-500 text-emerald-400 font-semibold shadow-sm"
                    : "bg-secondary/40 border-border/60 text-muted-foreground hover:bg-secondary/70"
                }`}
              >
                <div className="flex items-center gap-1 text-xs">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>Square / Parallel</span>
                </div>
                <span className="text-[10px] opacity-75 mt-0.5">Black Market Rate</span>
              </button>

              <button
                type="button"
                onClick={() => setRateMode("official")}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all ${
                  rateMode === "official"
                    ? "bg-blue-500/15 border-blue-500 text-blue-400 font-semibold shadow-sm"
                    : "bg-secondary/40 border-border/60 text-muted-foreground hover:bg-secondary/70"
                }`}
              >
                <div className="flex items-center gap-1 text-xs">
                  <Landmark className="h-3.5 w-3.5" />
                  <span>Official Bank</span>
                </div>
                <span className="text-[10px] opacity-75 mt-0.5">Central Bank Rate</span>
              </button>

              <button
                type="button"
                onClick={() => setRateMode("custom")}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all ${
                  rateMode === "custom"
                    ? "bg-purple-500/15 border-purple-500 text-purple-400 font-semibold shadow-sm"
                    : "bg-secondary/40 border-border/60 text-muted-foreground hover:bg-secondary/70"
                }`}
              >
                <div className="flex items-center gap-1 text-xs">
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Custom Rate</span>
                </div>
                <span className="text-[10px] opacity-75 mt-0.5">User-Defined Rate</span>
              </button>
            </div>
          </div>

          {/* If Custom Rate selected: input field */}
          {rateMode === "custom" && (
            <div className="p-2.5 rounded-lg bg-secondary/40 border border-purple-500/30 space-y-1">
              <label className="font-semibold text-purple-300 flex items-center justify-between">
                <span>Enter Custom 1 {fromCurrency} Rate in {toCurrency}</span>
                <span className="text-[10px] opacity-75">e.g. 252.5</span>
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={customRate}
                onChange={(e) => setCustomRate(parseFloat(e.target.value) || 0)}
                className="h-8 text-xs font-mono"
              />
            </div>
          )}

          {/* Amount and Currencies Grid */}
          <div className="grid grid-cols-12 gap-2 items-end">
            <div className="col-span-12 sm:col-span-5 space-y-1">
              <label className="font-semibold text-muted-foreground">Amount</label>
              <Input
                type="number"
                min="0"
                step="any"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="h-9 font-semibold text-sm"
              />
            </div>

            <div className="col-span-5 sm:col-span-3 space-y-1">
              <label className="font-semibold text-muted-foreground">From</label>
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-2 text-xs font-semibold"
              >
                {SUPPORTED_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2 sm:col-span-1 flex justify-center pb-0.5">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleSwap}
                className="h-8 w-8 rounded-full"
                title="Swap Currencies"
              >
                <ArrowLeftRight className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="col-span-5 sm:col-span-3 space-y-1">
              <label className="font-semibold text-muted-foreground">To (Target)</label>
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-2 text-xs font-semibold"
              >
                {SUPPORTED_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-muted-foreground">Quick Presets:</span>
            {[50, 100, 250, 500, 1000, 2500, 5000].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(val)}
                className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                  amount === val
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "bg-secondary/60 hover:bg-secondary text-muted-foreground"
                }`}
              >
                {val}
              </button>
            ))}
          </div>

          {/* Converted Result Display Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 via-secondary/40 to-background border border-primary/20 space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="font-medium text-xs">
                {amount} {fromCurrency} =
              </span>
              <Badge variant="outline" className="text-[10px] capitalize">
                {rateMode.replace("_", " ")} Rate
              </Badge>
            </div>

            <div className="flex items-baseline justify-between gap-2">
              <span className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                {formatMoney(result, toCurrency)}
              </span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleCopy}
                className="gap-1.5 text-xs h-7"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    Copy
                  </>
                )}
              </Button>
            </div>

            <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Exchange Rate: 1 {fromCurrency} ≈ {rateUsed.toFixed(4)} {toCurrency}</span>
              {fromCurrency !== "DZD" && toCurrency === "DZD" && (
                <span className="text-emerald-400 font-medium">
                  Square Premium: +
                  {Math.round(
                    ((blackMarketCalc.result - officialCalc.result) / (officialCalc.result || 1)) * 100
                  )}
                  %
                </span>
              )}
            </div>
          </div>

          {/* Side by Side Official vs Black Market comparison */}
          {fromCurrency !== toCurrency && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-secondary/30 border border-border/50 space-y-0.5">
                <span className="text-[10px] text-muted-foreground block">
                  Official Bank Value
                </span>
                <p className="font-bold text-foreground">
                  {formatMoney(officialCalc.result, toCurrency)}
                </p>
                <span className="text-[10px] text-muted-foreground">
                  @ {officialCalc.rateUsed.toFixed(2)}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-0.5">
                <span className="text-[10px] text-emerald-400 font-semibold block">
                  Square / Black Market Value
                </span>
                <p className="font-bold text-emerald-300">
                  {formatMoney(blackMarketCalc.result, toCurrency)}
                </p>
                <span className="text-[10px] text-emerald-400/80">
                  @ {blackMarketCalc.rateUsed.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
