/**
 * Opens a URL or system protocol (mailto, tel, whatsapp, http/https)
 * using Tauri's native shell open() if in desktop mode, or window.open().
 */
export async function openExternal(url: string): Promise<void> {
  try {
    const { open } = await import("@tauri-apps/plugin-shell");
    await open(url);
  } catch {
    if (url.startsWith("mailto:") || url.startsWith("tel:") || url.startsWith("whatsapp:")) {
      window.location.href = url;
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }
}

/**
 * Clean phone number for WhatsApp (removes spaces, dashes, parentheses).
 * If it starts with '0', and user is in DZ (+213), or handles international +
 */
export function formatPhoneForWhatsApp(phone: string): string {
  let cleaned = phone.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+")) {
    cleaned = cleaned.substring(1);
  } else if (cleaned.startsWith("00")) {
    cleaned = cleaned.substring(2);
  } else if (cleaned.startsWith("0")) {
    // Default DZ country code 213 if local number starts with 0
    cleaned = "213" + cleaned.substring(1);
  }
  return cleaned;
}
