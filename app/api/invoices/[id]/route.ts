import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const inv = await prisma.invoice.findUnique({ where: { id }, include: { items: true } });
  if (!inv) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  return NextResponse.json(inv);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.invoice.findUnique({ where: { id }, include: { items: true } });
  if (!existing) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { items, ...updateData } = body;

  const updatedInv = await prisma.invoice.update({
    where: { id },
    data: updateData,
    include: { items: true },
  });

  if (body.status && body.status !== existing.status) {
    if (body.status === 'paid') {
      await prisma.activityEvent.create({
        data: {
          type: 'invoice_paid',
          title: 'Invoice paid',
          description: `${updatedInv.client} paid ${updatedInv.invoiceNumber} — $${updatedInv.amount.toLocaleString()} collected.`,
        },
      });
    } else if (body.status === 'sent') {
      await prisma.activityEvent.create({
        data: {
          type: 'invoice_sent',
          title: 'Invoice sent',
          description: `${updatedInv.invoiceNumber} sent to ${updatedInv.client} (${updatedInv.email}) for $${updatedInv.amount.toLocaleString()}`,
        },
      });
    }
  }

  return NextResponse.json(updatedInv);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existing = await prisma.invoice.findUnique({ where: { id }, include: { items: true } });
  if (!existing) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });

  await prisma.invoice.delete({ where: { id } });
  return NextResponse.json({ success: true, deletedInvoice: existing });
}
