import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { formatCurrency, formatDate } from "@/lib/utils";

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface InvoicePdfData {
  invoiceNumber: string;
  clientName: string;
  clientCompany?: string | null;
  clientEmail?: string | null;
  clientAddress?: string | null;
  issueDate: number;
  dueDate?: number | null;
  currency: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
  notes?: string | null;
}

export async function generateInvoicePdf(data: InvoicePdfData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 in points
  const { width, height } = page.getSize();

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Palette
  const colorPrimary = rgb(0.12, 0.16, 0.23); // Dark slate
  const colorSecondary = rgb(0.4, 0.45, 0.52); // Muted gray
  const colorAccent = rgb(0.23, 0.51, 0.96); // Clean blue
  const colorLine = rgb(0.88, 0.90, 0.93); // Light border

  let y = height - 50;

  // Header
  page.drawText("INVOICE", {
    x: 50,
    y,
    size: 26,
    font: fontBold,
    color: colorPrimary,
  });

  page.drawText(`#${data.invoiceNumber}`, {
    x: width - 180,
    y,
    size: 16,
    font: fontBold,
    color: colorAccent,
  });

  y -= 30;
  page.drawLine({
    start: { x: 50, y },
    end: { x: width - 50, y },
    thickness: 1,
    color: colorLine,
  });

  // Dates & Info
  y -= 25;
  page.drawText(`Date Issued: ${formatDate(data.issueDate)}`, {
    x: width - 180,
    y,
    size: 9,
    font: fontRegular,
    color: colorSecondary,
  });

  if (data.dueDate) {
    y -= 14;
    page.drawText(`Due Date: ${formatDate(data.dueDate)}`, {
      x: width - 180,
      y,
      size: 9,
      font: fontRegular,
      color: colorSecondary,
    });
  }

  // Bill To (Left side)
  let billToY = y + 14;
  page.drawText("BILL TO", {
    x: 50,
    y: billToY,
    size: 10,
    font: fontBold,
    color: colorPrimary,
  });

  billToY -= 16;
  page.drawText(data.clientName, {
    x: 50,
    y: billToY,
    size: 12,
    font: fontBold,
    color: colorPrimary,
  });

  if (data.clientCompany) {
    billToY -= 14;
    page.drawText(data.clientCompany, {
      x: 50,
      y: billToY,
      size: 10,
      font: fontRegular,
      color: colorSecondary,
    });
  }

  if (data.clientEmail) {
    billToY -= 14;
    page.drawText(data.clientEmail, {
      x: 50,
      y: billToY,
      size: 9,
      font: fontRegular,
      color: colorSecondary,
    });
  }

  if (data.clientAddress) {
    billToY -= 14;
    page.drawText(data.clientAddress, {
      x: 50,
      y: billToY,
      size: 9,
      font: fontRegular,
      color: colorSecondary,
    });
  }

  y = Math.min(y, billToY) - 35;

  // Table Header
  const tableX = 50;
  const colDesc = tableX;
  const colQty = width - 230;
  const colPrice = width - 160;
  const colTotal = width - 90;

  page.drawRectangle({
    x: tableX,
    y: y - 5,
    width: width - 100,
    height: 22,
    color: rgb(0.96, 0.97, 0.98),
  });

  page.drawText("DESCRIPTION", {
    x: colDesc + 8,
    y: y + 2,
    size: 9,
    font: fontBold,
    color: colorPrimary,
  });
  page.drawText("QTY", {
    x: colQty,
    y: y + 2,
    size: 9,
    font: fontBold,
    color: colorPrimary,
  });
  page.drawText("PRICE", {
    x: colPrice,
    y: y + 2,
    size: 9,
    font: fontBold,
    color: colorPrimary,
  });
  page.drawText("TOTAL", {
    x: colTotal,
    y: y + 2,
    size: 9,
    font: fontBold,
    color: colorPrimary,
  });

  y -= 20;

  // Items Rows
  for (const item of data.items) {
    page.drawText(item.description, {
      x: colDesc + 8,
      y,
      size: 9,
      font: fontRegular,
      color: colorPrimary,
    });
    page.drawText(String(item.quantity), {
      x: colQty,
      y,
      size: 9,
      font: fontRegular,
      color: colorPrimary,
    });
    page.drawText(formatCurrency(item.unitPrice, data.currency), {
      x: colPrice,
      y,
      size: 9,
      font: fontRegular,
      color: colorPrimary,
    });
    page.drawText(formatCurrency(item.total, data.currency), {
      x: colTotal,
      y,
      size: 9,
      font: fontBold,
      color: colorPrimary,
    });

    y -= 10;
    page.drawLine({
      start: { x: tableX, y },
      end: { x: width - 50, y },
      thickness: 0.5,
      color: colorLine,
    });
    y -= 15;
  }

  // Summary (Subtotal, Tax, Total)
  y -= 10;
  const summaryX = width - 200;

  page.drawText("Subtotal:", {
    x: summaryX,
    y,
    size: 10,
    font: fontRegular,
    color: colorSecondary,
  });
  page.drawText(formatCurrency(data.subtotal, data.currency), {
    x: width - 90,
    y,
    size: 10,
    font: fontRegular,
    color: colorPrimary,
  });

  if (data.taxRate > 0) {
    y -= 16;
    page.drawText(`Tax / VAT (${data.taxRate}%):`, {
      x: summaryX,
      y,
      size: 10,
      font: fontRegular,
      color: colorSecondary,
    });
    page.drawText(formatCurrency(data.taxAmount, data.currency), {
      x: width - 90,
      y,
      size: 10,
      font: fontRegular,
      color: colorPrimary,
    });
  }

  if (data.discount > 0) {
    y -= 16;
    page.drawText("Discount:", {
      x: summaryX,
      y,
      size: 10,
      font: fontRegular,
      color: colorSecondary,
    });
    page.drawText(`-${formatCurrency(data.discount, data.currency)}`, {
      x: width - 90,
      y,
      size: 10,
      font: fontRegular,
      color: rgb(0.85, 0.2, 0.2),
    });
  }

  y -= 20;
  page.drawLine({
    start: { x: summaryX, y: y + 8 },
    end: { x: width - 50, y: y + 8 },
    thickness: 1,
    color: colorPrimary,
  });

  page.drawText("TOTAL DUE:", {
    x: summaryX,
    y,
    size: 12,
    font: fontBold,
    color: colorPrimary,
  });
  page.drawText(formatCurrency(data.total, data.currency), {
    x: width - 90,
    y,
    size: 12,
    font: fontBold,
    color: colorAccent,
  });

  // Footer notes
  if (data.notes) {
    y -= 40;
    page.drawText("Notes & Payment Instructions:", {
      x: 50,
      y,
      size: 9,
      font: fontBold,
      color: colorPrimary,
    });
    y -= 14;
    page.drawText(data.notes, {
      x: 50,
      y,
      size: 8,
      font: fontRegular,
      color: colorSecondary,
    });
  }

  return pdfDoc.save();
}

/** Download generated PDF bytes in browser */
export function downloadPdf(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes as any], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
