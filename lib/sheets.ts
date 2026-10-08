export interface SheetUserEntry {
  name: string;
  email: string;
  action: 'login' | 'signup' | 'guest';
  timestamp?: string;
  source?: string;
}

/**
 * Sends login / signup user data to a Google Sheet Webhook (Apps Script)
 * If GOOGLE_SHEET_WEBHOOK_URL is set in .env or Vercel, it auto-appends a row!
 */
export async function syncToGoogleSheets(entry: SheetUserEntry) {
  const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    const payload = {
      timestamp: entry.timestamp || new Date().toISOString(),
      name: entry.name || 'Anonymous User',
      email: entry.email,
      action: entry.action,
      source: entry.source || 'Website / QR Code',
    };

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    // Non-blocking: never fail user login if external webhook fails
    console.warn('Google Sheets sync notice:', err);
  }
}
