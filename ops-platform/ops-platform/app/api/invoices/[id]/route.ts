import { NextResponse } from 'next/server';
import { db } from '@/lib/store';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const inv = db.invoices.find(i => i.id === id);
  if (!inv) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(inv);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idx = db.invoices.findIndex(i => i.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const body = await req.json();
  db.invoices[idx] = { ...db.invoices[idx], ...body };
  if (body.status === 'paid') {
    db.activity.unshift({
      id: uuidv4(),
      type: 'invoice_paid',
      title: 'Invoice paid',
      description: `${db.invoices[idx].client} paid ${db.invoices[idx].invoiceNumber} — $${db.invoices[idx].amount.toLocaleString()} collected.`,
      timestamp: new Date().toISOString(),
    });
  }
  return NextResponse.json(db.invoices[idx]);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idx = db.invoices.findIndex(i => i.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  db.invoices.splice(idx, 1);
  return NextResponse.json({ success: true });
}
