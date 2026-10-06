import { NextResponse } from 'next/server';
import { readDB, writeDB, addActivity, TeamMember } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  const db = readDB();
  return NextResponse.json({ team: db.team || [] });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name || !body.email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const db = readDB();
    const initials = body.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'TM';
    const member: TeamMember = {
      id: uuidv4(),
      name: body.name.trim(),
      email: body.email.trim(),
      role: body.role || 'Viewer',
      avatar: initials,
      joinedAt: new Date().toISOString(),
    };

    db.team.push(member);
    writeDB(db);

    addActivity(
      'team_member_added',
      'Team member invited',
      `${member.name} (${member.email}) was invited as ${member.role}.`
    );

    return NextResponse.json(member, { status: 201 });
  } catch (err) {
    console.error('Error inviting team member:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
