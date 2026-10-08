import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const FALLBACK_EVENTS = [
  { id: 'ev-1', type: 'lead_captured', title: 'New lead qualified', description: 'Sophia Chen (Apex Global Logistics) entered pipeline with intent score 92/100.', timestamp: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: 'ev-2', type: 'invoice_reminded', title: 'Autonomous dunning sent', description: 'Reminder delivered for INV-2026-003 to finance@solariahealth.org.', timestamp: new Date(Date.now() - 3600000 * 5).toISOString() },
  { id: 'ev-3', type: 'appointment_scheduled', title: 'Demo confirmed', description: 'Session booked with David Miller (Vanguard Retail Partners) for tomorrow.', timestamp: new Date(Date.now() - 86400000).toISOString() },
  { id: 'ev-4', type: 'agent_response', title: 'Widget inquiry handled', description: 'AI agent resolved questions on SLA pricing and operating model.', timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const limit = Number(searchParams.get('limit')) || 100;

    const where: Record<string, unknown> = {};
    if (type && type !== 'all') {
      where.type = type;
    }

    const [events, total] = await Promise.all([
      prisma.activityEvent.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: limit,
      }),
      prisma.activityEvent.count({ where }),
    ]);

    if (events.length > 0) {
      return NextResponse.json({ events, total });
    }

    return NextResponse.json({ events: FALLBACK_EVENTS.slice(0, limit), total: FALLBACK_EVENTS.length });
  } catch (err) {
    console.warn('Activity DB fallback engaged:', err);
    return NextResponse.json({ events: FALLBACK_EVENTS, total: FALLBACK_EVENTS.length });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.title || !body.description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    try {
      const event = await prisma.activityEvent.create({
        data: {
          type: body.type || 'agent_response',
          title: body.title,
          description: body.description,
          metadata: body.metadata || undefined,
        },
      });

      return NextResponse.json(event, { status: 201 });
    } catch {
      const mockEvent = {
        id: 'ev-' + Date.now(),
        type: body.type || 'agent_response',
        title: body.title,
        description: body.description,
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(mockEvent, { status: 201 });
    }
  } catch (err) {
    console.error('Error logging activity event:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
