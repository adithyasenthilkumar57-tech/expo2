import { NextResponse } from 'next/server';
import { readDB, writeDB, addActivity, Lead } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const q = searchParams.get('q')?.toLowerCase();
  const sort = searchParams.get('sort') || 'recent';

  const db = readDB();
  let leads = [...db.leads];

  if (status && status !== 'all') {
    leads = leads.filter(l => l.status === status);
  }

  if (q) {
    leads = leads.filter(l => 
      l.name.toLowerCase().includes(q) || 
      l.company.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q) ||
      (l.notes && l.notes.toLowerCase().includes(q))
    );
  }

  if (sort === 'score') {
    leads.sort((a, b) => b.score - a.score);
  } else if (sort === 'value') {
    leads.sort((a, b) => b.value - a.value);
  } else {
    leads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return NextResponse.json({
    leads,
    total: db.leads.length,
    hot: db.leads.filter(l => l.status === 'hot').length,
    warm: db.leads.filter(l => l.status === 'warm').length,
    cold: db.leads.filter(l => l.status === 'cold').length,
    escalated: db.leads.filter(l => l.status === 'escalated').length,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name || !body.company || !body.email) {
      return NextResponse.json({ error: 'Name, company, and email are required' }, { status: 400 });
    }

    const db = readDB();
    const lead: Lead = {
      id: uuidv4(),
      name: body.name.trim(),
      company: body.company.trim(),
      email: body.email.trim(),
      phone: body.phone?.trim() || '',
      status: body.status || 'warm',
      score: body.score !== undefined ? Number(body.score) : Math.floor(Math.random() * 35) + 60,
      value: Number(body.value) || 0,
      source: body.source || 'Website widget',
      notes: body.notes || '',
      createdAt: new Date().toISOString(),
      lastTouch: new Date().toISOString(),
    };

    db.leads.unshift(lead);
    writeDB(db);

    addActivity(
      'lead_captured',
      'New lead captured',
      `${lead.name} from ${lead.company} entered the pipeline.`
    );

    if (lead.status === 'hot') {
      addActivity(
        'lead_qualified',
        'Lead qualified as hot',
        `${lead.name} · ${lead.company} · $${lead.value.toLocaleString()} value`
      );
    }

    return NextResponse.json(lead, { status: 201 });
  } catch (err) {
    console.error('Error creating lead:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
