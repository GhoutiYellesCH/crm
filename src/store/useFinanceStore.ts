import { create } from "zustand";
import {
  fetchInvoices,
  saveInvoice,
  updateInvoiceStatus,
  deleteInvoice,
  fetchTransactions,
  saveTransaction,
  deleteTransaction,
  type InvoiceWithDetails,
  type UpsertInvoiceInput,
  type UpsertTransactionInput,
} from "@/services/financeService";
import type { Transaction } from "@/db/schema";

interface FinanceState {
  invoices: InvoiceWithDetails[];
  transactions: Transaction[];
  isLoading: boolean;
  selectedCurrency: string;

  loadData: () => Promise<void>;
  saveInvoiceData: (input: UpsertInvoiceInput) => Promise<string>;
  changeInvoiceStatus: (id: string, status: string) => Promise<void>;
  removeInvoice: (id: string) => Promise<void>;

  saveTransactionData: (input: UpsertTransactionInput) => Promise<string>;
  removeTransaction: (id: string) => Promise<void>;
  setSelectedCurrency: (curr: string) => void;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  invoices: [],
  transactions: [],
  isLoading: false,
  selectedCurrency: "EUR",

  loadData: async () => {
    set({ isLoading: true });
    try {
      const [invoices, transactions] = await Promise.all([
        fetchInvoices(),
        fetchTransactions(),
      ]);
      set({ invoices, transactions });
    } catch (err) {
      console.error("[useFinanceStore] Failed to load finance data:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  saveInvoiceData: async (input: UpsertInvoiceInput) => {
    const id = await saveInvoice(input);
    await get().loadData();
    return id;
  },

  changeInvoiceStatus: async (id: string, status: string) => {
    await updateInvoiceStatus(id, status);
    await get().loadData();
  },

  removeInvoice: async (id: string) => {
    await deleteInvoice(id);
    await get().loadData();
  },

  saveTransactionData: async (input: UpsertTransactionInput) => {
    const id = await saveTransaction(input);
    await get().loadData();
    return id;
  },

  removeTransaction: async (id: string) => {
    await deleteTransaction(id);
    await get().loadData();
  },

  setSelectedCurrency: (selectedCurrency) => set({ selectedCurrency }),
}));
