import { NextResponse } from 'next/server';
import { readDB, writeDB, addActivity } from '@/lib/db';

export async function GET() {
  const db = readDB();
  return NextResponse.json({ settings: db.settings, team: db.team });
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const db = readDB();
    db.settings = { ...db.settings, ...body };
    writeDB(db);

    addActivity(
      'agent_response',
      'Workspace settings updated',
      `Workspace configuration modified by ${db.settings.ownerName}.`
    );

    return NextResponse.json({ settings: db.settings });
  } catch (err) {
    console.error('Error updating settings:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
