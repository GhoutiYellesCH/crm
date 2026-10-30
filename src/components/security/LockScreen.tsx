import React, { useState } from "react";
import { Lock, Unlock, KeyRound, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useSecurityLockStore } from "@/store/useSecurityLockStore";
import { AegisFlowLogo } from "@/components/common/AegisFlowLogo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function LockScreen() {
  const { isLocked, unlock, isLoading } = useSecurityLockStore();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isLocked || isLoading) return null;

  const handleUnlock = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!password.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(false);

    try {
      const ok = await unlock(password);
      if (!ok) {
        setError(true);
        setPassword("");
      }
    } catch {
      setError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/95 backdrop-blur-xl px-4 select-none">
      <div className="w-full max-w-sm flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Animated Shield Logo */}
        <div className="relative">
          <div className="absolute -inset-4 bg-primary/20 rounded-full blur-2xl animate-pulse" />
          <AegisFlowLogo size={72} />
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-sky-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            AegisFlow CRM
          </h1>
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground font-medium">
            <Lock className="w-3.5 h-3.5 text-primary" />
            <span>Workspace Vault Locked</span>
          </div>
        </div>

        {/* Unlock Form */}
        <form onSubmit={handleUnlock} className="w-full space-y-3">
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              autoFocus
              placeholder="Enter master password..."
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(false);
              }}
              className={`h-10 pr-10 text-center tracking-wider text-sm transition-all ${
                error
                  ? "border-destructive ring-1 ring-destructive animate-shake"
                  : "focus-visible:ring-primary"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          {error && (
            <p className="text-xs text-destructive font-medium flex items-center justify-center gap-1">
              <span>Incorrect master password. Please try again.</span>
            </p>
          )}

          <Button
            type="submit"
            disabled={!password || isSubmitting}
            className="w-full h-10 gap-2 font-semibold shadow-md"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Verifying...
              </span>
            ) : (
              <>
                <Unlock className="w-4 h-4" />
                Unlock Workspace
              </>
            )}
          </Button>

          <p className="text-[11px] text-muted-foreground/70">
            Press <kbd className="px-1 py-0.5 rounded bg-muted text-[10px] border border-border">Enter ↵</kbd> to unlock
          </p>
        </form>

        {/* Security Badge */}
        <div className="pt-4 flex items-center gap-2 text-[11px] text-muted-foreground border-t border-border/50">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Local offline zero-knowledge cryptographic vault</span>
        </div>
      </div>
    </div>
  );
}
