import { NextResponse } from 'next/server';
import { db, KnowledgeSource } from '@/lib/store';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  return NextResponse.json({ sources: db.knowledge });
}

export async function POST(req: Request) {
  const body = await req.json();
  const source: KnowledgeSource = {
    id: uuidv4(),
    name: body.name,
    type: body.type || 'text',
    content: body.content || '',
    synced: true,
    createdAt: new Date().toISOString(),
  };
  db.knowledge.push(source);
  return NextResponse.json(source, { status: 201 });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const idx = db.knowledge.findIndex(k => k.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  db.knowledge.splice(idx, 1);
  return NextResponse.json({ success: true });
}
