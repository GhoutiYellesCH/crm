import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Mail,
  Phone,
  Globe,
  Linkedin,
  Instagram,
  Facebook,
  ExternalLink,
  MessageSquare,
  Copy,
  Check,
  Send,
} from "lucide-react";
import { openExternal, formatPhoneForWhatsApp } from "@/lib/openLink";

interface EmailActionMenuProps {
  email: string;
  className?: string;
  variant?: "pill" | "icon" | "text";
}

export function EmailActionMenu({
  email,
  className = "",
  variant = "pill",
}: EmailActionMenuProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openSystemMail = () => openExternal(`mailto:${email}`);
  const openGmail = () =>
    openExternal(`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`);
  const openOutlook = () =>
    openExternal(`https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(email)}`);
  const openYahoo = () =>
    openExternal(`https://compose.mail.yahoo.com/?to=${encodeURIComponent(email)}`);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={`inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer ${
            variant === "pill"
              ? "px-2.5 py-1 rounded-md bg-secondary/60 hover:bg-secondary border border-border/40"
              : ""
          } ${className}`}
        >
          <Mail className="h-3.5 w-3.5 text-blue-400 shrink-0" />
          <span className="truncate">{email}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56 text-xs">
        <DropdownMenuLabel className="text-[11px] text-muted-foreground">
          Email: {email}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={openSystemMail} className="gap-2 cursor-pointer">
          <Mail className="h-3.5 w-3.5 text-primary" />
          <span>System Mail Manager</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={openGmail} className="gap-2 cursor-pointer">
          <Globe className="h-3.5 w-3.5 text-red-400" />
          <span>Open in Gmail (Browser)</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={openOutlook} className="gap-2 cursor-pointer">
          <Globe className="h-3.5 w-3.5 text-blue-500" />
          <span>Open in Outlook Web</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={openYahoo} className="gap-2 cursor-pointer">
          <Globe className="h-3.5 w-3.5 text-purple-400" />
          <span>Open in Yahoo Mail</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleCopy} className="gap-2 cursor-pointer">
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy Email Address</span>
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface PhoneActionMenuProps {
  phone: string;
  className?: string;
  variant?: "pill" | "icon" | "text";
}

export function PhoneActionMenu({
  phone,
  className = "",
  variant = "pill",
}: PhoneActionMenuProps) {
  const [copied, setCopied] = useState(false);

  const cleanWaNumber = formatPhoneForWhatsApp(phone);

  const openWhatsAppWeb = () =>
    openExternal(`https://web.whatsapp.com/send?phone=${cleanWaNumber}`);
  const openWhatsAppApp = () =>
    openExternal(`whatsapp://send?phone=${cleanWaNumber}`);
  const openTelCall = () => openExternal(`tel:${phone.replace(/\s+/g, "")}`);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={`inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer ${
            variant === "pill"
              ? "px-2.5 py-1 rounded-md bg-secondary/60 hover:bg-secondary border border-border/40"
              : ""
          } ${className}`}
        >
          <Phone className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <span className="truncate">{phone}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56 text-xs">
        <DropdownMenuLabel className="text-[11px] text-muted-foreground">
          Phone: {phone}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={openWhatsAppWeb} className="gap-2 cursor-pointer font-medium text-emerald-400">
          <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />
          <span>Open in WhatsApp Web</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={openWhatsAppApp} className="gap-2 cursor-pointer">
          <Send className="h-3.5 w-3.5 text-emerald-500" />
          <span>Open in WhatsApp App</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={openTelCall} className="gap-2 cursor-pointer">
          <Phone className="h-3.5 w-3.5 text-blue-400" />
          <span>System Call / Dialer</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleCopy} className="gap-2 cursor-pointer">
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy Phone Number</span>
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface SocialLinksProps {
  website?: string | null;
  linkedin?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  className?: string;
}

export function SocialLinksRow({
  website,
  linkedin,
  instagram,
  facebook,
  className = "",
}: SocialLinksProps) {
  const normalizeUrl = (url: string) =>
    url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      {website && (
        <button
          type="button"
          onClick={() => openExternal(normalizeUrl(website))}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded bg-secondary/50 hover:bg-secondary transition-colors"
          title={website}
        >
          <Globe className="h-3 w-3 text-cyan-400" />
          <span>Website</span>
          <ExternalLink className="h-2.5 w-2.5 opacity-60" />
        </button>
      )}

      {linkedin && (
        <button
          type="button"
          onClick={() => openExternal(normalizeUrl(linkedin))}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded bg-secondary/50 hover:bg-secondary transition-colors"
          title={linkedin}
        >
          <Linkedin className="h-3 w-3 text-blue-400" />
          <span>LinkedIn</span>
          <ExternalLink className="h-2.5 w-2.5 opacity-60" />
        </button>
      )}

      {instagram && (
        <button
          type="button"
          onClick={() => openExternal(normalizeUrl(instagram))}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded bg-secondary/50 hover:bg-secondary transition-colors"
          title={instagram}
        >
          <Instagram className="h-3 w-3 text-pink-400" />
          <span>Instagram</span>
          <ExternalLink className="h-2.5 w-2.5 opacity-60" />
        </button>
      )}

      {facebook && (
        <button
          type="button"
          onClick={() => openExternal(normalizeUrl(facebook))}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded bg-secondary/50 hover:bg-secondary transition-colors"
          title={facebook}
        >
          <Facebook className="h-3 w-3 text-blue-500" />
          <span>Facebook</span>
          <ExternalLink className="h-2.5 w-2.5 opacity-60" />
        </button>
      )}
    </div>
  );
}
