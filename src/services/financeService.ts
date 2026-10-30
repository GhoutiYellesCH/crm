import { getDatabase } from "@/db/client";
import { generateId, nowUnix, safeJson } from "@/lib/utils";
import type { Invoice, Transaction, RecurringRevenue } from "@/db/schema";
import type { InvoiceItem } from "./pdf/invoicePdf";

export interface InvoiceWithDetails extends Invoice {
  clientName?: string;
  clientCompany?: string;
  clientEmail?: string;
  clientCity?: string;
  clientCountry?: string;
  projectName?: string;
  parsedItems: InvoiceItem[];
}

export interface RecurringRevenueWithDetails extends RecurringRevenue {
  clientName?: string;
  clientCompany?: string;
}

// ─── Recurring Revenue (Retainers / Subscriptions) ──────────────────────────

export async function fetchRecurringRevenue(): Promise<RecurringRevenueWithDetails[]> {
  const db = await getDatabase();
  // Ensure table exists on early runs
  await db.execute(
    `CREATE TABLE IF NOT EXISTS recurring_revenue (
      id TEXT PRIMARY KEY NOT NULL,
      client_id TEXT REFERENCES clients(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      frequency TEXT NOT NULL DEFAULT 'monthly',
      currency TEXT NOT NULL DEFAULT 'EUR',
      amount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      start_date INTEGER NOT NULL DEFAULT (unixepoch()),
      next_billing_date INTEGER,
      notes TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    )`
  );

  const rows = await db.select<any[]>(
    `SELECT r.*, c.name as client_name, c.company as client_company
     FROM recurring_revenue r
     LEFT JOIN clients c ON r.client_id = c.id
     ORDER BY r.created_at DESC`
  );

  return rows.map((r) => ({
    id: r.id,
    clientId: r.client_id,
    title: r.title,
    frequency: r.frequency,
    currency: r.currency,
    amount: r.amount,
    status: r.status,
    startDate: r.start_date,
    nextBillingDate: r.next_billing_date,
    notes: r.notes,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    clientName: r.client_name,
    clientCompany: r.client_company,
  }));
}

export interface UpsertRecurringInput {
  id?: string;
  clientId?: string | null;
  title: string;
  frequency: "monthly" | "yearly" | "quarterly";
  currency: string;
  amount: number;
  status: "active" | "paused" | "cancelled";
  notes?: string | null;
}

export async function saveRecurringRevenue(input: UpsertRecurringInput): Promise<string> {
  const db = await getDatabase();
  const now = nowUnix();

  if (input.id) {
    await db.execute(
      `UPDATE recurring_revenue SET
        client_id = $1, title = $2, frequency = $3, currency = $4,
        amount = $5, status = $6, notes = $7, updated_at = $8
       WHERE id = $9`,
      [
        input.clientId || null,
        input.title,
        input.frequency,
        input.currency,
        input.amount,
        input.status,
        input.notes || null,
        now,
        input.id,
      ]
    );
    return input.id;
  } else {
    const newId = generateId();
    await db.execute(
      `INSERT INTO recurring_revenue (
        id, client_id, title, frequency, currency, amount, status, notes, start_date, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        newId,
        input.clientId || null,
        input.title,
        input.frequency,
        input.currency,
        input.amount,
        input.status,
        input.notes || null,
        now,
        now,
        now,
      ]
    );
    return newId;
  }
}

export async function deleteRecurringRevenue(id: string): Promise<void> {
  const db = await getDatabase();
  await db.execute("DELETE FROM recurring_revenue WHERE id = $1", [id]);
}

// ─── Invoices ────────────────────────────────────────────────────────────────

export async function fetchInvoices(): Promise<InvoiceWithDetails[]> {
  const db = await getDatabase();
  const rows = await db.select<any[]>(
    `SELECT i.*, c.name as client_name, c.company as client_company,
            c.email as client_email, c.city as client_city, c.country as client_country,
            p.name as project_name
     FROM invoices i
     LEFT JOIN clients c ON i.client_id = c.id
     LEFT JOIN projects p ON i.project_id = p.id
     ORDER BY i.issue_date DESC`
  );

  return rows.map((r) => ({
    id: r.id,
    clientId: r.client_id,
    projectId: r.project_id,
    number: r.number,
    status: r.status,
    currency: r.currency,
    subtotal: r.subtotal,
    taxRate: r.tax_rate,
    taxAmount: r.tax_amount,
    discount: r.discount,
    total: r.total,
    totalEur: r.total_eur,
    exchangeRate: r.exchange_rate,
    lineItems: r.line_items,
    notes: r.notes,
    issueDate: r.issue_date,
    dueDate: r.due_date,
    paidAt: r.paid_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    clientName: r.client_name,
    clientCompany: r.client_company,
    clientEmail: r.client_email,
    clientCity: r.client_city,
    clientCountry: r.client_country,
    projectName: r.project_name,
    parsedItems: safeJson<InvoiceItem[]>(r.line_items, []),
  }));
}

export interface UpsertInvoiceInput {
  id?: string;
  clientId: string;
  projectId?: string | null;
  number: string;
  status: string;
  currency: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
  notes?: string | null;
  dueDate?: number | null;
}

export async function saveInvoice(input: UpsertInvoiceInput): Promise<string> {
  const db = await getDatabase();
  const now = nowUnix();
  const itemsJson = JSON.stringify(input.items);
  const paidAt = input.status === "paid" ? now : null;

  if (input.id) {
    await db.execute(
      `UPDATE invoices SET
        client_id = $1, project_id = $2, number = $3, status = $4,
        currency = $5, subtotal = $6, tax_rate = $7, tax_amount = $8,
        discount = $9, total = $10, line_items = $11, notes = $12,
        due_date = $13, paid_at = $14, updated_at = $15
       WHERE id = $16`,
      [
        input.clientId,
        input.projectId || null,
        input.number,
        input.status,
        input.currency,
        input.subtotal,
        input.taxRate,
        input.taxAmount,
        input.discount,
        input.total,
        itemsJson,
        input.notes || null,
        input.dueDate || null,
        paidAt,
        now,
        input.id,
      ]
    );

    if (input.status === "paid") {
      await recordInvoiceIncome(input.id, input.total, input.currency, `Invoice #${input.number} Payment`);
    }

    return input.id;
  } else {
    const newId = generateId();
    await db.execute(
      `INSERT INTO invoices (
        id, client_id, project_id, number, status, currency,
        subtotal, tax_rate, tax_amount, discount, total,
        line_items, notes, issue_date, due_date, paid_at,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
      [
        newId,
        input.clientId,
        input.projectId || null,
        input.number,
        input.status,
        input.currency,
        input.subtotal,
        input.taxRate,
        input.taxAmount,
        input.discount,
        input.total,
        itemsJson,
        input.notes || null,
        now,
        input.dueDate || null,
        paidAt,
        now,
        now,
      ]
    );

    if (input.status === "paid") {
      await recordInvoiceIncome(newId, input.total, input.currency, `Invoice #${input.number} Payment`);
    }

    return newId;
  }
}

