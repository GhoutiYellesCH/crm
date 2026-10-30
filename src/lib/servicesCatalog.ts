export const SERVICES_CATALOG = [
  // Solo Technical Services
  {
    id: "ai_automation",
    category: "solo",
    label: "AI Automation & Integration",
    shortLabel: "AI Automation",
    color: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  },
  {
    id: "secure_app",
    category: "solo",
    label: "Secure App Dev (Web/Desktop/Mobile)",
    shortLabel: "Secure App",
    color: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  },
  {
    id: "security_audit",
    category: "solo",
    label: "Security Audit (Black Box / User / Admin)",
    shortLabel: "Security Audit",
    color: "bg-red-500/15 text-red-400 border-red-500/30",
  },
  // Team Creative & Growth Services
  {
    id: "video_photo",
    category: "team",
    label: "Filming, Shooting & Video Editing",
    shortLabel: "Video & Photo",
    color: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  },
  {
    id: "branding",
    category: "team",
    label: "Posters, Branding & Graphic Design",
    shortLabel: "Branding",
    color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  },
  {
    id: "ads_funnels",
    category: "team",
    label: "Paid Ads & Sales Funnels",
    shortLabel: "Ads & Funnels",
    color: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  },
] as const;

export type ServiceId = (typeof SERVICES_CATALOG)[number]["id"];

export const CLIENT_STATUSES = [
  { value: "lead", label: "Lead", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { value: "prospect", label: "Prospect", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  { value: "proposal", label: "Proposal Sent", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  { value: "active", label: "Active Client", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  { value: "inactive", label: "Inactive", color: "bg-slate-500/20 text-slate-400 border-slate-500/30" },
  { value: "closed", label: "Lost / Closed", color: "bg-rose-500/20 text-rose-400 border-rose-500/30" },
] as const;

export type ClientStatus = (typeof CLIENT_STATUSES)[number]["value"];
