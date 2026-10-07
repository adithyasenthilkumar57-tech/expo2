import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const team = await prisma.teamMember.findMany({ orderBy: { joinedAt: 'asc' } });
  return NextResponse.json({ team });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name || !body.email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const initials = body.name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'TM';

    const member = await prisma.teamMember.create({
      data: {
        name: body.name.trim(),
        email: body.email.trim(),
        role: body.role || 'Viewer',
        avatar: initials,
      },
    });

    await prisma.activityEvent.create({
      data: {
        type: 'team_member_added',
        title: 'Team member invited',
        description: `${member.name} (${member.email}) was invited as ${member.role}.`,
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (err) {
    console.error('Error inviting team member:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