export async function updateInvoiceStatus(id: string, status: string): Promise<void> {
  const db = await getDatabase();
  const now = nowUnix();
  const paidAt = status === "paid" ? now : null;

  await db.execute(
    "UPDATE invoices SET status = $1, paid_at = $2, updated_at = $3 WHERE id = $4",
    [status, paidAt, now, id]
  );

  if (status === "paid") {
    const inv = (await db.select<Invoice[]>("SELECT * FROM invoices WHERE id = $1 LIMIT 1", [id]))[0];
    if (inv) {
      await recordInvoiceIncome(id, inv.total, inv.currency, `Invoice #${inv.number} Payment`);
    }
  }
}

export async function deleteInvoice(id: string): Promise<void> {
  const db = await getDatabase();
  await db.execute("DELETE FROM invoices WHERE id = $1", [id]);
}

// ─── Transactions (Income & Expenses) ────────────────────────────────────────

export async function fetchTransactions(): Promise<Transaction[]> {
  const db = await getDatabase();
  return db.select<Transaction[]>(
    "SELECT * FROM transactions ORDER BY date DESC"
  );
}

export interface UpsertTransactionInput {
  id?: string;
  type: "income" | "expense";
  category?: string | null;
  currency: string;
  amount: number;
  description?: string | null;
  notes?: string | null;
  date?: number;
}

export async function saveTransaction(input: UpsertTransactionInput): Promise<string> {
  const db = await getDatabase();
  const now = nowUnix();
  const date = input.date || now;

  if (input.id) {
    await db.execute(
      `UPDATE transactions SET
        type = $1, category = $2, currency = $3, amount = $4,
        description = $5, notes = $6, date = $7
       WHERE id = $8`,
      [
        input.type,
        input.category || null,
        input.currency,
        input.amount,
        input.description || null,
        input.notes || null,
        date,
        input.id,
      ]
    );
    return input.id;
  } else {
    const newId = generateId();
    await db.execute(
      `INSERT INTO transactions (
        id, type, category, currency, amount, description, notes, date, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        newId,
        input.type,
        input.category || null,
        input.currency,
        input.amount,
        input.description || null,
        input.notes || null,
        date,
        now,
      ]
    );
    return newId;
  }
}

export async function deleteTransaction(id: string): Promise<void> {
  const db = await getDatabase();
  await db.execute("DELETE FROM transactions WHERE id = $1", [id]);
}

async function recordInvoiceIncome(invoiceId: string, amount: number, currency: string, description: string) {
  const db = await getDatabase();
  const existing = await db.select<Transaction[]>(
    "SELECT * FROM transactions WHERE invoice_id = $1 LIMIT 1",
    [invoiceId]
  );
  if (existing && existing.length > 0) return;

  const newId = generateId();
  const now = nowUnix();
  await db.execute(
    `INSERT INTO transactions (id, invoice_id, type, category, currency, amount, description, date, created_at)
     VALUES ($1, $2, 'income', 'client_invoice', $3, $4, $5, $6, $7)`,
    [newId, invoiceId, currency, amount, description, now, now]
  );
}
