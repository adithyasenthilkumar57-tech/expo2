/**
 * Prisma seed script — populates the database with initial data
 * Run with: npx prisma db seed
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const now = new Date();
const daysAgo = (n: number) => new Date(now.getTime() - n * 86400000);
const daysFromNow = (n: number) => new Date(now.getTime() + n * 86400000);
const dateFmt = (d: Date) => d.toISOString().split('T')[0];

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create admin user
  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'ops3admin123', 12);
  await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@ops3.com' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@ops3.com',
      password: hashedPassword,
      name: 'Marcus Vance',
      role: 'Administrator',
      avatar: 'MV',
    },
  });
  console.log('✅ Admin user created');

  // 2. Create settings
  await prisma.settings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      agentName: 'OpsAgent',
      openingMessage: 'Hi! I can help you qualify your next project and answer pricing or schedule questions.',
      accentColor: '#00d4c8',
      ownerName: 'Marcus Vance',
      ownerEmail: process.env.ADMIN_EMAIL || 'admin@ops3.com',
    },
  });
  console.log('✅ Settings created');

  // 3. Seed leads
  const leadsData = [
    { name: 'Sarah Mitchell', company: 'TechCorp', email: 'sarah@techcorp.com', phone: '+1 555-0101', status: 'hot', score: 92, value: 15000, source: 'Website widget', notes: 'Very interested in the enterprise plan. Has budget approval.', createdAt: daysAgo(2), lastTouch: daysAgo(0) },
    { name: 'James Okafor', company: 'Sora Tech', email: 'james@soratech.io', phone: '+1 555-0102', status: 'hot', score: 85, value: 10000, source: 'Website widget', notes: 'Needs implementation support.', createdAt: daysAgo(3), lastTouch: daysAgo(0) },
    { name: 'Browser Journey', company: 'Journey Labs', email: 'contact@journeylabs.co', phone: '+1 555-0103', status: 'hot', score: 81, value: 22000, source: 'Referral', notes: 'Complex requirements, multiple departments involved.', createdAt: daysAgo(5), lastTouch: daysAgo(1) },
    { name: 'Smoke Operator', company: 'Smoke Systems', email: 'ops@smokesystems.net', phone: '+1 555-0104', status: 'hot', score: 78, value: 8500, source: 'Website widget', notes: '', createdAt: daysAgo(6), lastTouch: daysAgo(1) },
    { name: 'Lisa Park', company: 'NovaBridge', email: 'lisa@novabridge.com', phone: '+1 555-0105', status: 'hot', score: 76, value: 18000, source: 'Cold outreach', notes: '', createdAt: daysAgo(7), lastTouch: daysAgo(2) },
    { name: 'David Chen', company: 'QuantumFlow', email: 'david@quantumflow.ai', status: 'hot', score: 74, value: 30000, source: 'LinkedIn', notes: 'Large enterprise deal.', createdAt: daysAgo(8), lastTouch: daysAgo(2) },
    { name: 'Emma Rodriguez', company: 'Apex Digital', email: 'emma@apexdigital.com', status: 'warm', score: 65, value: 12000, source: 'Website widget', notes: '', createdAt: daysAgo(10), lastTouch: daysAgo(3) },
    { name: 'Marcus Webb', company: 'Stellar Works', email: 'marcus@stellarworks.io', status: 'warm', score: 60, value: 9000, source: 'Referral', notes: '', createdAt: daysAgo(12), lastTouch: daysAgo(4) },
    { name: 'Priya Sharma', company: 'DataForge', email: 'priya@dataforge.co', status: 'warm', score: 58, value: 7500, source: 'Cold outreach', notes: '', createdAt: daysAgo(14), lastTouch: daysAgo(5) },
    { name: 'Tom Bradley', company: 'CloudPeak', email: 'tom@cloudpeak.net', status: 'warm', score: 55, value: 5000, source: 'LinkedIn', notes: '', createdAt: daysAgo(15), lastTouch: daysAgo(5) },
    { name: 'Aisha Jackson', company: 'Momentum Co', email: 'aisha@momentumco.com', status: 'warm', score: 52, value: 11000, source: 'Website widget', notes: '', createdAt: daysAgo(18), lastTouch: daysAgo(7) },
    { name: 'Robert Kim', company: 'Pinnacle Group', email: 'robert@pinnaclegroup.com', status: 'cold', score: 38, value: 4000, source: 'Cold outreach', notes: '', createdAt: daysAgo(20), lastTouch: daysAgo(10) },
    { name: 'Nina Petrova', company: 'Vortex Media', email: 'nina@vortexmedia.com', status: 'cold', score: 30, value: 3500, source: 'LinkedIn', notes: '', createdAt: daysAgo(25), lastTouch: daysAgo(14) },
    { name: 'Chris Nguyen', company: 'RedSpark Labs', email: 'chris@redspark.io', status: 'escalated', score: 88, value: 25000, source: 'Referral', notes: 'Escalated by operator — high urgency, competitor evaluation underway.', createdAt: daysAgo(1), lastTouch: daysAgo(0) },
  ];

  for (const lead of leadsData) {
    await prisma.lead.upsert({
      where: { id: lead.email }, // use email as idempotent key
      update: {},
      create: { ...lead, id: undefined } as Parameters<typeof prisma.lead.create>[0]['data'],
    }).catch(async () => {
      // If upsert fails (ID mismatch), just create
      await prisma.lead.create({ data: lead as Parameters<typeof prisma.lead.create>[0]['data'] }).catch(() => {});
    });
  }
  console.log('✅ Leads seeded');

  // 4. Seed invoices
  const invoicesData = [
    { invoiceNumber: 'INV-2026-004', client: 'TechCorp', email: 'billing@techcorp.com', amount: 8500, dueDate: '2026-03-18', status: 'sent', items: [{ description: 'Discovery Engagement', quantity: 1, unitPrice: 8500 }] },
    { invoiceNumber: 'INV-2026-003', client: 'NovaBridge', email: 'finance@novabridge.com', amount: 12400, dueDate: '2026-02-28', status: 'overdue', items: [{ description: 'Implementation Package', quantity: 1, unitPrice: 12400 }] },
    { invoiceNumber: 'INV-2026-002', client: 'Journey Labs', email: 'accounts@journeylabs.co', amount: 6800, dueDate: '2026-01-15', status: 'paid', items: [{ description: 'Consulting Retainer - Q1', quantity: 2, unitPrice: 3400 }] },
    { invoiceNumber: 'INV-2026-001', client: 'Smoke Systems', email: 'billing@smokesystems.net', amount: 4200, dueDate: '2026-01-05', status: 'paid', items: [{ description: 'Strategy Workshop', quantity: 3, unitPrice: 1400 }] },
    { invoiceNumber: 'INV-2025-012', client: 'DataForge', email: 'admin@dataforge.co', amount: 5500, dueDate: '2026-04-01', status: 'draft', items: [{ description: 'Platform Setup', quantity: 1, unitPrice: 5500 }] },
  ];

  for (const inv of invoicesData) {
    const existing = await prisma.invoice.findUnique({ where: { invoiceNumber: inv.invoiceNumber } });
    if (!existing) {
      await prisma.invoice.create({
        data: {
          invoiceNumber: inv.invoiceNumber,
          client: inv.client,
          email: inv.email,
          amount: inv.amount,
          dueDate: inv.dueDate,
          status: inv.status,
          items: { create: inv.items },
        },
      });
    }
  }
  console.log('✅ Invoices seeded');

  // 5. Seed appointments
  const appointmentsData = [
    { title: 'Discovery Call', client: 'Sarah Mitchell', date: dateFmt(daysFromNow(2)), time: '10:00', duration: 60, status: 'confirmed', notes: 'Enterprise plan walkthrough' },
    { title: 'Demo Presentation', client: 'Chris Nguyen', date: dateFmt(daysFromNow(3)), time: '14:00', duration: 90, status: 'confirmed', notes: 'Show RedSpark integration' },
    { title: 'Follow-up Call', client: 'Emma Rodriguez', date: dateFmt(daysFromNow(5)), time: '11:30', duration: 30, status: 'pending', notes: '' },
  ];

  for (const appt of appointmentsData) {
    const existing = await prisma.appointment.findFirst({ where: { title: appt.title, client: appt.client } });
    if (!existing) {
      await prisma.appointment.create({ data: appt });
    }
  }
  console.log('✅ Appointments seeded');

  // 6. Seed knowledge sources
  const knowledgeData = [
    { name: 'Service & pricing guide.pdf', type: 'pdf', content: 'Our standard discovery engagement starts at $8,500 and includes a 30-day implementation window. Enterprise plans start at $15,000/month with dedicated support. We specialize in autonomous operations, CRM workflows, automated invoicing, appointment synchronization, and conversational AI agents. Our SLA guarantees an average response time of under 90 seconds.', synced: true },
    { name: 'Company FAQs', type: 'text', content: 'Apex Consulting builds autonomous operations platforms for high-velocity teams. We support 50+ integrations including HubSpot, Salesforce, Stripe, QuickBooks, Google Calendar, and Slack. All client data is encrypted at rest and in transit with SOC-2 compliant infrastructure.', synced: true },
    { name: 'Operating SLA & Support Matrix', type: 'text', content: 'Standard operating hours: 24/7 autonomous monitoring. Automated dunning sequences trigger 3 days prior to invoice due date and follow up at 1, 5, and 14 days overdue. High-value leads ($10k+) trigger instant priority escalation to account executives.', synced: true },
  ];

  for (const k of knowledgeData) {
    const existing = await prisma.knowledgeSource.findFirst({ where: { name: k.name } });
    if (!existing) {
      await prisma.knowledgeSource.create({ data: k });
    }
  }
  console.log('✅ Knowledge sources seeded');

  // 7. Seed team members
  const teamData = [
    { name: 'Marcus Vance', email: 'marcus@apexconsulting.com', role: 'Administrator', avatar: 'MV', joinedAt: daysAgo(365) },
    { name: 'Rachel Torres', email: 'rachel@apexconsulting.com', role: 'Manager', avatar: 'RT', joinedAt: daysAgo(180) },
    { name: 'Daniel Park', email: 'daniel@apexconsulting.com', role: 'Viewer', avatar: 'DP', joinedAt: daysAgo(90) },
  ];

  for (const member of teamData) {
    await prisma.teamMember.upsert({
      where: { email: member.email },
      update: {},
      create: member,
    });
  }
  console.log('✅ Team members seeded');

  // 8. Seed activity events
  const activityCount = await prisma.activityEvent.count();
  if (activityCount === 0) {
    await prisma.activityEvent.createMany({
      data: [
        { type: 'lead_captured', title: 'New lead captured', description: 'Sarah Mitchell from TechCorp entered the pipeline.', timestamp: daysAgo(0) },
        { type: 'lead_qualified', title: 'Lead qualified as hot', description: 'Sarah Mitchell · TechCorp · $15,000 budget', timestamp: daysAgo(0) },
        { type: 'invoice_sent', title: 'Invoice sent', description: 'INV-2026-004 sent to TechCorp for $8,500', timestamp: daysAgo(1) },
        { type: 'appointment_booked', title: 'Appointment booked', description: 'Discovery Call with Sarah Mitchell confirmed.', timestamp: daysAgo(2) },
        { type: 'invoice_paid', title: 'Invoice paid', description: 'Journey Labs paid INV-2026-002 — $6,800 collected.', timestamp: daysAgo(3) },
        { type: 'agent_response', title: 'Agent responded', description: 'Operator answered widget queries autonomously.', timestamp: daysAgo(4) },
      ],
    });
    console.log('✅ Activity events seeded');
  }

  console.log('\n🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
