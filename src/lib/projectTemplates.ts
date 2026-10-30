export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export const SERVICE_PROJECT_TEMPLATES: Record<
  string,
  { label: string; defaultChecklist: string[] }
> = {
  ai_automation: {
    label: "AI Automation & Integration",
    defaultChecklist: [
      "Client requirements gathering & workflow mapping",
      "API access & credential provisioning (OpenAI, Anthropic, webhooks, etc.)",
      "Data pipeline & input schema design",
      "Core automation logic & agent prompting/tooling",
      "Testing error handling, rate limits & fallbacks",
      "Client demo & user acceptance testing (UAT)",
      "Deployment & webhook/cron scheduling",
      "Documentation & client handover walkthrough",
    ],
  },
  secure_app: {
    label: "Secure App Dev (Web/Desktop/Mobile)",
    defaultChecklist: [
      "Architecture specification, threat modeling & tech stack setup",
      "Database schema design & migrations",
      "Authentication & role-based access control (RBAC)",
      "Core business logic & API endpoint implementation",
      "Input validation, sanitization & CSRF/XSS mitigations",
      "Frontend UI/UX components & responsiveness",
      "End-to-end integration testing & load test",
      "Production deployment, TLS certificates & infra hardening",
    ],
  },
  security_audit: {
    label: "Security Audit (Black Box / User / Admin)",
    defaultChecklist: [
      "Scope definition, target IP/domain signoff & Rules of Engagement",
      "Passive recon: DNS, WHOIS, crt.sh, subdomains & OSINT",
      "Black Box: Port scanning, SSL/TLS audit & web vulnerability fuzzing",
      "User Level: Auth bypass, session fixation, IDOR & privilege escalation",
      "Admin Level: Config audit, secrets in env/code, DB access review",
      "Triage findings into Critical, High, Medium, Low & Info",
      "Draft remediation guide & proof-of-concept steps",
      "Generate executive PDF report & debrief client",
    ],
  },
  video_photo: {
    label: "Filming, Shooting & Video Editing",
    defaultChecklist: [
      "Creative brief, moodboard & shot list approval",
      "Equipment check: cameras, lighting, audio gear & backups",
      "On-site filming / photography session",
      "Footage ingestion, audio sync & rough cut assembly",
      "Color grading, sound design & motion graphics/captions",
      "Client review version 1 & feedback incorporation",
      "Final 4K/1080p export & delivery in target formats (reels, 16:9)",
    ],
  },
  branding: {
    label: "Posters, Branding & Graphic Design",
    defaultChecklist: [
      "Brand discovery questionnaire & visual references",
      "Concept exploration: 3 logo & typography directions",
      "Client feedback & chosen concept refinement",
      "Brand guidelines: color palettes, typography & spacing rules",
      "Marketing assets design: business cards, posters, social media banners",
      "Final vector assets package (SVG, EPS, PNG, PDF export)",
    ],
  },
  ads_funnels: {
    label: "Paid Ads & Sales Funnels",
    defaultChecklist: [
      "Audience persona definition & competitor ad analysis",
      "Ad copy & visual creative production (variants for A/B testing)",
      "Landing page setup & conversion tracking pixels (Meta, Google)",
      "Campaign setup, budget allocation & targeting configuration",
      "Campaign launch & initial 48-hour data monitoring",
      "Optimization: negative keywords, bid adjustments, winning ad scaling",
      "Weekly performance report & ROAS review",
    ],
  },
  other: {
    label: "Custom Project",
    defaultChecklist: [
      "Initial project scoping & deliverables signoff",
      "Implementation phase 1",
      "Implementation phase 2",
      "Review & revisions",
      "Final delivery & client signoff",
    ],
  },
};

export const TASK_STATUSES = [
  { value: "todo", label: "To Do", color: "bg-slate-500/20 text-slate-300 border-slate-500/30" },
  { value: "in_progress", label: "In Progress", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { value: "review", label: "In Review", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  { value: "done", label: "Done", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number]["value"];

export const TASK_PRIORITIES = [
  { value: "low", label: "Low", color: "bg-slate-500/20 text-slate-400" },
  { value: "medium", label: "Medium", color: "bg-blue-500/20 text-blue-400" },
  { value: "high", label: "High", color: "bg-orange-500/20 text-orange-400" },
  { value: "urgent", label: "Urgent", color: "bg-red-500/20 text-red-400" },
] as const;

export type TaskPriority = (typeof TASK_PRIORITIES)[number]["value"];
