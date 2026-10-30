import React, { useState } from "react";
import { Lock, KeyRound, Check, ShieldAlert, Eye, EyeOff } from "lucide-react";
import { useSecurityLockStore } from "@/store/useSecurityLockStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "set" | "change" | "remove";
}

export function PasswordManagerModal({ open, onOpenChange, mode }: Props) {
  const {
    isPasswordConfigured,
    setMasterPassword,
    removeMasterPassword,
  } = useSecurityLockStore();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === "set") {
        if (newPassword.length < 4) {
          setError("Password must be at least 4 characters long.");
          setIsSubmitting(false);
          return;
        }
        if (newPassword !== confirmPassword) {
          setError("Passwords do not match.");
          setIsSubmitting(false);
          return;
        }
        await setMasterPassword(newPassword);
        resetForm();
        onOpenChange(false);
      } else if (mode === "change") {
        if (newPassword.length < 4) {
          setError("New password must be at least 4 characters long.");
          setIsSubmitting(false);
          return;
        }
        if (newPassword !== confirmPassword) {
          setError("New passwords do not match.");
          setIsSubmitting(false);
          return;
        }
        const ok = await removeMasterPassword(currentPassword);
        if (!ok) {
          setError("Incorrect current password.");
          setIsSubmitting(false);
          return;
        }
        await setMasterPassword(newPassword);
        resetForm();
        onOpenChange(false);
      } else if (mode === "remove") {
        const ok = await removeMasterPassword(currentPassword);
        if (!ok) {
          setError("Incorrect current password.");
          setIsSubmitting(false);
          return;
        }
        resetForm();
        onOpenChange(false);
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) resetForm();
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            {mode === "set" && "Set Master Password"}
            {mode === "change" && "Change Master Password"}
            {mode === "remove" && "Remove Password Protection"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2 text-xs">
          {mode === "remove" ? (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Removing master password protection will allow anyone with access to this computer to open the CRM without authentication.
                </span>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">
                  Current Master Password *
                </label>
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter current password..."
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {mode === "change" && (
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">
                    Current Password *
                  </label>
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter current password..."
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">
                  {mode === "change" ? "New Master Password *" : "Master Password *"}
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Min 4 characters..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">
                  Confirm Password *
                </label>
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Re-type password..."
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
          )}

          {error && (
            <p className="text-xs text-destructive font-medium bg-destructive/10 p-2 rounded border border-destructive/20">
              {error}
            </p>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              variant={mode === "remove" ? "destructive" : "default"}
            >
              {mode === "set" && "Set Password & Protect Vault"}
              {mode === "change" && "Update Password"}
              {mode === "remove" && "Confirm & Remove Password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
