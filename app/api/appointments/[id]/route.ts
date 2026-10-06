import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = readDB();
  const appt = db.appointments.find(a => a.id === id);
  if (!appt) return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
  return NextResponse.json(appt);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = readDB();
  const idx = db.appointments.findIndex(a => a.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });

  const body = await req.json();
  db.appointments[idx] = { ...db.appointments[idx], ...body };
  writeDB(db);
  return NextResponse.json(db.appointments[idx]);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = readDB();
  const idx = db.appointments.findIndex(a => a.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });

  const deleted = db.appointments.splice(idx, 1)[0];
  writeDB(db);
  return NextResponse.json({ success: true, deletedAppointment: deleted });
}
