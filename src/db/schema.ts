import { sql } from "drizzle-orm";
import {
  integer,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

// ─── Helpers ────────────────────────────────────────────────────────────────

const id = () => text("id").primaryKey().notNull();
const now = () =>
  integer("created_at")
    .notNull()
    .default(sql`(unixepoch())`);
const updatedAt = () =>
  integer("updated_at")
    .notNull()
    .default(sql`(unixepoch())`);

// ─── Users ───────────────────────────────────────────────────────────────────

export const users = sqliteTable("users", {
  id: id(),
  name: text("name").notNull(),
  email: text("email").unique(),
  passwordHash: text("password_hash"),
  role: text("role").notNull().default("member"), // owner | member | viewer
  avatarUrl: text("avatar_url"),
  isActive: integer("is_active").notNull().default(1),
  createdAt: now(),
});

// ─── Clients ─────────────────────────────────────────────────────────────────

export const clients = sqliteTable("clients", {
  id: id(),
  name: text("name").notNull(),
  company: text("company"),
  companySize: text("company_size"),
  industry: text("industry"),
  country: text("country"),
  city: text("city"),
  email: text("email"),
  phone: text("phone"),
  website: text("website"),
  linkedin: text("linkedin"),
  instagram: text("instagram"),
  facebook: text("facebook"),
  additionalContacts: text("additional_contacts").default("[]"),
  status: text("status").notNull().default("lead"),
  leadScore: real("lead_score").default(0),
  serviceTags: text("service_tags").default("[]"),
  currency: text("currency").default("EUR"),
  notes: text("notes"),
  source: text("source"),
  createdAt: now(),
  updatedAt: updatedAt(),
});

// ─── Contacts ────────────────────────────────────────────────────────────────

export const contacts = sqliteTable("contacts", {
  id: id(),
  clientId: text("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  role: text("role"),
  email: text("email"),
  phone: text("phone"),
  linkedin: text("linkedin"),
  isPrimary: integer("is_primary").notNull().default(0),
  notes: text("notes"),
  createdAt: now(),
});

// ─── Projects ────────────────────────────────────────────────────────────────

export const projects = sqliteTable("projects", {
  id: id(),
  clientId: text("client_id").references(() => clients.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("active"),
  serviceType: text("service_type").notNull(),
  checklist: text("checklist").default("[]"), // JSON: [{id, text, done}]
  price: real("price").default(0),
  expenses: real("expenses").default(0),
  currency: text("currency").default("EUR"),
  startDate: integer("start_date"),
  dueDate: integer("due_date"),
  completedAt: integer("completed_at"),
  createdAt: now(),
  updatedAt: updatedAt(),
});

// ─── Tasks ───────────────────────────────────────────────────────────────────

export const tasks = sqliteTable("tasks", {
  id: id(),
  projectId: text("project_id").references(() => projects.id, {
    onDelete: "set null",
  }),
  clientId: text("client_id").references(() => clients.id, {
    onDelete: "set null",
  }),
  assignedTo: text("assigned_to").references(() => users.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("todo"),
  priority: text("priority").notNull().default("medium"),
  dueDate: integer("due_date"),
  tags: text("tags").default("[]"),
  position: integer("position").default(0),
  completedAt: integer("completed_at"),
  createdAt: now(),
  updatedAt: updatedAt(),
});

// ─── Notes ───────────────────────────────────────────────────────────────────

export const notes = sqliteTable("notes", {
  id: id(),
  clientId: text("client_id").references(() => clients.id, {
    onDelete: "cascade",
  }),
  projectId: text("project_id").references(() => projects.id, {
    onDelete: "cascade",
  }),
  taskId: text("task_id").references(() => tasks.id, {
    onDelete: "cascade",
  }),
  content: text("content").notNull(),
  createdAt: now(),
  updatedAt: updatedAt(),
});

// ─── Invoices ────────────────────────────────────────────────────────────────

export const invoices = sqliteTable("invoices", {
  id: id(),
  clientId: text("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "restrict" }),
  projectId: text("project_id").references(() => projects.id, {
    onDelete: "set null",
  }),
  number: text("number").notNull().unique(),
  status: text("status").notNull().default("draft"),
  currency: text("currency").notNull().default("EUR"),
  subtotal: real("subtotal").notNull().default(0),
  taxRate: real("tax_rate").notNull().default(0),
  taxAmount: real("tax_amount").notNull().default(0),
  discount: real("discount").notNull().default(0),
  total: real("total").notNull().default(0),
  totalEur: real("total_eur"),
  exchangeRate: real("exchange_rate"),
  lineItems: text("line_items").default("[]"), // JSON
  notes: text("notes"),
  issueDate: integer("issue_date")
    .notNull()
    .default(sql`(unixepoch())`),
  dueDate: integer("due_date"),
  paidAt: integer("paid_at"),
  createdAt: now(),
  updatedAt: updatedAt(),
});

// ─── Recurring Revenue (Subscriptions & Retainers) ───────────────────────────

export const recurringRevenue = sqliteTable("recurring_revenue", {
  id: id(),
  clientId: text("client_id").references(() => clients.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(), // e.g. "Monthly AI Maintenance Retainer"
  frequency: text("frequency").notNull().default("monthly"), // monthly | yearly | quarterly
  currency: text("currency").notNull().default("EUR"),
  amount: real("amount").notNull(),
  status: text("status").notNull().default("active"), // active | paused | cancelled
  startDate: integer("start_date").notNull().default(sql`(unixepoch())`),
  nextBillingDate: integer("next_billing_date"),
  notes: text("notes"),
  createdAt: now(),
  updatedAt: updatedAt(),
});

// ─── Transactions ────────────────────────────────────────────────────────────

export const transactions = sqliteTable("transactions", {
  id: id(),
  invoiceId: text("invoice_id").references(() => invoices.id, {
    onDelete: "set null",
  }),
  type: text("type").notNull(), // income | expense
  category: text("category"),
  currency: text("currency").notNull().default("EUR"),
  amount: real("amount").notNull(),
  amountEur: real("amount_eur"),
  exchangeRate: real("exchange_rate"),
  date: integer("date")
    .notNull()
    .default(sql`(unixepoch())`),
  description: text("description"),
  notes: text("notes"),
  createdAt: now(),
});

// ─── Bookmarks ───────────────────────────────────────────────────────────────

export const bookmarks = sqliteTable("bookmarks", {
  id: id(),
  url: text("url").notNull(),
  title: text("title"),
  description: text("description"),
  faviconUrl: text("favicon_url"),
  ogImage: text("og_image"),
  category: text("category").notNull().default("info"), // tools | articles | my_projects | info
  tags: text("tags").default("[]"),
  isPinned: integer("is_pinned").notNull().default(0),
  createdAt: now(),
  updatedAt: updatedAt(),
});

// ─── Leads ───────────────────────────────────────────────────────────────────

export const leads = sqliteTable("leads", {
  id: id(),
  companyName: text("company_name").notNull(),
  website: text("website"),
  industry: text("industry"),
  country: text("country"),
  city: text("city"),
  companySize: text("company_size"),
  email: text("email"),
  phone: text("phone"),
  linkedin: text("linkedin"),
  decisionMaker: text("decision_maker"),
  decisionMakerRole: text("decision_maker_role"),
  decisionMakers: text("decision_makers").default("[]"), // JSON: [{name, role, email, phone}]
  additionalPhones: text("additional_phones").default("[]"), // JSON: string[]
  additionalEmails: text("additional_emails").default("[]"), // JSON: string[]
  techStack: text("tech_stack").default("[]"),
  securityIssues: text("security_issues").default("[]"),
  whoisData: text("whois_data").default("{}"),
  shodanData: text("shodan_data").default("{}"),
  sslData: text("ssl_data").default("{}"),
  headersData: text("headers_data").default("{}"),
  leadScore: real("lead_score").default(0),
  scoreBreakdown: text("score_breakdown").default("{}"),
  stage: text("stage").notNull().default("discovered"),
  serviceMatch: text("service_match").default("[]"),
  outreachStatus: text("outreach_status").default("none"),
  outreachDate: integer("outreach_date"),
  followUpDate: integer("follow_up_date"),
  source: text("source"),
  notes: text("notes"),
  convertedClientId: text("converted_client_id").references(
    () => clients.id,
    { onDelete: "set null" }
  ),
  createdAt: now(),
  updatedAt: updatedAt(),
});

// ─── Outreach Log ─────────────────────────────────────────────────────────────

export const outreachLog = sqliteTable("outreach_log", {
  id: id(),
  leadId: text("lead_id")
    .notNull()
    .references(() => leads.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // email | call | meeting | note
  subject: text("subject"),
  content: text("content"),
  status: text("status").default("sent"),
  date: integer("date")
    .notNull()
    .default(sql`(unixepoch())`),
  createdAt: now(),
});

// ─── Calendar Events ─────────────────────────────────────────────────────────

export const calendarEvents = sqliteTable("calendar_events", {
  id: id(),
  clientId: text("client_id").references(() => clients.id, {
    onDelete: "set null",
  }),
  taskId: text("task_id").references(() => tasks.id, {
    onDelete: "set null",
  }),
  leadId: text("lead_id").references(() => leads.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").default("meeting"),
  startAt: integer("start_at").notNull(),
  endAt: integer("end_at").notNull(),
  allDay: integer("all_day").notNull().default(0),
  recurrence: text("recurrence"),
  remindAt: integer("remind_at"),
  createdAt: now(),
});

// ─── Audit Sessions ───────────────────────────────────────────────────────────

export const auditSessions = sqliteTable("audit_sessions", {
  id: id(),
  clientId: text("client_id").references(() => clients.id, {
    onDelete: "set null",
  }),
  projectId: text("project_id").references(() => projects.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  level: text("level").notNull(), // black_box | user | admin | full
  status: text("status").notNull().default("in_progress"),
  findings: text("findings").default("[]"),
  checklist: text("checklist").default("{}"),
  scope: text("scope"),
  notes: text("notes"),
  startedAt: integer("started_at")
    .notNull()
    .default(sql`(unixepoch())`),
  completedAt: integer("completed_at"),
  createdAt: now(),
  updatedAt: updatedAt(),
});

// ─── API Keys ─────────────────────────────────────────────────────────────────

export const apiKeys = sqliteTable("api_keys", {
  id: id(),
  provider: text("provider").notNull().unique(),
  apiKey: text("api_key").notNull(),
  isActive: integer("is_active").notNull().default(1),
  notes: text("notes"),
  lastUsed: integer("last_used"),
  createdAt: now(),
});

// ─── Settings ─────────────────────────────────────────────────────────────────

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey().notNull(),
  value: text("value").notNull(),
  updatedAt: updatedAt(),
});

// ─── Activity Logs ────────────────────────────────────────────────────────────

export const activityLogs = sqliteTable("activity_logs", {
  id: id(),
  entityType: text("entity_type").notNull(), // task | project | client | lead | invoice
  entityId: text("entity_id"),
  action: text("action").notNull(), // completed | created | updated | contacted
  title: text("title").notNull(),
  metadata: text("metadata").default("{}"),
  createdAt: now(),
});

// ─── Types ───────────────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type Client = typeof clients.$inferSelect;
export type Contact = typeof contacts.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type Note = typeof notes.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type RecurringRevenue = typeof recurringRevenue.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Bookmark = typeof bookmarks.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type OutreachLog = typeof outreachLog.$inferSelect;
export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type AuditSession = typeof auditSessions.$inferSelect;
export type ApiKey = typeof apiKeys.$inferSelect;
export type Setting = typeof settings.$inferSelect;
export type ActivityLog = typeof activityLogs.$inferSelect;
