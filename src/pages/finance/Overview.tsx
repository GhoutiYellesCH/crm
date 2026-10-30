import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  DollarSign,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Download,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  Receipt,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFinanceStore } from "@/store/useFinanceStore";
import { useClientStore } from "@/store/useClientStore";
import { useTaskProjectStore } from "@/store/useTaskProjectStore";
import { InvoiceForm } from "./InvoiceForm";
import { ExpenseForm } from "./ExpenseForm";
import { generateInvoicePdf, downloadPdf } from "@/services/pdf/invoicePdf";
import { formatCurrency, formatDate, INVOICE_STATUS_COLORS } from "@/lib/utils";

export default function FinanceOverview() {
  const { t } = useTranslation();
  const {
    invoices,
    transactions,
    loadData,
    saveInvoiceData,
    changeInvoiceStatus,
    removeInvoice,
    saveTransactionData,
    removeTransaction,
  } = useFinanceStore();

  const { clients, loadClients } = useClientStore();
  const { projects, loadData: loadProjects } = useTaskProjectStore();

  const [invoiceFormOpen, setInvoiceFormOpen] = useState(false);
  const [expenseFormOpen, setExpenseFormOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);

  useEffect(() => {
    loadData();
    loadClients();
    loadProjects();
  }, [loadData, loadClients, loadProjects]);

  // Aggregate Totals (grouped by primary currency or EUR default)
  const totalPaidInvoices = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + i.total, 0);

  const totalPendingInvoices = invoices
    .filter((i) => i.status === "sent" || i.status === "draft")
    .reduce((sum, i) => sum + i.total, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalPaidInvoices - totalExpenses;

  const handleDownloadInvoice = async (inv: any) => {
    const pdfBytes = await generateInvoicePdf({
      invoiceNumber: inv.number,
      clientName: inv.clientName || "Client",
      clientCompany: inv.clientCompany,
      clientEmail: inv.clientEmail,
      clientAddress: [inv.clientCity, inv.clientCountry].filter(Boolean).join(", "),
      issueDate: inv.issueDate,
      dueDate: inv.dueDate,
      currency: inv.currency,
      items: inv.parsedItems,
      subtotal: inv.subtotal,
      taxRate: inv.taxRate,
      taxAmount: inv.taxAmount,
      discount: inv.discount,
      total: inv.total,
      notes: inv.notes,
    });
    downloadPdf(pdfBytes, `${inv.number}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-primary" />
            {t("finance.title")}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Multi-currency revenue, invoice management, expenses, and PDF invoice generation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs shadow-sm"
            onClick={() => setExpenseFormOpen(true)}
          >
            <ArrowDownRight className="h-3.5 w-3.5 text-rose-400" />
            Add Expense
          </Button>
          <Button
            size="sm"
            className="gap-1.5 text-xs shadow-sm"
            onClick={() => {
              setEditingInvoice(null);
              setInvoiceFormOpen(true);
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            {t("finance.newInvoice")}
          </Button>
        </div>
      </div>

      {/* KPI Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/60">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
              <span>Collected Revenue</span>
              <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400">
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {formatCurrency(totalPaidInvoices, "EUR")}
            </p>
            <p className="text-[10px] text-muted-foreground">From paid client invoices</p>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
              <span>Pending Invoices</span>
              <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-400">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {formatCurrency(totalPendingInvoices, "EUR")}
            </p>
            <p className="text-[10px] text-muted-foreground">Drafts & sent invoices</p>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
              <span>Total Expenses</span>
              <div className="p-1.5 rounded-md bg-rose-500/10 text-rose-400">
                <ArrowDownRight className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {formatCurrency(totalExpenses, "EUR")}
            </p>
            <p className="text-[10px] text-muted-foreground">Software, infra & operations</p>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
              <span>Net Profit</span>
              <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-400">
                <CreditCard className="h-4 w-4" />
              </div>
            </div>
            <p className={`text-2xl font-bold ${netBalance >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {formatCurrency(netBalance, "EUR")}
            </p>
            <p className="text-[10px] text-muted-foreground">Collected revenue minus expenses</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs: Invoices vs Expenses Log */}
      <Tabs defaultValue="invoices" className="w-full">
        <TabsList className="bg-secondary/40 border border-border/50">
          <TabsTrigger value="invoices" className="gap-2 text-xs">
            <Receipt className="h-3.5 w-3.5" />
            Client Invoices ({invoices.length})
          </TabsTrigger>
          <TabsTrigger value="expenses" className="gap-2 text-xs">
            <ArrowDownRight className="h-3.5 w-3.5" />
            Expenses Log ({transactions.filter((t) => t.type === "expense").length})
          </TabsTrigger>
        </TabsList>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="pt-2">
          <div className="space-y-3">
            {invoices.length === 0 ? (
              <div className="border border-dashed rounded-lg p-12 text-center text-muted-foreground">
                <Receipt className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">No invoices created</p>
                <p className="text-xs mt-1 opacity-70">
                  Click "New Invoice" to generate your first PDF invoice for a client.
                </p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden border-border/60">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/40 text-muted-foreground border-b border-border/50 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3">Invoice #</th>
                      <th className="p-3">Client</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {invoices.map((inv) => {
                      const statusColor =
                        INVOICE_STATUS_COLORS[inv.status] || INVOICE_STATUS_COLORS["draft"];

                      return (
                        <tr key={inv.id} className="hover:bg-card/60 transition-colors">
                          <td className="p-3 font-semibold text-foreground">
                            {inv.number}
                          </td>
                          <td className="p-3">
                            <span className="font-medium text-foreground block">
                              {inv.clientName || "Unnamed Client"}
                            </span>
                            {inv.clientCompany && (
                              <span className="text-[10px] text-muted-foreground">
                                {inv.clientCompany}
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-muted-foreground">
                            {formatDate(inv.issueDate)}
                          </td>
                          <td className="p-3 font-bold text-foreground">
                            {formatCurrency(inv.total, inv.currency)}
                          </td>
                          <td className="p-3">
                            <select
                              className={`h-6 rounded px-2 text-[10px] font-semibold border ${statusColor}`}
                              value={inv.status}
                              onChange={(e) =>
                                changeInvoiceStatus(inv.id, e.target.value)
                              }
                            >
                              <option value="draft">Draft</option>
                              <option value="sent">Sent</option>
                              <option value="paid">Paid</option>
                              <option value="overdue">Overdue</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="p-3 text-right space-x-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-[11px] gap-1"
                              onClick={() => handleDownloadInvoice(inv)}
                              title="Download PDF Invoice"
                            >
                              <Download className="h-3 w-3" />
                              PDF
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() => {
                                if (confirm(`Delete invoice ${inv.number}?`)) {
                                  removeInvoice(inv.id);
                                }
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="pt-2">
          <div className="space-y-3">
            {transactions.filter((t) => t.type === "expense").length === 0 ? (
              <div className="border border-dashed rounded-lg p-12 text-center text-muted-foreground">
                <ArrowDownRight className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">No expenses logged</p>
                <p className="text-xs mt-1 opacity-70">
                  Log operational costs like hosting, SaaS tools, and gear.
                </p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden border-border/60">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/40 text-muted-foreground border-b border-border/50 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3">Description</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3 text-right">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {transactions
                      .filter((t) => t.type === "expense")
                      .map((exp) => (
                        <tr key={exp.id} className="hover:bg-card/60 transition-colors">
                          <td className="p-3 font-medium text-foreground">
                            {exp.description}
                          </td>
                          <td className="p-3">
                            <Badge variant="outline" className="text-[10px] capitalize">
                              {exp.category || "General"}
                            </Badge>
                          </td>
                          <td className="p-3 text-muted-foreground">
                            {formatDate(exp.date)}
                          </td>
                          <td className="p-3 font-semibold text-rose-400">
                            -{formatCurrency(exp.amount, exp.currency)}
                          </td>
                          <td className="p-3 text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() => removeTransaction(exp.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Invoice Modal */}
      <InvoiceForm
        open={invoiceFormOpen}
        onOpenChange={setInvoiceFormOpen}
        clients={clients}
        projects={projects}
        initialData={editingInvoice}
        onSave={async (data) => {
          await saveInvoiceData(data);
        }}
      />

      {/* Expense Modal */}
      <ExpenseForm
        open={expenseFormOpen}
        onOpenChange={setExpenseFormOpen}
        onSave={async (data) => {
          await saveTransactionData(data);
        }}
      />
    </div>
  );
}
