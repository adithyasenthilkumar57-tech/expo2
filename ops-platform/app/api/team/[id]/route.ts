import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = readDB();
  const idx = db.team.findIndex(m => m.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Team member not found' }, { status: 404 });

  const deleted = db.team.splice(idx, 1)[0];
  writeDB(db);
  return NextResponse.json({ success: true, deletedMember: deleted });
}
