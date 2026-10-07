import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const q = searchParams.get('q')?.toLowerCase();

  const where: Record<string, unknown> = {};

  if (status && status !== 'all') {
    where.status = status;
  }

  if (q) {
    where.OR = [
      { invoiceNumber: { contains: q, mode: 'insensitive' } },
      { client: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
    ];
  }

  const invoices = await prisma.invoice.findMany({
    where,
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });

  const all = await prisma.invoice.findMany({ select: { status: true, amount: true } });
  const collected = all.filter((i) => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const outstanding = all.filter((i) => i.status === 'sent' || i.status === 'draft').reduce((s, i) => s + i.amount, 0);
  const overdue = all.filter((i) => i.status === 'overdue').reduce((s, i) => s + i.amount, 0);

  return NextResponse.json({
    invoices,
    summary: {
      total: all.length,
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

    const currentYear = new Date().getFullYear();
    const invoiceCount = await prisma.invoice.count();
    const invoiceNumber = `INV-${currentYear}-${String(invoiceCount + 1).padStart(3, '0')}`;

    const items =
      body.items && body.items.length > 0
        ? body.items
        : [{ description: body.description || 'Professional Operations Services', quantity: 1, unitPrice: Number(body.amount) || 0 }];

    const totalAmount =
      items.reduce((s: number, it: { quantity: number; unitPrice: number }) => s + it.quantity * it.unitPrice, 0) ||
      Number(body.amount) ||
      0;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        client: body.client.trim(),
        email: body.email.trim(),
        amount: totalAmount,
        dueDate: body.dueDate,
        status: body.status || 'draft',
        items: {
          create: items.map((it: { description: string; quantity: number; unitPrice: number }) => ({
            description: it.description,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
          })),
        },
      },
      include: { items: true },
    });

    await prisma.activityEvent.create({
      data: {
        type: 'invoice_sent',
        title: 'Invoice created',
        description: `${invoice.invoiceNumber} created for ${invoice.client} — $${invoice.amount.toLocaleString()}`,
      },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (err) {
    console.error('Error creating invoice:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
