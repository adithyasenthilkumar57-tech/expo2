import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
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

  return NextResponse.json({ events, total });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.title || !body.description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    const event = await prisma.activityEvent.create({
      data: {
        type: body.type || 'agent_response',
        title: body.title,
        description: body.description,
        metadata: body.metadata || undefined,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (err) {
    console.error('Error logging activity event:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
