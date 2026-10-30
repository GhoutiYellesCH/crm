export interface LeadScoreResult {
  score: number; // 0 - 100
  breakdown: Record<string, number>;
  recommendations: string[];
}

export interface LeadScoreInput {
  website?: string | null;
  companySize?: string | null;
  techStack?: string[];
  securityIssues?: Array<{ type: string; severity: string; detail: string }>;
  whoisData?: Record<string, any>;
  hasEmail?: boolean;
  hasPhone?: boolean;
  hasDecisionMaker?: boolean;
  hasLinkedin?: boolean;
}

/**
 * Calculates a lead score (0-100) based on tech vulnerabilities,
 * contact accessibility, and company size fit for your services.
 */
export function calculateLeadScore(input: LeadScoreInput): LeadScoreResult {
  let score = 0;
  const breakdown: Record<string, number> = {};
  const recommendations: string[] = [];

  // 1. Accessibility & Decision Maker (+25 max)
  if (input.hasEmail) {
    score += 15;
    breakdown["Direct Email Available"] = 15;
  }
  if (input.hasPhone) {
    score += 5;
    breakdown["Direct Phone Available"] = 5;
  }
  if (input.hasDecisionMaker || input.hasLinkedin) {
    score += 10;
    breakdown["Decision Maker Identified"] = 10;
  }

  // 2. Security Gaps (Prime opportunity for your 3-level Security Audit) (+35 max)
  const issues = input.securityIssues || [];
  const hasCritical = issues.some((i) => i.severity === "critical" || i.severity === "high");
  const hasSSLProblem = issues.some((i) => i.type.includes("ssl") || i.type.includes("certificate"));
  const hasHeaderProblem = issues.some((i) => i.type.includes("header") || i.type.includes("csp"));

  if (hasCritical) {
    score += 20;
    breakdown["High/Critical Security Gap Detected"] = 20;
    recommendations.push("Pitch: Complete 3-Level Security Audit (Black Box / User / Admin)");
  } else if (issues.length > 0) {
    score += 10;
    breakdown["Security Weakness Detected"] = 10;
  }

  if (hasSSLProblem) {
    score += 15;
    breakdown["SSL/TLS Certificate Vulnerability"] = 15;
    recommendations.push("Pitch: Infrastructure Hardening & Secure Web Setup");
  }

  if (hasHeaderProblem) {
    score += 10;
    breakdown["Missing Security Headers (CSP/HSTS)"] = 10;
  }

  // 3. Tech Stack Opportunities (AI automation & modern secure web app) (+25 max)
  const stack = (input.techStack || []).map((t) => t.toLowerCase());
  const hasOldCms = stack.some((t) =>
    ["wordpress", "joomla", "drupal", "magento 1"].some((cms) => t.includes(cms))
  );

  if (hasOldCms) {
    score += 15;
    breakdown["Legacy CMS / Re-build Opportunity"] = 15;
    recommendations.push("Pitch: Modern Secure Custom Web / Mobile App");
  }

  // If no AI automation tools detected
  const hasAi = stack.some((t) => ["openai", "intercom", "anthropic", "langchain", "chatbot"].some((a) => t.includes(a)));
  if (!hasAi) {
    score += 10;
    breakdown["No AI Automation Detected"] = 10;
    recommendations.push("Pitch: AI Workflow Automation & Customer Assistant Integration");
  }

  // 4. Company Size Sweet Spot (SMEs: 1-50 people) (+15 max)
  const size = input.companySize || "1-10";
  if (size === "1-10" || size === "11-50") {
    score += 15;
    breakdown["SME Sweet Spot (Agile Decision Makers)"] = 15;
  } else if (size === "51-200") {
    score += 10;
    breakdown["Mid-Market Size"] = 10;
  }

  // Cap at 100
  const finalScore = Math.min(100, Math.max(0, score));

  return {
    score: finalScore,
    breakdown,
    recommendations,
  };
}
