import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  return NextResponse.json(lead);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.lead.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

  const updatedLead = await prisma.lead.update({
    where: { id },
    data: {
      ...body,
      lastTouch: new Date(),
    },
  });

  if (body.status && body.status !== existing.status) {
    if (body.status === 'hot') {
      await prisma.activityEvent.create({
        data: {
          type: 'lead_qualified',
          title: 'Lead qualified as hot',
          description: `${updatedLead.name} · ${updatedLead.company} · $${updatedLead.value.toLocaleString()} value`,
        },
      });
    } else if (body.status === 'escalated') {
      await prisma.activityEvent.create({
        data: {
          type: 'lead_qualified',
          title: 'Lead escalated to operator',
          description: `High priority escalation: ${updatedLead.name} from ${updatedLead.company}`,
        },
      });
    }
  }

  return NextResponse.json(updatedLead);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existing = await prisma.lead.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

  await prisma.lead.delete({ where: { id } });
  return NextResponse.json({ success: true, deletedLead: existing });
}
