export interface AuditChecklistItem {
  id: string;
  category: string;
  item: string;
  done: boolean;
}

export const AUDIT_CHECKLISTS_BY_LEVEL: Record<string, Array<{ category: string; item: string }>> = {
  black_box: [
    { category: "Reconnaissance & OSINT", item: "Passive DNS, WHOIS & crt.sh certificate transparency enumeration" },
    { category: "Reconnaissance & OSINT", item: "Subdomain brute-force & exposed cloud storage buckets discovery" },
    { category: "Network & Port Scanning", item: "TCP SYN & UDP top-ports scan (detect open SSH, RDP, DB ports)" },
    { category: "Network & Port Scanning", item: "Service version fingerprinting & banner grabbing" },
    { category: "Web Surface & TLS", item: "TLS/SSL configuration check (protocols, ciphers, certificate chain)" },
    { category: "Web Surface & TLS", item: "Security headers evaluation (CSP, HSTS, X-Frame-Options, Permissions-Policy)" },
    { category: "Vulnerability Fuzzing", item: "Hidden directory & unauthenticated backup/archive file fuzzing" },
    { category: "Vulnerability Fuzzing", item: "Unauthenticated SQL injection, XSS & open redirect surface probe" },
    { category: "Vulnerability Fuzzing", item: "Rate limiting & DDoS resilience check on login/reset endpoints" },
  ],
  user: [
    { category: "Authentication & Sessions", item: "Session token randomness, entropy & expiration validation" },
    { category: "Authentication & Sessions", item: "Brute-force protection & credential stuffing resilience" },
    { category: "Access Control & IDOR", item: "Insecure Direct Object Reference (IDOR) on user profile & data endpoints" },
    { category: "Access Control & IDOR", item: "Horizontal privilege escalation (accessing peer accounts' data)" },
    { category: "Access Control & IDOR", item: "Vertical privilege escalation (attempting unauthorized role escalation)" },
    { category: "Input Validation & APIs", item: "Stored & Reflected Cross-Site Scripting (XSS) in user inputs" },
    { category: "Input Validation & APIs", item: "File upload vulnerability testing (MIME bypass, polyglots, reverse shells)" },
    { category: "Input Validation & APIs", item: "Business logic flaws in transaction, ordering or credit flows" },
  ],
  admin: [
    { category: "Configuration & Hardening", item: "Server OS hardening review & patch management verification" },
    { category: "Configuration & Hardening", item: "Secrets & credentials audit in environment variables & version control" },
    { category: "Database & Storage", item: "Database access control, principle of least privilege & encryption at rest" },
    { category: "Database & Storage", item: "Backup integrity, offsite replication & disaster recovery validation" },
    { category: "Logging & Incident Response", item: "Centralized logging, audit trail immutability & SIEM alerts" },
    { category: "Internal Networking", item: "Internal network segmentation, VLAN isolation & egress firewall rules" },
  ],
};

export const AUDIT_LEVELS = [
  { value: "black_box", label: "Black Box (External Attacker View)", badge: "bg-slate-800 text-slate-200 border-slate-600" },
  { value: "user", label: "User Level (Authenticated Threat View)", badge: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { value: "admin", label: "Admin Level (Internal Hardening & Config)", badge: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  { value: "full", label: "Full Scope (3-Level Complete Audit)", badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
] as const;

export const SEVERITIES = [
  { value: "critical", label: "Critical", color: "bg-rose-600 text-white", textCol: "text-rose-500" },
  { value: "high", label: "High", color: "bg-orange-500 text-white", textCol: "text-orange-400" },
  { value: "medium", label: "Medium", color: "bg-amber-500 text-black", textCol: "text-amber-400" },
  { value: "low", label: "Low", color: "bg-blue-500 text-white", textCol: "text-blue-400" },
  { value: "info", label: "Info", color: "bg-slate-500 text-white", textCol: "text-slate-400" },
] as const;
