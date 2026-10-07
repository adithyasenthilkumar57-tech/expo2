import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const appt = await prisma.appointment.findUnique({ where: { id } });
  if (!appt) return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
  return NextResponse.json(appt);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const existing = await prisma.appointment.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });

  const updated = await prisma.appointment.update({ where: { id }, data: body });
  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existing = await prisma.appointment.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });

  await prisma.appointment.delete({ where: { id } });
  return NextResponse.json({ success: true, deletedAppointment: existing });
}
