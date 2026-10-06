import { NextResponse } from 'next/server';
import { readDB, writeDB, addActivity, Appointment } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const q = searchParams.get('q')?.toLowerCase();

  const db = readDB();
  let appointments = [...db.appointments];

  if (status && status !== 'all') {
    appointments = appointments.filter(a => a.status === status);
  }

  if (q) {
    appointments = appointments.filter(a => 
      a.title.toLowerCase().includes(q) ||
      a.client.toLowerCase().includes(q)
    );
  }

  // Sort chronologically
  appointments.sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());

  return NextResponse.json({
    appointments,
    total: appointments.length,
    upcoming: appointments.filter(a => new Date(a.date) >= new Date()).length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.title || !body.client || !body.date) {
      return NextResponse.json({ error: 'Title, client, and date are required' }, { status: 400 });
    }

    const db = readDB();
    const appt: Appointment = {
      id: uuidv4(),
      title: body.title.trim(),
      client: body.client.trim(),
      date: body.date,
      time: body.time || '10:00',
      duration: Number(body.duration) || 60,
      status: body.status || 'confirmed',
      notes: body.notes || '',
      createdAt: new Date().toISOString(),
    };

    db.appointments.unshift(appt);
    writeDB(db);

    addActivity(
      'appointment_booked',
      'Appointment booked',
      `${appt.title} with ${appt.client} confirmed for ${appt.date} at ${appt.time}.`
    );

    return NextResponse.json(appt, { status: 201 });
  } catch (err) {
    console.error('Error booking appointment:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
