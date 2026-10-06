import { NextResponse } from 'next/server';
import { readDB, writeDB, addActivity } from '@/lib/db';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = readDB();
  const idx = db.invoices.findIndex(i => i.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });

  const inv = db.invoices[idx];
  const now = new Date().toISOString();
  inv.lastReminderSent = now;
  writeDB(db);

  addActivity(
    'dunning_sent',
    'Dunning sequence triggered',
    `Automated payment reminder dispatched to ${inv.email} for ${inv.invoiceNumber} ($${inv.amount.toLocaleString()}).`
  );

  return NextResponse.json({
    success: true,
    message: `Reminder sent to ${inv.email} for invoice ${inv.invoiceNumber}`,
    lastReminderSent: now,
    invoice: inv,
  });
}
