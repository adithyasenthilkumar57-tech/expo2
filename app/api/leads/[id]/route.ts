import { NextResponse } from 'next/server';
import { readDB, writeDB, addActivity } from '@/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = readDB();
  const lead = db.leads.find(l => l.id === id);
  if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  return NextResponse.json(lead);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = readDB();
  const idx = db.leads.findIndex(l => l.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

  const body = await req.json();
  const oldStatus = db.leads[idx].status;
  const updatedLead = {
    ...db.leads[idx],
    ...body,
    lastTouch: new Date().toISOString(),
  };

  db.leads[idx] = updatedLead;
  writeDB(db);

  if (body.status && body.status !== oldStatus) {
    if (body.status === 'hot') {
      addActivity(
        'lead_qualified',
        'Lead qualified as hot',
        `${updatedLead.name} · ${updatedLead.company} · $${updatedLead.value.toLocaleString()} value`
      );
    } else if (body.status === 'escalated') {
      addActivity(
        'lead_qualified',
        'Lead escalated to operator',
        `High priority escalation: ${updatedLead.name} from ${updatedLead.company}`
      );
    }
  }

  return NextResponse.json(updatedLead);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = readDB();
  const idx = db.leads.findIndex(l => l.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

  const deleted = db.leads.splice(idx, 1)[0];
  writeDB(db);
  return NextResponse.json({ success: true, deletedLead: deleted });
}
