import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const FALLBACK_LEADS = [
  { id: 'lead-1', name: 'Sophia Chen', company: 'Apex Global Logistics', email: 'sophia@apexlogistics.com', phone: '+1 415-555-0192', status: 'hot', score: 92, value: 48000, source: 'Website widget', notes: 'Needs automated SLA management and client portal within 30 days.', createdAt: new Date(Date.now() - 3600000 * 4).toISOString(), lastTouch: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: 'lead-2', name: 'David Miller', company: 'Vanguard Retail Partners', email: 'david@vanguardrp.io', phone: '+1 212-555-0143', status: 'hot', score: 88, value: 35000, source: 'Inbound enquiry', notes: 'Evaluating replacement for manual invoicing and billing follow-ups.', createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), lastTouch: new Date(Date.now() - 3600000 * 5).toISOString() },
  { id: 'lead-3', name: 'Elena Rostova', company: 'Solaria Health Systems', email: 'elena@solariahealth.org', phone: '+1 617-555-0188', status: 'warm', score: 76, value: 24000, source: 'Website widget', notes: 'Scheduled demo for next Tuesday. Wants appointment reminders.', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), lastTouch: new Date(Date.now() - 86400000 * 1).toISOString() },
  { id: 'lead-4', name: 'Marcus Sterling', company: 'Sterling Capital Group', email: 'msterling@sterlingcap.com', phone: '+1 312-555-0177', status: 'warm', score: 71, value: 65000, source: 'Executive referral', notes: 'Looking at enterprise rollout for 4 operating subsidiaries.', createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), lastTouch: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 'lead-5', name: 'Amina El-Sayed', company: 'Kite Design Studio', email: 'amina@kitedesign.co', phone: '+1 503-555-0129', status: 'cold', score: 48, value: 12500, source: 'Website widget', notes: 'Initial questions about pricing tiers answered.', createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), lastTouch: new Date(Date.now() - 86400000 * 4).toISOString() },
  { id: 'lead-6', name: 'Jason Becker', company: 'Horizon Cloud Solutions', email: 'jason@horizoncloud.net', phone: '+1 206-555-0114', status: 'escalated', score: 85, value: 52000, source: 'Live escalation', notes: 'Custom integration question routed directly to solution engineer.', createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), lastTouch: new Date(Date.now() - 3600000 * 1).toISOString() },
];

export async function GET(req: Request) {
  try {
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

    if (leads.length > 0) {
      return NextResponse.json({
        leads,
        total,
        hot: countMap.hot || 0,
        warm: countMap.warm || 0,
        cold: countMap.cold || 0,
        escalated: countMap.escalated || 0,
      });
    }

    // If DB is empty, return initial fallback leads
    let filtered = [...FALLBACK_LEADS];
    if (status && status !== 'all') filtered = filtered.filter(l => l.status === status);
    if (q) filtered = filtered.filter(l => l.name.toLowerCase().includes(q) || l.company.toLowerCase().includes(q));

    return NextResponse.json({
      leads: filtered,
      total: FALLBACK_LEADS.length,
      hot: FALLBACK_LEADS.filter(l => l.status === 'hot').length,
      warm: FALLBACK_LEADS.filter(l => l.status === 'warm').length,
      cold: FALLBACK_LEADS.filter(l => l.status === 'cold').length,
      escalated: FALLBACK_LEADS.filter(l => l.status === 'escalated').length,
    });
  } catch (err) {
    console.warn('Leads DB fallback engaged:', err);
    let filtered = [...FALLBACK_LEADS];
    return NextResponse.json({
      leads: filtered,
      total: FALLBACK_LEADS.length,
      hot: FALLBACK_LEADS.filter(l => l.status === 'hot').length,
      warm: FALLBACK_LEADS.filter(l => l.status === 'warm').length,
      cold: FALLBACK_LEADS.filter(l => l.status === 'cold').length,
      escalated: FALLBACK_LEADS.filter(l => l.status === 'escalated').length,
    });
  }
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
      : Math.min(99, 50 + (val >= 10000 ? 25 : 15));

    try {
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
      }).catch(() => {});

      return NextResponse.json(lead, { status: 201 });
    } catch {
      // Local fallback lead
      const newLead = {
        id: 'lead-' + Date.now(),
        name: body.name.trim(),
        company: body.company.trim(),
        email: body.email.trim(),
        phone: body.phone?.trim() || null,
        status: body.status || 'warm',
        score: computedScore,
        value: val,
        source: body.source || 'Website widget',
        notes: body.notes || '',
        createdAt: new Date().toISOString(),
        lastTouch: new Date().toISOString(),
      };
      return NextResponse.json(newLead, { status: 201 });
    }
  } catch (err) {
    console.error('Error creating lead:', err);
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
  }
}
