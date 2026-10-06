import { NextResponse } from 'next/server';
import { db, Appointment } from '@/lib/store';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  return NextResponse.json({ appointments: db.appointments });
}

export async function POST(req: Request) {
  const body = await req.json();
  const appt: Appointment = {
    id: uuidv4(),
    title: body.title,
    client: body.client,
    date: body.date,
    time: body.time,
    duration: Number(body.duration) || 60,
    status: 'confirmed',
    notes: body.notes || '',
    createdAt: new Date().toISOString(),
  };
  db.appointments.unshift(appt);
  db.activity.unshift({
    id: uuidv4(),
    type: 'appointment_booked',
    title: 'Appointment booked',
    description: `${appt.title} with ${appt.client} confirmed for ${appt.date} at ${appt.time}.`,
    timestamp: new Date().toISOString(),
  });
  return NextResponse.json(appt, { status: 201 });
}
