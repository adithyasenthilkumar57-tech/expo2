import { NextResponse } from 'next/server';
import { readDB, writeDB, KnowledgeSource } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  const db = readDB();
  return NextResponse.json({ sources: db.knowledge || [] });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name || !body.content) {
      return NextResponse.json({ error: 'Name and content are required' }, { status: 400 });
    }

    const db = readDB();
    const source: KnowledgeSource = {
      id: uuidv4(),
      name: body.name.trim(),
      type: body.type || 'text',
      content: body.content.trim(),
      synced: true,
      createdAt: new Date().toISOString(),
    };

    db.knowledge.push(source);
    writeDB(db);

    return NextResponse.json(source, { status: 201 });
  } catch (err) {
    console.error('Error adding knowledge source:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing source ID' }, { status: 400 });

  const db = readDB();
  const idx = db.knowledge.findIndex(k => k.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Source not found' }, { status: 404 });

  const deleted = db.knowledge.splice(idx, 1)[0];
  writeDB(db);
  return NextResponse.json({ success: true, deletedSource: deleted });
}
