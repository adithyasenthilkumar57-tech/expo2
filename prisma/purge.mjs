import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function purge() {
  console.log('Purging dummy data from database...');
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.knowledgeSource.deleteMany();
  await prisma.activityEvent.deleteMany();
  await prisma.teamMember.deleteMany();
  
  const [leads, invoices, appts, knowledge, events, team] = await Promise.all([
    prisma.lead.count(),
    prisma.invoice.count(),
    prisma.appointment.count(),
    prisma.knowledgeSource.count(),
    prisma.activityEvent.count(),
    prisma.teamMember.count(),
  ]);

  console.log('Database state after purge:', {
    leads,
    invoices,
    appointments: appts,
    knowledge,
    events,
    team,
  });
  console.log('Dummy data completely wiped!');
}

purge()
  .catch((e) => {
    console.error('Error during purge:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
