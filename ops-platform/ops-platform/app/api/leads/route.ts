import { NextResponse } from 'next/server';
import { db, Lead } from '@/lib/store';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const q = searchParams.get('q')?.toLowerCase();
  
  let leads = [...db.leads];
  if (status && status !== 'all') leads = leads.filter(l => l.status === status);
  if (q) leads = leads.filter(l => l.name.toLowerCase().includes(q) || l.company.toLowerCase().includes(q));
  
  return NextResponse.json({ leads, total: db.leads.length });
}

export async function POST(req: Request) {
  const body = await req.json();
  const lead: Lead = {
    id: uuidv4(),
    name: body.name,
    company: body.company,
    email: body.email,
    phone: body.phone,
    status: body.status || 'warm',
    score: body.score || Math.floor(Math.random() * 40) + 40,
    value: Number(body.value) || 0,
    source: body.source || 'Manual',
    notes: body.notes || '',
    createdAt: new Date().toISOString(),
    lastTouch: new Date().toISOString(),
  };
  db.leads.unshift(lead);
  db.activity.unshift({
    id: uuidv4(),
    type: 'lead_captured',
    title: 'New lead captured',
    description: `${lead.name} from ${lead.company} entered the pipeline.`,
    timestamp: new Date().toISOString(),
  });
  return NextResponse.json(lead, { status: 201 });
}
