import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const sources = await prisma.knowledgeSource.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ sources });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name || !body.content) {
      return NextResponse.json({ error: 'Name and content are required' }, { status: 400 });
    }

    const source = await prisma.knowledgeSource.create({
      data: {
        name: body.name.trim(),
        type: body.type || 'text',
        content: body.content.trim(),
        synced: true,
      },
    });

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

  const existing = await prisma.knowledgeSource.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: 'Source not found' }, { status: 404 });

  await prisma.knowledgeSource.delete({ where: { id } });
  return NextResponse.json({ success: true, deletedSource: existing });
}
