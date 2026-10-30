import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deriveFavicon, BOOKMARK_CATEGORIES } from "@/services/bookmarkService";
import type { BookmarkWithDetails, UpsertBookmarkInput } from "@/services/bookmarkService";

interface BookmarkFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: BookmarkWithDetails | null;
  onSave: (data: UpsertBookmarkInput) => Promise<void>;
}

export function BookmarkForm({
  open,
  onOpenChange,
  initialData,
  onSave,
}: BookmarkFormProps) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("tools");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isPinned, setIsPinned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setUrl(initialData.url);
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setCategory(initialData.category);
      setTags(initialData.parsedTags || []);
      setIsPinned(initialData.isPinned === 1);
    } else {
      setUrl("");
      setTitle("");
      setDescription("");
      setCategory("tools");
      setTags([]);
      setIsPinned(false);
    }
  }, [initialData, open]);

  // Handle URL change: auto-suggest title if empty
  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    if (!title && newUrl) {
      try {
        const u = new URL(newUrl.startsWith("http") ? newUrl : `https://${newUrl}`);
        const cleanHost = u.hostname.replace(/^www\./, "");
        setTitle(cleanHost.charAt(0).toUpperCase() + cleanHost.slice(1));
      } catch {}
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = tagInput.trim().replace(/,/g, "");
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
      }
      setTagInput("");
    }
  };

  const removeTag = (t: string) => {
    setTags(tags.filter((tag) => tag !== t));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    let finalUrl = url.trim();
    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
      finalUrl = `https://${finalUrl}`;
    }

    setIsSubmitting(true);
    try {
      const favicon = deriveFavicon(finalUrl);
      await onSave({
        id: initialData?.id,
        url: finalUrl,
        title: title.trim() || undefined,
        description: description.trim() || undefined,
        category,
        tags,
        faviconUrl: favicon,
        isPinned,
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Bookmark" : "Add Resource or Bookmark"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">
              Link / URL *
            </label>
            <Input
              required
              placeholder="https://github.com/..., shodan.io, or article URL"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">
              Title / Resource Name
            </label>
            <Input
              placeholder="e.g. Shodan Search Engine or OWASP Top 10"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">
                Category
              </label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {BOOKMARK_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1 flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer h-9 px-2 rounded-md border border-input bg-background text-xs">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="rounded border-input text-primary focus:ring-primary"
                />
                <span className="font-semibold text-muted-foreground">📌 Pin to Top</span>
              </label>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">
              Tags (press Enter or comma to add)
            </label>
            <Input
              placeholder="recon, ai, security, cheatsheet..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1.5">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 text-[10px] bg-secondary px-2 py-0.5 rounded-md text-secondary-foreground"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => removeTag(t)}
                      className="hover:text-destructive"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">
              Brief Description / What this is useful for
            </label>
            <textarea
              className="w-full min-h-[55px] rounded-md border border-input bg-background p-2 text-xs shadow-sm"
              placeholder="Why you bookmarked this, command tips, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : initialData ? "Save Changes" : "Save Bookmark"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
