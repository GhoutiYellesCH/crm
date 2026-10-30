import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Settings as SettingsIcon,
  Key,
  Users,
  Palette,
  Globe,
  Plus,
  Trash2,
  Check,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useUIStore } from "@/store/useUIStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { LANGUAGES } from "@/lib/utils";

const API_PROVIDERS = [
  { id: "hunter_io", label: "Hunter.io (Email Finder)", doc: "hunter.io/api" },
  { id: "shodan", label: "Shodan (Ports & Vulnerabilities)", doc: "shodan.io" },
  { id: "google_maps", label: "Google Maps / Places API", doc: "cloud.google.com" },
  { id: "apollo", label: "Apollo.io (B2B Leads)", doc: "apollo.io" },
  { id: "wappalyzer", label: "Wappalyzer (Tech Stack)", doc: "wappalyzer.com" },
];

export default function Settings() {
  const { t } = useTranslation();
  const { theme, language, setTheme, setLanguage } = useUIStore();
  const { users, apiKeys, loadData, saveUser, removeUser, saveKey, removeKey } =
    useSettingsStore();

  // User modal
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState<"owner" | "member" | "viewer">("member");

  // API Key modal
  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState("hunter_io");
  const [keyValue, setKeyValue] = useState("");
  const [keyNotes, setKeyNotes] = useState("");
  const [showPlainKeys, setShowPlainKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;
    await saveUser({
      name: userName.trim(),
      email: userEmail.trim() || undefined,
      role: userRole,
    });
    setUserName("");
    setUserEmail("");
    setUserModalOpen(false);
  };

  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyValue.trim()) return;
    await saveKey(selectedProvider, keyValue.trim(), keyNotes.trim() || undefined);
    setKeyValue("");
    setKeyNotes("");
    setKeyModalOpen(false);
  };

  const toggleShowKey = (id: string) => {
    setShowPlainKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 text-primary" />
          {t("settings.title")}
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Appearance, team collaborator profiles, and lead generation API credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Appearance */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Palette className="h-4 w-4 text-primary" />
              {t("settings.theme")}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button
              variant={theme === "dark" ? "default" : "outline"}
              size="sm"
              className="text-xs h-8"
              onClick={() => setTheme("dark")}
            >
              🌙 {t("theme.dark")} (Default)
            </Button>
            <Button
              variant={theme === "light" ? "default" : "outline"}
              size="sm"
              className="text-xs h-8"
              onClick={() => setTheme("light")}
            >
              ☀️ {t("theme.light")}
            </Button>
          </CardContent>
        </Card>

        {/* Language */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              {t("settings.language")}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2 flex-wrap">
            {LANGUAGES.map((lang) => (
              <Button
                key={lang.code}
                variant={language === lang.code ? "default" : "outline"}
                size="sm"
                className="text-xs h-8 gap-1.5"
                onClick={() => setLanguage(lang.code as any)}
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
                {language === lang.code && <Check className="h-3 w-3 text-primary" />}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Team Collaborator Profiles (Local) */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Local Team Collaborators ({users.length})
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1"
              onClick={() => setUserModalOpen(true)}
            >
              <Plus className="h-3 w-3" />
              Add Member
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {users.map((u) => (
              <div
                key={u.id}
                className="p-3 rounded-lg border border-border/50 bg-card/60 flex items-start justify-between gap-2 text-xs"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground truncate">
                      {u.name}
                    </span>
                    <Badge variant="secondary" className="text-[9px] uppercase font-mono">
                      {u.role}
                    </Badge>
                  </div>
                  {u.email && (
                    <p className="text-[11px] text-muted-foreground truncate">
                      {u.email}
                    </p>
                  )}
                </div>

                {u.id !== "owner-default" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0"
                    onClick={() => removeUser(u.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* API Key Credentials Storage */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Key className="h-4 w-4 text-primary" />
                Lead Generation & OSINT API Keys
              </CardTitle>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Keys are stored locally in your SQLite database on this machine.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1"
              onClick={() => setKeyModalOpen(true)}
            >
              <Plus className="h-3 w-3" />
              Configure Key
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {API_PROVIDERS.map((prov) => {
            const configured = apiKeys.find((k) => k.provider === prov.id);
            const isVisible = configured && showPlainKeys[configured.id];

            return (
              <div
                key={prov.id}
                className="p-2.5 rounded-lg border border-border/40 bg-card/40 flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">
                      {prov.label}
                    </span>
                    {configured ? (
                      <Badge variant="outline" className="text-[9px] bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                        ✓ Configured
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[9px] text-muted-foreground">
                        Not Set (OSINT default)
                      </Badge>
                    )}
                  </div>
                  {configured && (
                    <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
                      <span>
                        {isVisible
                          ? configured.apiKey
                          : `${configured.apiKey.slice(0, 4)}••••••••••••${configured.apiKey.slice(-4)}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleShowKey(configured.id)}
                        className="hover:text-foreground"
                      >
                        {isVisible ? (
                          <EyeOff className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {configured ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => removeKey(configured.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-[10px]"
                      onClick={() => {
                        setSelectedProvider(prov.id);
                        setKeyModalOpen(true);
                      }}
                    >
                      Add Key
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Add User Modal */}
      <Dialog open={userModalOpen} onOpenChange={setUserModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Team Collaborator</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">Name *</label>
              <Input
                required
                placeholder="Team member name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">Email</label>
              <Input
                type="email"
                placeholder="colleague@domain.com"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">Role</label>
              <select
                className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as any)}
              >
                <option value="member">Member (Tasks & Projects)</option>
                <option value="viewer">Viewer (Read-only)</option>
                <option value="owner">Owner (Full access)</option>
              </select>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setUserModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Member</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add API Key Modal */}
      <Dialog open={keyModalOpen} onOpenChange={setKeyModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Configure API Credential</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveApiKey} className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">Provider</label>
              <select
                className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs shadow-sm"
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
              >
                {API_PROVIDERS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">API Key *</label>
              <Input
                required
                type="password"
                placeholder="Paste your API key here..."
                value={keyValue}
                onChange={(e) => setKeyValue(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">Notes / Rate Limit Plan</label>
              <Input
                placeholder="e.g. Free Tier (25 queries/month)"
                value={keyNotes}
                onChange={(e) => setKeyNotes(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setKeyModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Credential</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
