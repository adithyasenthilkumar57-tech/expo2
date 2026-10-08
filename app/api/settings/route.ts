import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DEFAULT_SETTINGS = {
  id: 'singleton',
  ownerName: 'Marcus Vance',
  ownerEmail: 'cresconix@gmail.com',
  agentName: 'OpsAgent',
  accentColor: '#00d4c8',
  autoDunning: true,
  dailyBriefing: true,
};

const DEFAULT_TEAM = [
  { id: 'tm-1', name: 'Marcus Vance', email: 'cresconix@gmail.com', role: 'Owner', avatar: 'MV', joinedAt: '2026-01-15' },
  { id: 'tm-2', name: 'Sarah Chen', email: 'sarah@ops3.com', role: 'Operator', avatar: 'SC', joinedAt: '2026-02-01' },
  { id: 'tm-3', name: 'Alex Rivera', email: 'alex@ops3.com', role: 'Support', avatar: 'AR', joinedAt: '2026-03-10' },
];

export async function GET() {
  try {
    const [settings, team] = await Promise.all([
      prisma.settings.findUnique({ where: { id: 'singleton' } }).catch(() => null),
      prisma.teamMember.findMany({ orderBy: { joinedAt: 'asc' } }).catch(() => []),
    ]);

    const finalSettings = settings || DEFAULT_SETTINGS;
    const finalTeam = (team && team.length > 0) ? team : DEFAULT_TEAM;

    return NextResponse.json({ settings: finalSettings, team: finalTeam });
  } catch (err) {
    console.warn('Settings DB fallback engaged:', err);
    return NextResponse.json({ settings: DEFAULT_SETTINGS, team: DEFAULT_TEAM });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    try {
      const settings = await prisma.settings.upsert({
        where: { id: 'singleton' },
        create: { id: 'singleton', ...body },
        update: body,
      });

      return NextResponse.json({ settings });
    } catch {
      return NextResponse.json({ settings: { ...DEFAULT_SETTINGS, ...body } });
    }
  } catch (err) {
    console.error('Error updating settings:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
