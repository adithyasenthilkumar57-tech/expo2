// In-memory store for OPS Platform
import { v4 as uuidv4 } from 'uuid';

export type LeadStatus = 'hot' | 'warm' | 'cold' | 'escalated';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  status: LeadStatus;
  score: number;
  value: number;
  source: string;
  notes?: string;
  createdAt: string;
  lastTouch: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  client: string;
  email: string;
  amount: number;
  dueDate: string;
  status: InvoiceStatus;
  items: { description: string; quantity: number; unitPrice: number }[];
  createdAt: string;
}

export interface Appointment {
  id: string;
  title: string;
  client: string;
  date: string;
  time: string;
  duration: number; // minutes
  status: 'confirmed' | 'pending' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface KnowledgeSource {
  id: string;
  name: string;
  type: 'pdf' | 'url' | 'text';
  content: string;
  synced: boolean;
  createdAt: string;
}

export interface ActivityEvent {
  id: string;
  type: 'lead_captured' | 'lead_qualified' | 'invoice_sent' | 'invoice_paid' | 'appointment_booked' | 'agent_response';
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Administrator' | 'Manager' | 'Viewer';
  avatar: string;
  joinedAt: string;
}

export interface WorkspaceSettings {
  agentName: string;
  openingMessage: string;
  accentColor: string;
  ownerName: string;
  ownerEmail: string;
  notifyNewLead: boolean;
  notifyInvoicePaid: boolean;
  notifyAppointment: boolean;
}

// ─── Seed Data ───────────────────────────────────────────────────────────────

const now = new Date();
const fmt = (d: Date) => d.toISOString();
const daysAgo = (n: number) => fmt(new Date(now.getTime() - n * 86400000));
const daysFromNow = (n: number) => fmt(new Date(now.getTime() + n * 86400000));

export const db: {
  leads: Lead[];
  invoices: Invoice[];
  appointments: Appointment[];
  knowledge: KnowledgeSource[];
  activity: ActivityEvent[];
  team: TeamMember[];
  settings: WorkspaceSettings;
} = {
  leads: [
    { id: uuidv4(), name: 'Sarah Mitchell', company: 'TechCorp', email: 'sarah@techcorp.com', phone: '+1 555-0101', status: 'hot', score: 92, value: 15000, source: 'Website widget', notes: 'Very interested in the enterprise plan. Has budget approval.', createdAt: daysAgo(2), lastTouch: daysAgo(0) },
    { id: uuidv4(), name: 'James Okafor', company: 'Sora Tech', email: 'james@soratech.io', phone: '+1 555-0102', status: 'hot', score: 85, value: 10000, source: 'Website widget', notes: 'Needs implementation support.', createdAt: daysAgo(3), lastTouch: daysAgo(0) },
    { id: uuidv4(), name: 'Browser Journey', company: 'Journey Labs', email: 'contact@journeylabs.co', phone: '+1 555-0103', status: 'hot', score: 81, value: 22000, source: 'Referral', notes: 'Complex requirements, multiple departments involved.', createdAt: daysAgo(5), lastTouch: daysAgo(1) },
    { id: uuidv4(), name: 'Smoke Operator', company: 'Smoke Systems', email: 'ops@smokesystems.net', phone: '+1 555-0104', status: 'hot', score: 78, value: 8500, source: 'Website widget', notes: '', createdAt: daysAgo(6), lastTouch: daysAgo(1) },
    { id: uuidv4(), name: 'Lisa Park', company: 'NovaBridge', email: 'lisa@novabridge.com', phone: '+1 555-0105', status: 'hot', score: 76, value: 18000, source: 'Cold outreach', notes: '', createdAt: daysAgo(7), lastTouch: daysAgo(2) },
    { id: uuidv4(), name: 'David Chen', company: 'QuantumFlow', email: 'david@quantumflow.ai', status: 'hot', score: 74, value: 30000, source: 'LinkedIn', notes: 'Large enterprise deal.', createdAt: daysAgo(8), lastTouch: daysAgo(2) },
    { id: uuidv4(), name: 'Emma Rodriguez', company: 'Apex Digital', email: 'emma@apexdigital.com', status: 'warm', score: 65, value: 12000, source: 'Website widget', notes: '', createdAt: daysAgo(10), lastTouch: daysAgo(3) },
    { id: uuidv4(), name: 'Marcus Webb', company: 'Stellar Works', email: 'marcus@stellarworks.io', status: 'warm', score: 60, value: 9000, source: 'Referral', notes: '', createdAt: daysAgo(12), lastTouch: daysAgo(4) },
    { id: uuidv4(), name: 'Priya Sharma', company: 'DataForge', email: 'priya@dataforge.co', status: 'warm', score: 58, value: 7500, source: 'Cold outreach', notes: '', createdAt: daysAgo(14), lastTouch: daysAgo(5) },
    { id: uuidv4(), name: 'Tom Bradley', company: 'CloudPeak', email: 'tom@cloudpeak.net', status: 'warm', score: 55, value: 5000, source: 'LinkedIn', notes: '', createdAt: daysAgo(15), lastTouch: daysAgo(5) },
    { id: uuidv4(), name: 'Aisha Jackson', company: 'Momentum Co', email: 'aisha@momentumco.com', status: 'warm', score: 52, value: 11000, source: 'Website widget', notes: '', createdAt: daysAgo(18), lastTouch: daysAgo(7) },
    { id: uuidv4(), name: 'Robert Kim', company: 'Pinnacle Group', email: 'robert@pinnaclegroup.com', status: 'cold', score: 38, value: 4000, source: 'Cold outreach', notes: '', createdAt: daysAgo(20), lastTouch: daysAgo(10) },
    { id: uuidv4(), name: 'Nina Petrova', company: 'Vortex Media', email: 'nina@vortexmedia.com', status: 'cold', score: 30, value: 3500, source: 'LinkedIn', notes: '', createdAt: daysAgo(25), lastTouch: daysAgo(14) },
    { id: uuidv4(), name: 'Chris Nguyen', company: 'RedSpark Labs', email: 'chris@redspark.io', status: 'escalated', score: 88, value: 25000, source: 'Referral', notes: 'Escalated by operator — high urgency, competitor evaluation underway.', createdAt: daysAgo(1), lastTouch: daysAgo(0) },
  ],

  invoices: [
    { id: uuidv4(), invoiceNumber: 'INV-2026-004', client: 'TechCorp', email: 'billing@techcorp.com', amount: 8500, dueDate: '2026-03-18', status: 'sent', items: [{ description: 'Discovery Engagement', quantity: 1, unitPrice: 8500 }], createdAt: daysAgo(10) },
    { id: uuidv4(), invoiceNumber: 'INV-2026-003', client: 'NovaBridge', email: 'finance@novabridge.com', amount: 12400, dueDate: '2026-02-28', status: 'overdue', items: [{ description: 'Implementation Package', quantity: 1, unitPrice: 12400 }], createdAt: daysAgo(45) },
    { id: uuidv4(), invoiceNumber: 'INV-2026-002', client: 'Journey Labs', email: 'accounts@journeylabs.co', amount: 6800, dueDate: '2026-01-15', status: 'paid', items: [{ description: 'Consulting Retainer - Q1', quantity: 2, unitPrice: 3400 }], createdAt: daysAgo(80) },
    { id: uuidv4(), invoiceNumber: 'INV-2026-001', client: 'Smoke Systems', email: 'billing@smokesystems.net', amount: 4200, dueDate: '2026-01-05', status: 'paid', items: [{ description: 'Strategy Workshop', quantity: 3, unitPrice: 1400 }], createdAt: daysAgo(90) },
    { id: uuidv4(), invoiceNumber: 'INV-2025-012', client: 'DataForge', email: 'admin@dataforge.co', amount: 5500, dueDate: '2026-04-01', status: 'draft', items: [{ description: 'Platform Setup', quantity: 1, unitPrice: 5500 }], createdAt: daysAgo(1) },
  ],

  appointments: [
    { id: uuidv4(), title: 'Discovery Call', client: 'Sarah Mitchell', date: daysFromNow(2).split('T')[0], time: '10:00', duration: 60, status: 'confirmed', notes: 'Enterprise plan walkthrough', createdAt: daysAgo(3) },
    { id: uuidv4(), title: 'Demo Presentation', client: 'Chris Nguyen', date: daysFromNow(3).split('T')[0], time: '14:00', duration: 90, status: 'confirmed', notes: 'Show RedSpark integration', createdAt: daysAgo(2) },
    { id: uuidv4(), title: 'Follow-up Call', client: 'Emma Rodriguez', date: daysFromNow(5).split('T')[0], time: '11:30', duration: 30, status: 'pending', notes: '', createdAt: daysAgo(1) },
  ],

  knowledge: [
    { id: uuidv4(), name: 'Service & pricing guide.pdf', type: 'pdf', content: 'Our standard discovery engagement starts at $8,500 and includes a 30-day implementation window. Enterprise plans start at $15,000/month with dedicated support.', synced: true, createdAt: daysAgo(30) },
    { id: uuidv4(), name: 'Company FAQs', type: 'text', content: 'We specialize in autonomous operations consulting. We support 50+ integrations.', synced: true, createdAt: daysAgo(20) },
  ],

  activity: [
    { id: uuidv4(), type: 'lead_captured', title: 'New lead captured', description: 'sxsdasads from wdsdds entered the pipeline.', timestamp: daysAgo(0) },
    { id: uuidv4(), type: 'lead_captured', title: 'New lead captured', description: 'Browser Journey from Journey Labs entered the pipeline.', timestamp: daysAgo(0) },
    { id: uuidv4(), type: 'lead_captured', title: 'New lead captured', description: 'Smoke Operator from Smoke Systems entered the pipeline.', timestamp: daysAgo(0) },
    { id: uuidv4(), type: 'lead_qualified', title: 'Lead qualified as hot', description: 'Sarah Mitchell · TechCorp · $15,000 budget', timestamp: daysAgo(0) },
    { id: uuidv4(), type: 'invoice_sent', title: 'Invoice sent', description: 'INV-2026-004 sent to TechCorp for $8,500', timestamp: daysAgo(1) },
    { id: uuidv4(), type: 'appointment_booked', title: 'Appointment booked', description: 'Discovery Call with Sarah Mitchell confirmed for next week.', timestamp: daysAgo(2) },
    { id: uuidv4(), type: 'invoice_paid', title: 'Invoice paid', description: 'Journey Labs paid INV-2026-002 — $6,800 collected.', timestamp: daysAgo(3) },
    { id: uuidv4(), type: 'agent_response', title: 'Agent responded', description: 'Operator answered 12 widget queries autonomously — 100% grounded.', timestamp: daysAgo(4) },
  ],

  team: [
    { id: uuidv4(), name: 'Marcus Vance', email: 'marcus@apexconsulting.com', role: 'Administrator', avatar: 'MV', joinedAt: daysAgo(365) },
    { id: uuidv4(), name: 'Rachel Torres', email: 'rachel@apexconsulting.com', role: 'Manager', avatar: 'RT', joinedAt: daysAgo(180) },
    { id: uuidv4(), name: 'Daniel Park', email: 'daniel@apexconsulting.com', role: 'Viewer', avatar: 'DP', joinedAt: daysAgo(90) },
  ],

  settings: {
    agentName: 'OpsAgent',
    openingMessage: 'Hi! I can help you qualify your next project.',
    accentColor: '#00d4c8',
    ownerName: 'Marcus Vance',
    ownerEmail: 'marcus@apexconsulting.com',
    notifyNewLead: true,
    notifyInvoicePaid: true,
    notifyAppointment: true,
  },
};
