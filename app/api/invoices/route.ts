import { NextResponse } from 'next/server';
import { readDB, writeDB, addActivity, Invoice } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const q = searchParams.get('q')?.toLowerCase();

  const db = readDB();
  let invoices = [...db.invoices];

  if (status && status !== 'all') {
    invoices = invoices.filter(i => i.status === status);
  }

  if (q) {
    invoices = invoices.filter(i => 
      i.invoiceNumber.toLowerCase().includes(q) ||
      i.client.toLowerCase().includes(q) ||
      i.email.toLowerCase().includes(q)
    );
  }

  const collected = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const outstanding = invoices.filter(i => i.status === 'sent' || i.status === 'draft').reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const overdue = invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + (Number(i.amount) || 0), 0);

  return NextResponse.json({
    invoices,
    summary: {
      total: invoices.length,
      collected,
      outstanding,
      overdue,
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.client || !body.email || !body.dueDate) {
      return NextResponse.json({ error: 'Client name, email, and due date are required' }, { status: 400 });
    }

    const db = readDB();
    const currentYear = new Date().getFullYear();
    const invoiceCount = db.invoices.length + 1;
    const invoiceNumber = `INV-${currentYear}-${String(invoiceCount).padStart(3, '0')}`;

    const items = body.items && body.items.length > 0 
      ? body.items 
      : [{ description: body.description || 'Professional Operations Services', quantity: 1, unitPrice: Number(body.amount) || 0 }];

    const totalAmount = items.reduce((s: number, it: { quantity: number; unitPrice: number }) => s + (it.quantity * it.unitPrice), 0) || Number(body.amount) || 0;

    const invoice: Invoice = {
      id: uuidv4(),
      invoiceNumber,
      client: body.client.trim(),
      email: body.email.trim(),
      amount: totalAmount,
      dueDate: body.dueDate,
      status: body.status || 'draft',
      items,
      createdAt: new Date().toISOString(),
    };

    db.invoices.unshift(invoice);
    writeDB(db);

    addActivity(
      'invoice_sent',
      'Invoice created',
      `${invoice.invoiceNumber} created for ${invoice.client} — $${invoice.amount.toLocaleString()}`
    );

    return NextResponse.json(invoice, { status: 201 });
  } catch (err) {
    console.error('Error creating invoice:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
