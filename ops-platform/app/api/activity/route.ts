import { NextResponse } from 'next/server';
import { readDB, addActivity } from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const limit = Number(searchParams.get('limit')) || 100;

  const db = readDB();
  let events = [...db.activity];

  if (type && type !== 'all') {
    events = events.filter(e => e.type === type);
  }

  return NextResponse.json({
    events: events.slice(0, limit),
    total: events.length,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.title || !body.description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    const event = addActivity(
      body.type || 'agent_response',
      body.title,
      body.description,
      body.metadata
    );

    return NextResponse.json(event, { status: 201 });
  } catch (err) {
    console.error('Error logging activity event:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
