import { NextResponse } from 'next/server';
import { db, Invoice } from '@/lib/store';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  return NextResponse.json({ invoices: db.invoices });
}

export async function POST(req: Request) {
  const body = await req.json();
  const invoice: Invoice = {
    id: uuidv4(),
    invoiceNumber: `INV-${new Date().getFullYear()}-${String(db.invoices.length + 1).padStart(3, '0')}`,
    client: body.client,
    email: body.email,
    amount: body.items?.reduce((s: number, i: { quantity: number; unitPrice: number }) => s + i.quantity * i.unitPrice, 0) || Number(body.amount) || 0,
    dueDate: body.dueDate,
    status: 'draft',
    items: body.items || [{ description: body.description || 'Service', quantity: 1, unitPrice: Number(body.amount) || 0 }],
    createdAt: new Date().toISOString(),
  };
  db.invoices.unshift(invoice);
  db.activity.unshift({
    id: uuidv4(),
    type: 'invoice_sent',
    title: 'Invoice created',
    description: `${invoice.invoiceNumber} created for ${invoice.client} — $${invoice.amount.toLocaleString()}`,
    timestamp: new Date().toISOString(),
  });
  return NextResponse.json(invoice, { status: 201 });
}
