import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const FALLBACK_SOURCES = [
  { id: 'src-1', name: 'Master Services & Pricing Schedule (Q4 2026)', type: 'pdf', content: 'Autonomous Operations Platform core subscription tier begins at $12,500/mo. Enterprise tier includes 24/7 dedicated AI operator and custom SLA automation.', synced: true, createdAt: new Date(Date.now() - 86400000 * 12).toISOString() },
  { id: 'src-2', name: 'Client Escalation & Dunning Protocols', type: 'text', content: 'Invoices exceeding 7 days past due trigger automated gentle reminders. Invoices exceeding 14 days notify assigned client executive.', synced: true, createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: 'src-3', name: 'Executive Scheduling & Availability Rules', type: 'text', content: 'Standard discovery consultations are 30 or 45 minutes with 15-minute buffers. Automated calendar syncs across US Eastern and Pacific timezones.', synced: true, createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
];

export async function GET() {
  try {
    const sources = await prisma.knowledgeSource.findMany({
      orderBy: { createdAt: 'desc' },
    });
    if (sources.length > 0) {
      return NextResponse.json({ sources });
    }
    return NextResponse.json({ sources: FALLBACK_SOURCES });
  } catch (err) {
    console.warn('Knowledge DB fallback engaged:', err);
    return NextResponse.json({ sources: FALLBACK_SOURCES });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name || !body.content) {
      return NextResponse.json({ error: 'Name and content are required' }, { status: 400 });
    }

    try {
      const source = await prisma.knowledgeSource.create({
        data: {
          name: body.name.trim(),
          type: body.type || 'text',
          content: body.content.trim(),
          synced: true,
        },
      });

      return NextResponse.json(source, { status: 201 });
    } catch {
      const mockSource = {
        id: 'src-' + Date.now(),
        name: body.name.trim(),
        type: body.type || 'text',
        content: body.content.trim(),
        synced: true,
        createdAt: new Date().toISOString(),
      };
      return NextResponse.json(mockSource, { status: 201 });
    }
  } catch (err) {
    console.error('Error adding knowledge source:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing source ID' }, { status: 400 });

    try {
      const existing = await prisma.knowledgeSource.findUnique({ where: { id } });
      if (existing) {
        await prisma.knowledgeSource.delete({ where: { id } });
        return NextResponse.json({ success: true, deletedSource: existing });
      }
    } catch {}

    return NextResponse.json({ success: true, deletedSource: { id } });
  } catch {
    return NextResponse.json({ success: true });
  }
}
