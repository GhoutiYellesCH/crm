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
  Lock,
  Unlock,
  FolderOpen,
  HardDrive,
  Save,
  RotateCcw,
  Usb,
  Clock,
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
import { useSecurityLockStore } from "@/store/useSecurityLockStore";
import { securityService } from "@/services/securityService";
import { PasswordManagerModal } from "@/components/security/PasswordManagerModal";
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

  // Security Lock store
  const {
    isPasswordConfigured,
    autoLockMinutes,
    setAutoLockMinutes,
    lock,
    dbInfo,
    usbDrives,
    refreshDbInfo,
    detectUsbDrives,
    createBackup,
    restoreBackup,
  } = useSecurityLockStore();

  // Password Modal
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordModalMode, setPasswordModalMode] = useState<"set" | "change" | "remove">("set");

  // Restore Modal
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [restorePath, setRestorePath] = useState("");
  const [backupFeedback, setBackupFeedback] = useState<string | null>(null);
  const [isBackingUp, setIsBackingUp] = useState(false);

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
    refreshDbInfo();
    detectUsbDrives();
  }, [loadData, refreshDbInfo, detectUsbDrives]);

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

  const handleCreateLocalBackup = async () => {
    setIsBackingUp(true);
    try {
      const savedPath = await createBackup();
      setBackupFeedback(`✓ Local backup created: ${savedPath}`);
      setTimeout(() => setBackupFeedback(null), 6000);
    } catch (err) {
      setBackupFeedback(`❌ Backup failed: ${err}`);
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleUsbBackup = async (drivePath: string) => {
    setIsBackingUp(true);
    try {
      const savedPath = await createBackup(drivePath);
      setBackupFeedback(`✓ USB backup created: ${savedPath}`);
      setTimeout(() => setBackupFeedback(null), 8000);
    } catch (err) {
      setBackupFeedback(`❌ USB backup failed: ${err}`);
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restorePath.trim()) return;
    try {
      const msg = await restoreBackup(restorePath.trim());
      setBackupFeedback(`✓ ${msg}`);
      setRestoreModalOpen(false);
      setRestorePath("");
    } catch (err) {
      setBackupFeedback(`❌ Restore failed: ${err}`);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 text-primary" />
          {t("settings.title")}
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          App security vault, data storage & USB backups, team collaborator profiles, and API credentials.
        </p>
      </div>

      {backupFeedback && (
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/30 text-xs font-medium text-foreground animate-in fade-in duration-200">
          {backupFeedback}
        </div>
      )}

      {/* Row 1: Appearance & Language */}
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

      {/* Row 2: Security & Master Password (App Lock) */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              Security & Master Password App Lock
            </CardTitle>
            {isPasswordConfigured ? (
              <Badge variant="outline" className="text-[10px] bg-emerald-500/15 text-emerald-400 border-emerald-500/30 gap-1">
                <Check className="w-3 h-3" /> Password Protected
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] bg-amber-500/15 text-amber-400 border-amber-500/30">
                Unlocked (No Password)
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <p className="text-muted-foreground leading-relaxed">
            Protect your client information, invoices, security audit reports, and financial accounts with an offline zero-knowledge master password.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            {!isPasswordConfigured ? (
              <Button
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={() => {
                  setPasswordModalMode("set");
                  setPasswordModalOpen(true);
                }}
              >
                <Lock className="w-3.5 h-3.5" />
                Enable Master Password
              </Button>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs gap-1.5"
                  onClick={lock}
                >
                  <Lock className="w-3.5 h-3.5 text-primary" />
                  Lock App Now
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs gap-1.5"
                  onClick={() => {
                    setPasswordModalMode("change");
                    setPasswordModalOpen(true);
                  }}
                >
                  Change Password
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    setPasswordModalMode("remove");
                    setPasswordModalOpen(true);
                  }}
                >
                  Remove Password
                </Button>
              </>
            )}

            {/* Inactivity Auto-Lock Dropdown */}
            {isPasswordConfigured && (
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-muted-foreground flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-primary" /> Auto-Lock:
                </span>
                <select
                  value={autoLockMinutes}
                  onChange={(e) => setAutoLockMinutes(parseInt(e.target.value, 10))}
                  className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value={0}>Never</option>
                  <option value={5}>After 5 minutes</option>
                  <option value={15}>After 15 minutes</option>
                  <option value={30}>After 30 minutes</option>
                  <option value={60}>After 1 hour</option>
                </select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Row 3: Database Storage & USB Backup Management (~/.config/aegisflow) */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-primary" />
              Database Storage & USB Backups
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1.5"
              onClick={() => securityService.openDataDirectory()}
            >
              <FolderOpen className="h-3.5 w-3.5 text-primary" />
              Open Data Folder
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 rounded-lg border border-border/50 bg-card/60">
            <div className="space-y-1">
              <span className="text-muted-foreground block text-[11px] font-semibold uppercase tracking-wider">
                Active Database Path
              </span>
              <p className="font-mono text-xs text-foreground break-all">
                {dbInfo?.dbPath || "~/.config/aegisflow/crm.db"}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground block text-[11px] font-semibold uppercase tracking-wider">
                Database Size
              </span>
              <p className="font-mono text-xs text-foreground">
                {dbInfo ? formatBytes(dbInfo.sizeBytes) : "Loading..."}
              </p>
            </div>
          </div>

          {/* Backup Actions */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                disabled={isBackingUp}
                onClick={handleCreateLocalBackup}
                className="h-8 text-xs gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                Create Local Backup (.db)
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setRestoreModalOpen(true)}
                className="h-8 text-xs gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Restore Backup from File
              </Button>
            </div>

            {/* USB Drives Detection */}
            <div className="pt-2 border-t border-border/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Usb className="w-4 h-4 text-primary" />
                  USB Removable Drives for Offline Backup:
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[11px] px-2 text-primary"
                  onClick={() => detectUsbDrives()}
                >
                  Scan for USBs
                </Button>
              </div>

              {usbDrives.length === 0 ? (
                <p className="text-[11px] text-muted-foreground/80 italic">
                  No mounted USB flash drives detected in /media or /run/media. Plug in a USB drive and click "Scan for USBs" to create a 1-click external backup.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {usbDrives.map((usb) => (
                    <div
                      key={usb.path}
                      className="p-2.5 rounded-lg border border-border/40 bg-card/40 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <span className="font-semibold text-foreground truncate block">
                          💾 {usb.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono truncate block">
                          {usb.path}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="default"
                        disabled={isBackingUp}
                        className="h-7 text-[11px] px-2.5 shrink-0"
                        onClick={() => handleUsbBackup(usb.path)}
                      >
                        Backup to USB
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Row 4: Team Collaborator Profiles (Local) */}
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

      {/* Row 5: API Key Credentials Storage */}
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
                      <span>{isVisible ? configured.apiKey : "••••••••••••••••••••••••"}</span>
                      <button
                        type="button"
                        onClick={() => toggleShowKey(configured.id)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {isVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {configured && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => removeKey(configured.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-[11px] px-2.5"
                    onClick={() => {
                      setSelectedProvider(prov.id);
                      setKeyValue(configured?.apiKey || "");
                      setKeyNotes(configured?.notes || "");
                      setKeyModalOpen(true);
                    }}
                  >
                    {configured ? "Update" : "Set Key"}
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Password Manager Modal */}
      <PasswordManagerModal
        open={passwordModalOpen}
        onOpenChange={setPasswordModalOpen}
        mode={passwordModalMode}
      />

      {/* Restore Database Modal */}
      <Dialog open={restoreModalOpen} onOpenChange={setRestoreModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-primary" />
              Restore Database from File
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRestoreSubmit} className="space-y-4 py-2 text-xs">
            <p className="text-muted-foreground leading-relaxed">
              Enter the full path to a backup SQLite database file (e.g. from your USB drive or local backups folder). A safety snapshot of your current database will be saved automatically prior to replacement.
            </p>
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">
                Backup File Path (.db) *
              </label>
              <Input
                required
                placeholder="/media/gotoro/USB_NAME/aegisflow-backup.db"
                value={restorePath}
                onChange={(e) => setRestorePath(e.target.value)}
              />
            </div>
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setRestoreModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="destructive">
                Confirm & Restore Database
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* User Modal */}
      <Dialog open={userModalOpen} onOpenChange={setUserModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Local Team Member</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">Name *</label>
              <Input
                required
                placeholder="e.g. Sarah Connor"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">Email</label>
              <Input
                type="email"
                placeholder="sarah@agency.local"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">Role</label>
              <select
                className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as any)}
              >
                <option value="member">Member (Collaborator)</option>
                <option value="owner">Owner (Admin)</option>
                <option value="viewer">Viewer (Read-only)</option>
              </select>
            </div>
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setUserModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Add Collaborator</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* API Key Modal */}
      <Dialog open={keyModalOpen} onOpenChange={setKeyModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Configure API Credential</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveApiKey} className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">Provider</label>
              <select
                className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
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
                placeholder="sk_live_... or token"
                value={keyValue}
                onChange={(e) => setKeyValue(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">Notes (Optional)</label>
              <Input
                placeholder="Free tier, personal account..."
                value={keyNotes}
                onChange={(e) => setKeyNotes(e.target.value)}
              />
            </div>
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setKeyModalOpen(false)}
              >
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
