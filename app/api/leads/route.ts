import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const q = searchParams.get('q')?.toLowerCase();
  const sort = searchParams.get('sort') || 'recent';

  const where: Record<string, unknown> = {};

  if (status && status !== 'all') {
    where.status = status;
  }

  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { company: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
      { notes: { contains: q, mode: 'insensitive' } },
    ];
  }

  const orderBy =
    sort === 'score'
      ? { score: 'desc' as const }
      : sort === 'value'
      ? { value: 'desc' as const }
      : { createdAt: 'desc' as const };

  const [leads, counts] = await Promise.all([
    prisma.lead.findMany({ where, orderBy }),
    prisma.lead.groupBy({
      by: ['status'],
      _count: { status: true },
    }),
  ]);

  const total = await prisma.lead.count();
  const countMap = Object.fromEntries(counts.map((c) => [c.status, c._count.status]));

  return NextResponse.json({
    leads,
    total,
    hot: countMap.hot || 0,
    warm: countMap.warm || 0,
    cold: countMap.cold || 0,
    escalated: countMap.escalated || 0,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name || !body.company || !body.email) {
      return NextResponse.json({ error: 'Name, company, and email are required' }, { status: 400 });
    }

    const val = Number(body.value) || 0;
    const computedScore = body.score !== undefined
      ? Number(body.score)
      : (() => {
          let s = 50;
          if (val >= 10000) s += 25;
          else if (val >= 5000) s += 15;
          const domain = (body.email || '').split('@')[1]?.toLowerCase();
          const generic = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'];
          if (domain && !generic.includes(domain)) s += 15;
          if (body.phone && body.phone.trim().length > 5) s += 10;
          if (body.source === 'Referral' || body.source === 'Website widget') s += 5;
          return Math.min(99, s);
        })();

    const lead = await prisma.lead.create({
      data: {
        name: body.name.trim(),
        company: body.company.trim(),
        email: body.email.trim(),
        phone: body.phone?.trim() || null,
        status: body.status || 'warm',
        score: computedScore,
        value: val,
        source: body.source || 'Website widget',
        notes: body.notes || '',
      },
    });

    await prisma.activityEvent.create({
      data: {
        type: 'lead_captured',
        title: 'New lead captured',
        description: `${lead.name} from ${lead.company} entered the pipeline.`,
      },
    });

    if (lead.status === 'hot') {
      await prisma.activityEvent.create({
        data: {
          type: 'lead_qualified',
          title: 'Lead qualified as hot',
          description: `${lead.name} · ${lead.company} · $${lead.value.toLocaleString()} value`,
        },
      });
    }

    return NextResponse.json(lead, { status: 201 });
  } catch (err) {
    console.error('Error creating lead:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
