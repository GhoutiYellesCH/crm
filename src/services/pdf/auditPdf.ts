import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { formatDate } from "@/lib/utils";

export interface Finding {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  description: string;
  recommendation: string;
}

export interface AuditPdfData {
  title: string;
  clientName: string;
  clientCompany?: string | null;
  level: string;
  scope?: string | null;
  startedAt: number;
  completedAt?: number | null;
  findings: Finding[];
  notes?: string | null;
}

export async function generateAuditPdf(data: AuditPdfData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Palette
  const colorPrimary = rgb(0.08, 0.12, 0.18);
  const colorSecondary = rgb(0.4, 0.45, 0.52);
  const colorLine = rgb(0.85, 0.88, 0.92);

  const severityColors: Record<string, any> = {
    critical: rgb(0.88, 0.15, 0.2),
    high: rgb(0.95, 0.45, 0.1),
    medium: rgb(0.95, 0.65, 0.1),
    low: rgb(0.2, 0.5, 0.9),
    info: rgb(0.45, 0.5, 0.58),
  };

  let y = height - 50;

  // Title & Header Banner
  page.drawRectangle({
    x: 40,
    y: y - 35,
    width: width - 80,
    height: 60,
    color: rgb(0.05, 0.08, 0.12),
  });

  page.drawText("SECURITY AUDIT REPORT", {
    x: 55,
    y: y - 5,
    size: 18,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText(`Scope: ${data.level.toUpperCase().replace(/_/g, " ")} ASSESSMENT`, {
    x: 55,
    y: y - 24,
    size: 10,
    font: fontBold,
    color: rgb(0.35, 0.65, 0.95),
  });

  y -= 70;

  // Metadata block
  page.drawText(`Client: ${data.clientName} ${data.clientCompany ? `(${data.clientCompany})` : ""}`, {
    x: 50,
    y,
    size: 10,
    font: fontBold,
    color: colorPrimary,
  });

  page.drawText(`Date: ${formatDate(data.startedAt)}`, {
    x: width - 180,
    y,
    size: 9,
    font: fontRegular,
    color: colorSecondary,
  });

  y -= 14;
  if (data.scope) {
    page.drawText(`Target Scope: ${data.scope}`, {
      x: 50,
      y,
      size: 9,
      font: fontRegular,
      color: colorSecondary,
    });
  }

  y -= 25;
  page.drawLine({
    start: { x: 50, y },
    end: { x: width - 50, y },
    thickness: 1,
    color: colorLine,
  });

  // Executive Summary & Finding Counts
  y -= 25;
  page.drawText("EXECUTIVE SUMMARY & FINDINGS OVERVIEW", {
    x: 50,
    y,
    size: 11,
    font: fontBold,
    color: colorPrimary,
  });

  y -= 25;

  const countCrit = data.findings.filter((f) => f.severity === "critical").length;
  const countHigh = data.findings.filter((f) => f.severity === "high").length;
  const countMed = data.findings.filter((f) => f.severity === "medium").length;
  const countLow = data.findings.filter((f) => f.severity === "low").length;
  const countInfo = data.findings.filter((f) => f.severity === "info").length;

  const badges = [
    { label: `CRITICAL (${countCrit})`, col: severityColors.critical },
    { label: `HIGH (${countHigh})`, col: severityColors.high },
    { label: `MEDIUM (${countMed})`, col: severityColors.medium },
    { label: `LOW (${countLow})`, col: severityColors.low },
    { label: `INFO (${countInfo})`, col: severityColors.info },
  ];

  let badgeX = 50;
  for (const b of badges) {
    page.drawRectangle({
      x: badgeX,
      y: y - 4,
      width: 90,
      height: 20,
      color: b.col,
    });
    page.drawText(b.label, {
      x: badgeX + 8,
      y: y + 2,
      size: 8,
      font: fontBold,
      color: rgb(1, 1, 1),
    });
    badgeX += 98;
  }

  y -= 35;
  page.drawLine({
    start: { x: 50, y },
    end: { x: width - 50, y },
    thickness: 0.5,
    color: colorLine,
  });

  // Detailed Findings Loop
  y -= 20;
  page.drawText("DETAILED FINDINGS & REMEDIATION ROADMAP", {
    x: 50,
    y,
    size: 11,
    font: fontBold,
    color: colorPrimary,
  });

  y -= 20;

  for (let i = 0; i < data.findings.length; i++) {
    const finding = data.findings[i];

    // Check if we need a new page
    if (y < 120) {
      page = pdfDoc.addPage([595.28, 841.89]);
      y = height - 50;
    }

    const sevColor = severityColors[finding.severity] || severityColors.info;

    // Severity pill
    page.drawRectangle({
      x: 50,
      y: y - 2,
      width: 55,
      height: 14,
      color: sevColor,
    });
    page.drawText(finding.severity.toUpperCase(), {
      x: 54,
      y: y + 2,
      size: 7,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    // Finding Title
    page.drawText(`${i + 1}. ${finding.title}`, {
      x: 115,
      y,
      size: 10,
      font: fontBold,
      color: colorPrimary,
    });

    y -= 16;

    // Description
    if (finding.description) {
      page.drawText("Description & Impact:", {
        x: 50,
        y,
        size: 8,
        font: fontBold,
        color: colorSecondary,
      });
      y -= 12;
      const descLines = wrapText(finding.description, 95);
      for (const line of descLines.slice(0, 4)) {
        page.drawText(line, {
          x: 50,
          y,
          size: 8,
          font: fontRegular,
          color: colorPrimary,
        });
        y -= 10;
      }
    }

    // Recommendation
    if (finding.recommendation) {
      page.drawText("Remediation / Fix:", {
        x: 50,
        y,
        size: 8,
        font: fontBold,
        color: rgb(0.1, 0.55, 0.25),
      });
      y -= 12;
      const recLines = wrapText(finding.recommendation, 95);
      for (const line of recLines.slice(0, 3)) {
        page.drawText(line, {
          x: 50,
          y,
          size: 8,
          font: fontRegular,
          color: colorPrimary,
        });
        y -= 10;
      }
    }

    y -= 10;
    page.drawLine({
      start: { x: 50, y },
      end: { x: width - 50, y },
      thickness: 0.5,
      color: colorLine,
    });
    y -= 16;
  }

  // Footer Disclaimer
  if (y < 70) {
    page = pdfDoc.addPage([595.28, 841.89]);
    y = height - 50;
  }
  y -= 15;
  page.drawText(
    "CONFIDENTIAL REPORT — Prepared strictly for the authorized recipient. Penetration testing performed adhering to ethical security guidelines.",
    {
      x: 50,
      y,
      size: 7,
      font: fontRegular,
      color: colorSecondary,
    }
  );

  return pdfDoc.save();
}

function wrapText(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const w of words) {
    if ((current + " " + w).trim().length <= maxCharsPerLine) {
      current = (current + " " + w).trim();
    } else {
      if (current) lines.push(current);
      current = w;
    }
  }
  if (current) lines.push(current);
  return lines;
}
