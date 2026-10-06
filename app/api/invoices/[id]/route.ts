import { NextResponse } from 'next/server';
import { readDB, writeDB, addActivity } from '@/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = readDB();
  const inv = db.invoices.find(i => i.id === id);
  if (!inv) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  return NextResponse.json(inv);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = readDB();
  const idx = db.invoices.findIndex(i => i.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });

  const body = await req.json();
  const oldStatus = db.invoices[idx].status;
  const updatedInv = { ...db.invoices[idx], ...body };
  db.invoices[idx] = updatedInv;
  writeDB(db);

  if (body.status && body.status !== oldStatus) {
    if (body.status === 'paid') {
      addActivity(
        'invoice_paid',
        'Invoice paid',
        `${updatedInv.client} paid ${updatedInv.invoiceNumber} — $${updatedInv.amount.toLocaleString()} collected.`
      );
    } else if (body.status === 'sent') {
      addActivity(
        'invoice_sent',
        'Invoice sent',
        `${updatedInv.invoiceNumber} sent to ${updatedInv.client} (${updatedInv.email}) for $${updatedInv.amount.toLocaleString()}`
      );
    }
  }

  return NextResponse.json(updatedInv);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = readDB();
  const idx = db.invoices.findIndex(i => i.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });

  const deleted = db.invoices.splice(idx, 1)[0];
  writeDB(db);
  return NextResponse.json({ success: true, deletedInvoice: deleted });
}
