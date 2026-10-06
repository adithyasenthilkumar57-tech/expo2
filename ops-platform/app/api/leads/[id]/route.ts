import { NextResponse } from 'next/server';
import { db } from '@/lib/store';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = db.leads.find(l => l.id === id);
  if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(lead);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idx = db.leads.findIndex(l => l.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const body = await req.json();
  db.leads[idx] = { ...db.leads[idx], ...body, lastTouch: new Date().toISOString() };
  return NextResponse.json(db.leads[idx]);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idx = db.leads.findIndex(l => l.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  db.leads.splice(idx, 1);
  return NextResponse.json({ success: true });
}
