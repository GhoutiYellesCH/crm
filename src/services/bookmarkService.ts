import { getDatabase } from "@/db/client";
import { generateId, nowUnix, safeJson } from "@/lib/utils";
import type { Bookmark } from "@/db/schema";

export interface BookmarkWithDetails extends Bookmark {
  parsedTags: string[];
}

export const BOOKMARK_CATEGORIES = [
  { id: "tools", label: "Dev & Security Tools", icon: "🔧" },
  { id: "articles", label: "Articles & Research", icon: "📰" },
  { id: "my_projects", label: "My Projects & Repos", icon: "🚀" },
  { id: "info", label: "Documentation & Cheatsheets", icon: "📋" },
] as const;

export type BookmarkCategory = (typeof BOOKMARK_CATEGORIES)[number]["id"];

export async function fetchBookmarks(): Promise<BookmarkWithDetails[]> {
  const db = await getDatabase();
  const rows = await db.select<Bookmark[]>(
    "SELECT * FROM bookmarks ORDER BY is_pinned DESC, updated_at DESC"
  );

  return rows.map((b) => ({
    ...b,
    parsedTags: safeJson<string[]>(b.tags, []),
  }));
}

export interface UpsertBookmarkInput {
  id?: string;
  url: string;
  title?: string | null;
  description?: string | null;
  faviconUrl?: string | null;
  ogImage?: string | null;
  category: string;
  tags?: string[];
  isPinned?: boolean;
}

export async function saveBookmark(input: UpsertBookmarkInput): Promise<string> {
  const db = await getDatabase();
  const now = nowUnix();
  const tagsJson = JSON.stringify(input.tags || []);
  const isPinned = input.isPinned ? 1 : 0;

  if (input.id) {
    await db.execute(
      `UPDATE bookmarks SET
        url = $1, title = $2, description = $3, favicon_url = $4,
        og_image = $5, category = $6, tags = $7, is_pinned = $8,
        updated_at = $9
       WHERE id = $10`,
      [
        input.url,
        input.title || null,
        input.description || null,
        input.faviconUrl || null,
        input.ogImage || null,
        input.category,
        tagsJson,
        isPinned,
        now,
        input.id,
      ]
    );
    return input.id;
  } else {
    const newId = generateId();
    await db.execute(
      `INSERT INTO bookmarks (
        id, url, title, description, favicon_url, og_image,
        category, tags, is_pinned, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        newId,
        input.url,
        input.title || null,
        input.description || null,
        input.faviconUrl || null,
        input.ogImage || null,
        input.category,
        tagsJson,
        isPinned,
        now,
        now,
      ]
    );
    return newId;
  }
}

export async function togglePinBookmark(id: string, isPinned: boolean): Promise<void> {
  const db = await getDatabase();
  await db.execute(
    "UPDATE bookmarks SET is_pinned = $1, updated_at = $2 WHERE id = $3",
    [isPinned ? 1 : 0, nowUnix(), id]
  );
}

export async function deleteBookmark(id: string): Promise<void> {
  const db = await getDatabase();
  await db.execute("DELETE FROM bookmarks WHERE id = $1", [id]);
}

/** Extract basic metadata like favicon from URL */
export function deriveFavicon(urlStr: string): string {
  try {
    const u = new URL(urlStr.startsWith("http") ? urlStr : `https://${urlStr}`);
    return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=64`;
  } catch {
    return "";
  }
}
