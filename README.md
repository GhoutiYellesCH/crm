# 🛡️ AegisFlow CRM

> **Privacy-First Local CRM, Financial Suite & 3-Level Security Operations Platform**

AegisFlow CRM is a powerful, offline-first desktop application designed for solo technical founders, consultants, and independent agencies. Built with **Tauri 2**, **Rust**, **React 19**, **TypeScript**, and **SQLite**, it keeps 100% of your business data stored locally on your machine with zero external cloud dependencies.

---

## ✨ Features Overview

### 👥 1. Client & Contact Lifecycle Manager
- **Solo & Team Taxonomy**: Filter and organize clients across technical services (*AI Automation*, *Fullstack & Infra*, *3-Level Security Audit*) and team services (*Video/Photo*, *Branding*, *Ads & Sales Funnels*).
- **Contact Directory**: Manage multiple points of contact, direct communication channels, interaction logs, and meeting notes per client.
- **Client Status Pipeline**: Track clients from `Lead` to `Active`, `Paused`, and `Completed`.

### 📋 2. Task Kanban & Service Checklists
- **4-Stage Kanban Board**: Drag, drop, and transition tasks across *Backlog*, *In Progress*, *In Review*, and *Done*.
- **Pre-loaded Service Milestones**: Automatically populate battle-tested project templates for each service offering.
- **Local Team Delegation**: Assign tasks to local collaborators with skill matching.

### 💰 3. Financial Suite, Invoicing & Zakat Engine
- **Multi-Currency Invoicing**: Issue line-item invoices in `EUR`, `USD`, `DZD`, `MAD`, `TND`, and `GBP`.
- **Instant Vector PDF Generator**: Generate clean, minimalist, high-resolution A4 invoice PDFs using `pdf-lib`.
- **MRR / ARR Retainer Tracker**: Monitor recurring revenue retainers with automatic annual run-rate calculation.
- **Wealth Zakat Calculator**: Automated Hawl tracking and 2.5% wealth Zakat liability calculation based on configurable 85g gold Nisab.

### 🎯 4. Lead Generation & Zero-Key OSINT
- **Passive OSINT Discovery**: Scrape Certificate Transparency logs via `crt.sh` and query WHOIS/RDAP without requiring paid API keys.
- **Opportunity Scoring**: 0–100 heuristic scoring algorithm analyzing domain footprint, certificate age, and tech signals.
- **Outreach Workbench**: Instant tailored pitch generation for cold outreach across security audits, web modernisation, and AI integration.

### 🔒 5. 3-Level Security Audit Manager & PDF Reports
- **OWASP-Aligned Checklists**:
  - **Black Box**: External reconnaissance, DNS, TLS configuration, open ports, and surface fuzzing.
  - **User Level**: Authentication bypass, RBAC, IDOR, session entropy, and XSS/CSRF testing.
  - **Admin Level**: Privilege escalation, server hardening, database encryption, and audit trails.
- **Vulnerability Logger**: CVSS severity scoring (*Critical*, *High*, *Medium*, *Low*, *Info*) with reproduction steps and remediation advice.
- **Executive PDF Report Generator**: Generate branded, client-ready security assessment reports at the touch of a button.

### 📅 6. Calendar & Desktop Notifications
- **Workflow Scheduling**: Month grid visualization and daily agenda timeline.
- **Desktop Alerts**: Native Tauri 2 desktop notifications for upcoming delivery deadlines, audit milestones, and client meetings.

### 🔖 7. Bookmark & Resource Hub
- **4 Categorized Spaces**: Tools, Articles, Projects, and Reference Notes.
- **Automatic Favicon Extraction**: Resolves site icons automatically with quick-tag search and pinned favorites.

### 🌐 8. Multilingual & Adaptive Dark Theme
- **Triple Locale**: Full English, French, and Arabic with automatic dynamic RTL (`dir="rtl"`) text direction.
- **Polished UI**: Custom theme switcher (Dark Mode default & Light Mode) with high-contrast form controls and dropdowns.

### 🔐 9. Master Password App Lock & Offline Cryptographic Vault
- **Zero-Knowledge App Lock**: Protect clients, finances, and security audits behind an offline SHA-256 salted master password.
- **Lock Screen & Inactivity Auto-Lock**: Lock on launch, manual "Lock Now" button in the TopBar, and configurable inactivity timeout (Never, 5m, 15m, 30m, 1h).

### 💾 10. Dedicated Data Management & 1-Click USB Backup
- **Config Directory**: Stores active database at `~/.config/aegisflow/crm.db`.
- **Automatic USB Flash Drive Detection**: Scans `/media/$USER` and `/run/media/$USER` to offer 1-click external backup creation directly to your USB drive.
- **Safety Database Restore**: Restores previous backups with magic SQLite header verification and automatic safety snapshots.

---

## 🚀 Installation & Downloads

Official releases are available on [GitHub Releases](https://github.com/GhoutiYellesCH/crm/releases) and in the local [`releases/`](releases/) directory.

### Windows (x64 Executable)
Download the standalone executable:
- **[AegisFlow_0.2.0_x64.exe](releases/AegisFlow_0.2.0_x64.exe)**

Simply download and double-click to launch. No installer required.

### Ubuntu / Debian (.deb Package)
Download the Debian package:
- **[AegisFlow_0.2.0_amd64.deb](releases/AegisFlow_0.2.0_amd64.deb)**

Install via `dpkg`:
```bash
sudo dpkg -i releases/AegisFlow_0.2.0_amd64.deb
```
or double-click the `.deb` file in your desktop environment's software center.

---

## 🛠️ Building from Source

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+) & `npm`
- [Rust & Cargo](https://rustup.rs/) (v1.75+)
- Linux packages:
  ```bash
  sudo apt install libwebkit2gtk-4.1-dev libgtk-3-dev libsoup-3.0-dev build-essential
  ```

### Steps
```bash
# 1. Clone repository
git clone https://github.com/GhoutiYellesCH/crm.git
cd crm

# 2. Install dependencies
npm install

# 3. Run in development mode (hot-reload desktop window)
npm run dev

# 4. Build standalone production .deb and binary
npm run build
```

---

## 🔒 Security & Privacy

All SQLite database storage (`crm.db`) is kept exclusively on your local file system under the application's local data directory. No client data, credentials, audit findings, or financial records are ever sent to remote cloud servers.

---

## 📄 License

MIT License. Free to use, modify, and distribute.
