import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function GET() {
  return NextResponse.json({ settings: db.settings, team: db.team });
}

export async function PATCH(req: Request) {
  const body = await req.json();
  db.settings = { ...db.settings, ...body };
  return NextResponse.json({ settings: db.settings });
}
