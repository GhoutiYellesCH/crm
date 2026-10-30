import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Bookmark,
  Plus,
  Search,
  ExternalLink,
  Pin,
  Trash2,
  Edit,
  Tag,
  Globe,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useBookmarkStore } from "@/store/useBookmarkStore";
import { BookmarkForm } from "./BookmarkForm";
import { BOOKMARK_CATEGORIES } from "@/services/bookmarkService";
import { formatDate } from "@/lib/utils";

export default function BookmarkHub() {
  const { t } = useTranslation();
  const {
    bookmarks,
    isLoading,
    selectedCategory,
    searchQuery,
    loadBookmarks,
    saveBookmarkData,
    togglePin,
    removeBookmark,
    setSelectedCategory,
    setSearchQuery,
  } = useBookmarkStore();

  const [formOpen, setFormOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<any>(null);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  const handleCreateNew = () => {
    setEditingBookmark(null);
    setFormOpen(true);
  };

  const handleEdit = (b: any) => {
    setEditingBookmark(b);
    setFormOpen(true);
  };

  // Filtered bookmarks
  const filtered = bookmarks.filter((b) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (b.title && b.title.toLowerCase().includes(q)) ||
      b.url.toLowerCase().includes(q) ||
      (b.description && b.description.toLowerCase().includes(q)) ||
      b.parsedTags.some((t) => t.toLowerCase().includes(q));

    const matchesCategory =
      selectedCategory === "all" || b.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Bookmark className="h-6 w-6 text-primary" />
            {t("bookmark.title")}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Curated repository for dev/security tools, articles, your projects, and documentation.
          </p>
        </div>

        <Button onClick={handleCreateNew} size="sm" className="gap-2 shadow-sm">
          <Plus className="h-4 w-4" />
          {t("bookmark.new")}
        </Button>
      </div>

      {/* Filter and Category Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            size="sm"
            className="h-8 text-xs shrink-0"
            onClick={() => setSelectedCategory("all")}
          >
            All Resources ({bookmarks.length})
          </Button>
          {BOOKMARK_CATEGORIES.map((cat) => {
            const count = bookmarks.filter((b) => b.category === cat.id).length;
            return (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                size="sm"
                className="h-8 text-xs shrink-0 gap-1.5"
                onClick={() => setSelectedCategory(cat.id)}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span className="opacity-60 text-[10px]">({count})</span>
              </Button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search bookmarks or #tag..."
            className="pl-8 h-8 text-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Bookmarks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <p className="col-span-full text-xs text-muted-foreground text-center py-10">
            Loading bookmarks...
          </p>
        ) : filtered.length === 0 ? (
          <div className="col-span-full border border-dashed rounded-lg p-12 text-center text-muted-foreground">
            <Bookmark className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">No bookmarks found</p>
            <p className="text-xs mt-1 opacity-70">
              {searchQuery || selectedCategory !== "all"
                ? "Try adjusting your search query or category"
                : "Add your first developer tool, article, or project repository above."}
            </p>
          </div>
        ) : (
          filtered.map((item) => {
            const catObj =
              BOOKMARK_CATEGORIES.find((c) => c.id === item.category) ||
              BOOKMARK_CATEGORIES[0];

            return (
              <Card
                key={item.id}
                className={`border transition-all flex flex-col justify-between group ${
                  item.isPinned === 1
                    ? "border-amber-500/40 bg-card shadow-xs"
                    : "border-border/60 hover:border-border hover:bg-card/80"
                }`}
              >
                <CardContent className="p-4 space-y-3">
                  {/* Top Bar: Icon, Domain & Actions */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {item.faviconUrl ? (
                        <img
                          src={item.faviconUrl}
                          alt=""
                          className="h-4 w-4 rounded shrink-0 object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                      <span className="text-[11px] font-mono text-muted-foreground truncate">
                        {(() => {
                          try {
                            return new URL(item.url).hostname;
                          } catch {
                            return item.url;
                          }
                        })()}
                      </span>
                    </div>

                    <div className="flex items-center gap-0.5 shrink-0">
                      {/* Pin button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-6 w-6 ${
                          item.isPinned === 1
                            ? "text-amber-400 hover:text-amber-300"
                            : "text-muted-foreground/40 hover:text-muted-foreground"
                        }`}
                        onClick={() => togglePin(item.id, item.isPinned === 1)}
                        title={item.isPinned === 1 ? "Unpin" : "Pin to top"}
                      >
                        <Pin className="h-3 w-3" />
                      </Button>

                      {/* Edit */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground/40 hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>

                      {/* Delete */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground/40 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          if (confirm(`Remove bookmark "${item.title || item.url}"?`)) {
                            removeBookmark(item.id);
                          }
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-semibold text-foreground hover:text-primary transition-colors flex items-center gap-1.5 group/link"
                    >
                      <span className="truncate">{item.title || item.url}</span>
                      <ExternalLink className="h-3 w-3 opacity-40 group-hover/link:opacity-100 shrink-0" />
                    </a>

                    {item.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Tags & Category */}
                  <div className="space-y-2 pt-2 border-t border-border/40">
                    <div className="flex items-center justify-between text-[10px]">
                      <Badge variant="secondary" className="text-[10px] font-normal">
                        {catObj.icon} {catObj.label}
                      </Badge>
                      <span className="text-muted-foreground">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>

                    {item.parsedTags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.parsedTags.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => setSearchQuery(tag)}
                            className="text-[9px] px-1.5 py-0.5 rounded bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            #{tag}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Form Modal */}
      <BookmarkForm
        open={formOpen}
        onOpenChange={setFormOpen}
        initialData={editingBookmark}
        onSave={async (data) => {
          await saveBookmarkData(data);
        }}
      />
    </div>
  );
}
