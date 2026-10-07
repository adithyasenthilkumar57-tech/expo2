import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const q = searchParams.get('q')?.toLowerCase();

  const where: Record<string, unknown> = {};

  if (status && status !== 'all') {
    where.status = status;
  }

  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { client: { contains: q, mode: 'insensitive' } },
    ];
  }

  const appointments = await prisma.appointment.findMany({
    where,
    orderBy: [{ date: 'asc' }, { time: 'asc' }],
  });

  const today = new Date().toISOString().split('T')[0];

  return NextResponse.json({
    appointments,
    total: appointments.length,
    upcoming: appointments.filter((a) => a.date >= today).length,
    confirmed: appointments.filter((a) => a.status === 'confirmed').length,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.title || !body.client || !body.date) {
      return NextResponse.json({ error: 'Title, client, and date are required' }, { status: 400 });
    }

    const appt = await prisma.appointment.create({
      data: {
        title: body.title.trim(),
        client: body.client.trim(),
        date: body.date,
        time: body.time || '10:00',
        duration: Number(body.duration) || 60,
        status: body.status || 'confirmed',
        notes: body.notes || '',
      },
    });

    await prisma.activityEvent.create({
      data: {
        type: 'appointment_booked',
        title: 'Appointment booked',
        description: `${appt.title} with ${appt.client} confirmed for ${appt.date} at ${appt.time}.`,
      },
    });

    return NextResponse.json(appt, { status: 201 });
  } catch (err) {
    console.error('Error booking appointment:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
