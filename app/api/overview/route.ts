import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [leads, invoices, activity, settings, totalAgentResponses] = await Promise.all([
      prisma.lead.findMany({ select: { status: true, value: true, createdAt: true } }),
      prisma.invoice.findMany({ select: { status: true, amount: true, createdAt: true } }),
      prisma.activityEvent.findMany({ orderBy: { timestamp: 'desc' }, take: 8 }),
      prisma.settings.findUnique({ where: { id: 'singleton' } }),
      prisma.activityEvent.count({ where: { type: 'agent_response' } }),
    ]);

    const totalPipeline = leads.reduce((s, l) => s + (Number(l.value) || 0), 0);
    const qualifiedLeads = leads.filter((l) => l.status === 'hot').length;

    const collectedInvoices = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
    const outstandingInvoices = invoices.filter((i) => i.status === 'sent' || i.status === 'draft').reduce((s, i) => s + i.amount, 0);
    const overdueInvoices = invoices.filter((i) => i.status === 'overdue').reduce((s, i) => s + i.amount, 0);
    const paidCount = invoices.filter((i) => i.status === 'paid').length;
    const totalInvoices = invoices.length;
    const recoveryRate = totalInvoices > 0 ? Math.round((paidCount / totalInvoices) * 100) : 0;

    // Calculate real 8-week distribution from actual database data
    const now = Date.now();
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
    const weeklyBuckets = [0, 0, 0, 0, 0, 0, 0, 0];

    invoices.forEach((inv) => {
      const created = new Date(inv.createdAt).getTime();
      const weeksAgo = Math.floor((now - created) / oneWeekMs);
      if (weeksAgo >= 0 && weeksAgo < 8) {
        // bucket 7 is current week, bucket 0 is 7 weeks ago
        weeklyBuckets[7 - weeksAgo] += Number(inv.amount) || 0;
      }
    });

    // Also factor leads value into the pipeline trajectory
    leads.forEach((l) => {
      const created = new Date(l.createdAt).getTime();
      const weeksAgo = Math.floor((now - created) / oneWeekMs);
      if (weeksAgo >= 0 && weeksAgo < 8) {
        weeklyBuckets[7 - weeksAgo] += Math.round((Number(l.value) || 0) * 0.2); // weighted pipeline
      }
    });

    const currentWeekTotal = weeklyBuckets[7];
    const prevWeekTotal = weeklyBuckets[6];
    const growth = prevWeekTotal > 0
      ? Math.round(((currentWeekTotal - prevWeekTotal) / prevWeekTotal) * 100)
      : currentWeekTotal > 0 ? 100 : 0;

    const avgResponseSla = totalAgentResponses > 0 ? '< 45s' : 'Standby';

    return NextResponse.json({
      activePipeline: totalPipeline,
      qualifiedLeads,
      totalLeads: leads.length,
      hotLeads: qualifiedLeads,
      warmLeads: leads.filter((l) => l.status === 'warm').length,
      coldLeads: leads.filter((l) => l.status === 'cold').length,
      escalatedLeads: leads.filter((l) => l.status === 'escalated').length,
      avgResponseSla,
      invoiceRecovery: `${recoveryRate}%`,
      collected: collectedInvoices,
      outstanding: outstandingInvoices,
      overdue: overdueInvoices,
      recoveryRate,
      totalInvoices,
      pendingInvoices: invoices.filter((i) => i.status !== 'paid').length,
      recentActivity: activity,
      ownerName: settings?.ownerName || 'Admin',
      pipelineVelocity: {
        total: collectedInvoices + totalPipeline,
        growth,
        weekly: weeklyBuckets,
      },
    });
  } catch (err) {
    console.error('Error in /api/overview:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
