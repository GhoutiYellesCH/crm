import { getDatabase } from "@/db/client";
import { generateId, nowUnix, safeJson } from "@/lib/utils";
import type { Client, Contact, Note } from "@/db/schema";

export interface ClientWithDetails extends Client {
  contacts?: Contact[];
  notesList?: Note[];
  parsedTags: string[];
}

export async function fetchClients(): Promise<ClientWithDetails[]> {
  const db = await getDatabase();
  const rows = await db.select<Client[]>(
    "SELECT * FROM clients ORDER BY updated_at DESC"
  );

  return rows.map((client) => ({
    ...client,
    parsedTags: safeJson<string[]>(client.serviceTags, []),
  }));
}

export async function fetchClientById(id: string): Promise<ClientWithDetails | null> {
  const db = await getDatabase();
  const rows = await db.select<Client[]>(
    "SELECT * FROM clients WHERE id = $1 LIMIT 1",
    [id]
  );
  if (!rows || rows.length === 0) return null;

  const client = rows[0];
  const contacts = await db.select<Contact[]>(
    "SELECT * FROM contacts WHERE client_id = $1 ORDER BY is_primary DESC, created_at ASC",
    [id]
  );
  const notesList = await db.select<Note[]>(
    "SELECT * FROM notes WHERE client_id = $1 ORDER BY created_at DESC",
    [id]
  );

  return {
    ...client,
    contacts,
    notesList,
    parsedTags: safeJson<string[]>(client.serviceTags, []),
  };
}

export interface UpsertClientInput {
  id?: string;
  name: string;
  company?: string | null;
  companySize?: string | null;
  industry?: string | null;
  country?: string | null;
  city?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  linkedin?: string | null;
  status: string;
  leadScore?: number;
  serviceTags: string[];
  currency?: string;
  notes?: string | null;
  source?: string | null;
}

export async function saveClient(input: UpsertClientInput): Promise<string> {
  const db = await getDatabase();
  const now = nowUnix();
  const tagsJson = JSON.stringify(input.serviceTags || []);

  if (input.id) {
    await db.execute(
      `UPDATE clients SET
        name = $1, company = $2, company_size = $3, industry = $4,
        country = $5, city = $6, email = $7, phone = $8,
        website = $9, linkedin = $10, status = $11, lead_score = $12,
        service_tags = $13, currency = $14, notes = $15, source = $16,
        updated_at = $17
      WHERE id = $18`,
      [
        input.name,
        input.company || null,
        input.companySize || null,
        input.industry || null,
        input.country || null,
        input.city || null,
        input.email || null,
        input.phone || null,
        input.website || null,
        input.linkedin || null,
        input.status,
        input.leadScore ?? 0,
        tagsJson,
        input.currency || "EUR",
        input.notes || null,
        input.source || null,
        now,
        input.id,
      ]
    );
    return input.id;
  } else {
    const newId = generateId();
    await db.execute(
      `INSERT INTO clients (
        id, name, company, company_size, industry, country, city,
        email, phone, website, linkedin, status, lead_score,
        service_tags, currency, notes, source, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
      [
        newId,
        input.name,
        input.company || null,
        input.companySize || null,
        input.industry || null,
        input.country || null,
        input.city || null,
        input.email || null,
        input.phone || null,
        input.website || null,
        input.linkedin || null,
        input.status,
        input.leadScore ?? 0,
        tagsJson,
        input.currency || "EUR",
        input.notes || null,
        input.source || null,
        now,
        now,
      ]
    );
    return newId;
  }
}

export async function deleteClient(id: string): Promise<void> {
  const db = await getDatabase();
  await db.execute("DELETE FROM clients WHERE id = $1", [id]);
}

export async function addClientContact(
  clientId: string,
  contact: { name: string; role?: string; email?: string; phone?: string; linkedin?: string; isPrimary?: boolean; notes?: string }
): Promise<string> {
  const db = await getDatabase();
  const id = generateId();
  const now = nowUnix();

  if (contact.isPrimary) {
    await db.execute("UPDATE contacts SET is_primary = 0 WHERE client_id = $1", [clientId]);
  }

  await db.execute(
    `INSERT INTO contacts (id, client_id, name, role, email, phone, linkedin, is_primary, notes, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      id,
      clientId,
      contact.name,
      contact.role || null,
      contact.email || null,
      contact.phone || null,
      contact.linkedin || null,
      contact.isPrimary ? 1 : 0,
      contact.notes || null,
      now,
    ]
  );
  return id;
}

export async function deleteContact(contactId: string): Promise<void> {
  const db = await getDatabase();
  await db.execute("DELETE FROM contacts WHERE id = $1", [contactId]);
}

export async function addClientNote(clientId: string, content: string): Promise<string> {
  const db = await getDatabase();
  const id = generateId();
  const now = nowUnix();

  await db.execute(
    "INSERT INTO notes (id, client_id, content, created_at, updated_at) VALUES ($1, $2, $3, $4, $5)",
    [id, clientId, content, now, now]
  );

  await db.execute("UPDATE clients SET updated_at = $1 WHERE id = $2", [now, clientId]);
  return id;
}

export async function deleteNote(noteId: string): Promise<void> {
  const db = await getDatabase();
  await db.execute("DELETE FROM notes WHERE id = $1", [noteId]);
}
