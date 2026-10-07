import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const [settings, team] = await Promise.all([
    prisma.settings.findUnique({ where: { id: 'singleton' } }),
    prisma.teamMember.findMany({ orderBy: { joinedAt: 'asc' } }),
  ]);

  // Create defaults if not yet seeded
  const finalSettings = settings ?? await prisma.settings.create({ data: { id: 'singleton' } });

  return NextResponse.json({ settings: finalSettings, team });
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    const settings = await prisma.settings.upsert({
      where: { id: 'singleton' },
      create: { id: 'singleton', ...body },
      update: body,
    });

    await prisma.activityEvent.create({
      data: {
        type: 'agent_response',
        title: 'Workspace settings updated',
        description: `Workspace configuration modified by ${settings.ownerName}.`,
      },
    });

    return NextResponse.json({ settings });
  } catch (err) {
    console.error('Error updating settings:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
