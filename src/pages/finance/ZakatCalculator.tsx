import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Calculator, Info, ShieldCheck, Coins } from "lucide-react";

export function ZakatCalculator({ defaultCurrency = "EUR" }: { defaultCurrency?: string }) {
  // Nisab standard reference:
  // Gold nisab: ~85 grams of 24k gold (~$75-$85/g or ~€70-€80/g)
  // Silver nisab: ~595 grams of silver
  // Users can edit gold price per gram in their local currency
  const [goldPricePerGram, setGoldPricePerGram] = useState<number>(75);
  const [nisabStandard, setNisabStandard] = useState<"gold" | "silver">("gold");

  // Assets subject to Zakat
  const [cashInHand, setCashInHand] = useState<number>(0);
  const [bankBalance, setBankBalance] = useState<number>(0);
  const [clientReceivables, setClientReceivables] = useState<number>(0); // Good debts owed by clients
  const [inventoryValue, setInventoryValue] = useState<number>(0); // Merchandise / sellable assets

  // Liabilities deductible (due immediately / current year)
  const [shortTermDebts, setShortTermDebts] = useState<number>(0);
  const [upcomingExpenses, setUpcomingExpenses] = useState<number>(0);

  // Nisab Threshold: 85g gold or 595g silver
  const nisabThreshold =
    nisabStandard === "gold"
      ? 85 * goldPricePerGram
      : 595 * (goldPricePerGram / 70); // approximate silver ratio

  // Net zakatable wealth
  const totalAssets =
    (cashInHand || 0) +
    (bankBalance || 0) +
    (clientReceivables || 0) +
    (inventoryValue || 0);

  const totalDeductions = (shortTermDebts || 0) + (upcomingExpenses || 0);
  const netZakatableWealth = Math.max(0, totalAssets - totalDeductions);

  const isEligible = netZakatableWealth >= nisabThreshold;
  // 2.5% on Gregorian year (or 2.577% if calculated strictly on Solar vs Lunar)
  const zakatRate = 0.025;
  const zakatDue = isEligible ? netZakatableWealth * zakatRate : 0;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-950/40 via-card to-card border border-emerald-500/30 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-foreground">
              Business & Wealth Zakat Calculator (زكاة المال)
            </h3>
            <Badge variant="outline" className="text-xs bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
              2.5% Rate
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
            Calculates 2.5% Zakat on liquid business assets, client receivables, and cash reserves that have reached the <strong>Nisab threshold</strong> (equivalent to 85g of pure gold) and were held over one full lunar year (Hawl).
          </p>
        </div>

        <div className="text-right shrink-0 bg-background/80 p-3.5 rounded-lg border border-border/60">
          <span className="text-xs text-muted-foreground block font-medium">Zakat Due (واجب الزكاة)</span>
          <span className="text-2xl font-extrabold text-emerald-400">
            {formatCurrency(zakatDue, defaultCurrency)}
          </span>
          <span className="text-[10px] text-muted-foreground block">
            {isEligible ? "✓ Nisab threshold reached" : "Below Nisab — no Zakat due"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Step 1: Nisab Settings */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Calculator className="h-4 w-4 text-primary" />
              1. Nisab Threshold (النصاب)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">Standard</label>
              <select
                className="w-full h-8 rounded-md border border-input bg-background px-2.5 text-xs shadow-sm"
                value={nisabStandard}
                onChange={(e) => setNisabStandard(e.target.value as any)}
              >
                <option value="gold">Gold Nisab (85 grams 24k) - Standard</option>
                <option value="silver">Silver Nisab (595 grams)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">
                Current Gold Price per Gram ({defaultCurrency})
              </label>
              <Input
                type="number"
                step="any"
                min="1"
                className="h-8 text-xs"
                value={goldPricePerGram}
                onChange={(e) => setGoldPricePerGram(Number(e.target.value) || 0)}
              />
              <p className="text-[10px] text-muted-foreground">
                Update with your current local market price for 24k gold.
              </p>
            </div>

            <div className="p-2.5 rounded-md bg-secondary/30 border border-border/40 space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nisab Limit:</span>
                <span className="font-bold text-foreground">
                  {formatCurrency(nisabThreshold, defaultCurrency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Your Net Wealth:</span>
                <span className={`font-bold ${isEligible ? "text-emerald-400" : "text-foreground"}`}>
                  {formatCurrency(netZakatableWealth, defaultCurrency)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Assets */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              2. Zakatable Assets (الأصول الخاضعة)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">
                Cash in Hand & Office Safe ({defaultCurrency})
              </label>
              <Input
                type="number"
                step="any"
                min="0"
                className="h-8 text-xs"
                value={cashInHand || ""}
                onChange={(e) => setCashInHand(Number(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">
                Bank Account Balances ({defaultCurrency})
              </label>
              <Input
                type="number"
                step="any"
                min="0"
                className="h-8 text-xs"
                value={bankBalance || ""}
                onChange={(e) => setBankBalance(Number(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">
                Client Receivables (Invoices expected to be paid)
              </label>
              <Input
                type="number"
                step="any"
                min="0"
                className="h-8 text-xs"
                value={clientReceivables || ""}
                onChange={(e) => setClientReceivables(Number(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">
                Inventory / Sellable Goods
              </label>
              <Input
                type="number"
                step="any"
                min="0"
                className="h-8 text-xs"
                value={inventoryValue || ""}
                onChange={(e) => setInventoryValue(Number(e.target.value) || 0)}
              />
            </div>

            <div className="flex justify-between pt-1 border-t border-border/40 font-semibold text-foreground">
              <span>Total Assets:</span>
              <span>{formatCurrency(totalAssets, defaultCurrency)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Deductible Liabilities & Result */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-rose-400">
              <Info className="h-4 w-4" />
              3. Deductibles & Calculation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">
                Immediate Debts & Supplier Payables
              </label>
              <Input
                type="number"
                step="any"
                min="0"
                className="h-8 text-xs"
                value={shortTermDebts || ""}
                onChange={(e) => setShortTermDebts(Number(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">
                Immediate Operational Overdue Bills
              </label>
              <Input
                type="number"
                step="any"
                min="0"
                className="h-8 text-xs"
                value={upcomingExpenses || ""}
                onChange={(e) => setUpcomingExpenses(Number(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-border/40">
              <div className="flex justify-between text-muted-foreground">
                <span>Total Deductions:</span>
                <span>-{formatCurrency(totalDeductions, defaultCurrency)}</span>
              </div>
              <div className="flex justify-between font-bold text-foreground">
                <span>Net Zakatable:</span>
                <span>{formatCurrency(netZakatableWealth, defaultCurrency)}</span>
              </div>
              <div className="flex justify-between font-bold text-foreground">
                <span>Nisab Met?</span>
                <span className={isEligible ? "text-emerald-400" : "text-muted-foreground"}>
                  {isEligible ? "YES" : "NO"}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-center mt-3">
              <span className="text-[11px] text-muted-foreground block font-medium">
                Calculated Zakat Due (2.5%)
              </span>
              <span className="text-xl font-extrabold text-emerald-400 block mt-0.5">
                {formatCurrency(zakatDue, defaultCurrency)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
