import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function GET() {
  const leads = db.leads;
  const invoices = db.invoices;
  
  const totalPipeline = leads.reduce((s, l) => s + l.value, 0);
  const qualifiedLeads = leads.filter(l => l.status === 'hot').length;
  const collectedInvoices = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const outstandingInvoices = invoices.filter(i => i.status === 'sent' || i.status === 'draft').reduce((s, i) => s + i.amount, 0);
  const overdueInvoices = invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount, 0);
  const paidCount = invoices.filter(i => i.status === 'paid').length;
  const totalInvoices = invoices.length;
  const recoveryRate = totalInvoices > 0 ? Math.round((paidCount / totalInvoices) * 100) : 0;

  return NextResponse.json({
    activePipeline: totalPipeline,
    qualifiedLeads,
    avgResponseSla: '1m 24s',
    invoiceRecovery: `${recoveryRate}%`,
    collected: collectedInvoices,
    outstanding: outstandingInvoices,
    overdue: overdueInvoices,
    recoveryRate,
    recentActivity: db.activity.slice(0, 6),
    pipelineVelocity: {
      total: 86400,
      growth: 32.6,
      weekly: [28000, 34000, 31000, 28000, 45000, 47000, 52000, 58000, 72000, 68000, 85000, 86400],
    },
  });
}
