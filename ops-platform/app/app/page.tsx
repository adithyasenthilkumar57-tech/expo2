'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Zap, X, ChevronDown, LayoutDashboard, KanbanSquare, FileText, 
  Calendar, BookOpen, Cpu, Activity, Settings, Bell, Sun, Moon,
  Search, HelpCircle, SlidersHorizontal, List, Grid3X3,
  Plus, Mail, Trash2, Edit, Check, MoreHorizontal, Upload,
  AlertTriangle, Clock, DollarSign, TrendingUp, Users, RefreshCw,
  ArrowUpRight, Palette, Shield, ExternalLink
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────
type Page = 'overview' | 'leads' | 'invoices' | 'appointments' | 'knowledge' | 'widget' | 'activity' | 'settings';
type Theme = 'dark' | 'light';

interface Lead {
  id: string; name: string; company: string; email: string; phone?: string;
  status: 'hot' | 'warm' | 'cold' | 'escalated'; score: number; value: number;
  source: string; notes?: string; createdAt: string; lastTouch: string;
}
interface Invoice {
  id: string; invoiceNumber: string; client: string; email: string; amount: number;
  dueDate: string; status: 'draft' | 'sent' | 'paid' | 'overdue';
  items: { description: string; quantity: number; unitPrice: number }[];
  createdAt: string;
}
interface Appointment {
  id: string; title: string; client: string; date: string; time: string;
  duration: number; status: 'confirmed' | 'pending' | 'cancelled'; notes?: string; createdAt: string;
}
interface KnowledgeSource {
  id: string; name: string; type: 'pdf' | 'url' | 'text'; content: string; synced: boolean; createdAt: string;
}
interface ActivityEvent {
  id: string; type: string; title: string; description: string; timestamp: string;
}

// ─── Utilities ────────────────────────────────────────────────────────────────
function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
function fmtTime(ts: string) {
  return new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
function fmtMoney(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1).replace('.0', '')}k`;
  return `$${n.toLocaleString()}`;
}

// ─── Toast Component ──────────────────────────────────────────────────────────
function Toast({ msg, type, onDone }: { msg: string; type: 'success' | 'error'; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className={`toast ${type}`}>
      {type === 'success' ? <Check size={16} color="var(--accent-green)" /> : <AlertTriangle size={16} color="var(--accent-red)" />}
      {msg}
    </div>
  );
}

// ─── Command Palette ──────────────────────────────────────────────────────────
function CommandPalette({ onClose, onNavigate }: { onClose: () => void; onNavigate: (p: Page) => void }) {
  const [q, setQ] = useState('');
  const items = [
    { label: 'Overview', page: 'overview' as Page, icon: <LayoutDashboard size={15} /> },
    { label: 'Leads pipeline', page: 'leads' as Page, icon: <KanbanSquare size={15} /> },
    { label: 'Invoices', page: 'invoices' as Page, icon: <FileText size={15} /> },
    { label: 'Appointments', page: 'appointments' as Page, icon: <Calendar size={15} /> },
    { label: 'Knowledge base', page: 'knowledge' as Page, icon: <BookOpen size={15} /> },
    { label: 'Smart widget', page: 'widget' as Page, icon: <Cpu size={15} /> },
    { label: 'Activity log', page: 'activity' as Page, icon: <Activity size={15} /> },
    { label: 'Workspace settings', page: 'settings' as Page, icon: <Settings size={15} /> },
  ].filter(i => !q || i.label.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="command-palette" onClick={e => e.stopPropagation()}>
        <div className="command-input-wrap">
          <Search size={16} color="var(--text-muted)" />
          <input className="command-input" placeholder="Search workspace…" autoFocus value={q} onChange={e => setQ(e.target.value)} />
          <span className="search-kbd">ESC</span>
        </div>
        <div className="command-list">
          <div className="command-section-label">Navigation</div>
          {items.map(item => (
            <div key={item.page} className="command-item" onClick={() => { onNavigate(item.page); onClose(); }}>
              <span style={{ color: 'var(--text-muted)' }}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Add Lead Modal ───────────────────────────────────────────────────────────
function AddLeadModal({ onClose, onAdd }: { onClose: () => void; onAdd: (lead: Partial<Lead>) => void }) {
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', status: 'warm', value: '', source: 'Website widget', notes: '' });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const submit = (e: React.FormEvent) => { e.preventDefault(); onAdd(form); onClose(); };
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Add lead</span>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body">
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Full name *</label>
                <input className="form-input" required value={form.name} onChange={e => set('name', e.target.value)} placeholder="Jane Smith" />
              </div>
              <div className="form-group">
                <label className="form-label">Company *</label>
                <input className="form-input" required value={form.company} onChange={e => set('company', e.target.value)} placeholder="Acme Corp" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input className="form-input" type="email" required value={form.email} onChange={e => set('email', e.target.value)} placeholder="jane@acme.com" />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+1 555-0100" />
              </div>
              <div className="form-group">
                <label className="form-label">Potential value ($)</label>
                <input className="form-input" type="number" value={form.value} onChange={e => set('value', e.target.value)} placeholder="10000" />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
                  <option value="hot">Hot</option>
                  <option value="warm">Warm</option>
                  <option value="cold">Cold</option>
                  <option value="escalated">Escalated</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Source</label>
                <select className="form-select" value={form.source} onChange={e => set('source', e.target.value)}>
                  <option>Website widget</option>
                  <option>Referral</option>
                  <option>LinkedIn</option>
                  <option>Cold outreach</option>
                  <option>Manual</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-textarea" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any relevant notes…" />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm"><Plus size={14} /> Add lead</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Add Invoice Modal ────────────────────────────────────────────────────────
function AddInvoiceModal({ onClose, onAdd }: { onClose: () => void; onAdd: (inv: Partial<Invoice>) => void }) {
  const [form, setForm] = useState({ client: '', email: '', dueDate: '', description: '', amount: '' });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const submit = (e: React.FormEvent) => { e.preventDefault(); onAdd(form); onClose(); };
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Create invoice</span>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Client name *</label>
              <input className="form-input" required value={form.client} onChange={e => set('client', e.target.value)} placeholder="TechCorp" />
            </div>
            <div className="form-group">
              <label className="form-label">Billing email *</label>
              <input className="form-input" type="email" required value={form.email} onChange={e => set('email', e.target.value)} placeholder="billing@techcorp.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <input className="form-input" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Discovery Engagement" />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Amount ($) *</label>
                <input className="form-input" type="number" required value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="8500" />
              </div>
              <div className="form-group">
                <label className="form-label">Due date *</label>
                <input className="form-input" type="date" required value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm"><Plus size={14} /> Create invoice</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Book Slot Modal ──────────────────────────────────────────────────────────
function BookSlotModal({ onClose, onAdd }: { onClose: () => void; onAdd: (a: Partial<Appointment>) => void }) {
  const [form, setForm] = useState({ title: '', client: '', date: '', time: '10:00', duration: '60', notes: '' });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const submit = (e: React.FormEvent) => { e.preventDefault(); onAdd(form); onClose(); };
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Book a slot</span>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Appointment title *</label>
              <input className="form-input" required value={form.title} onChange={e => set('title', e.target.value)} placeholder="Discovery Call" />
            </div>
            <div className="form-group">
              <label className="form-label">Client name *</label>
              <input className="form-input" required value={form.client} onChange={e => set('client', e.target.value)} placeholder="Sarah Mitchell" />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input className="form-input" type="date" required value={form.date} onChange={e => set('date', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Time *</label>
                <input className="form-input" type="time" required value={form.time} onChange={e => set('time', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Duration (minutes)</label>
              <select className="form-select" value={form.duration} onChange={e => set('duration', e.target.value)}>
                <option value="30">30 minutes</option>
                <option value="60">60 minutes</option>
                <option value="90">90 minutes</option>
                <option value="120">120 minutes</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-textarea" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any relevant context…" />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm"><Calendar size={14} /> Book slot</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Lead Drawer ──────────────────────────────────────────────────────────────
function LeadDrawer({ lead, onClose, onSave, onDelete }: { lead: Lead; onClose: () => void; onSave: (id: string, data: Partial<Lead>) => void; onDelete: (id: string) => void }) {
  const [form, setForm] = useState({ ...lead });
  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }));
  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <div className="drawer">
        <div className="drawer-header">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="user-avatar" style={{ width: 40, height: 40, fontSize: 14 }}>{lead.name[0]}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{lead.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{lead.company}</div>
              </div>
            </div>
            <button className="modal-close" onClick={onClose}><X size={18} /></button>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-primary btn-sm" onClick={() => { onSave(lead.id, form); onClose(); }}><Check size={13} /> Save changes</button>
            <button className="btn btn-danger btn-sm" onClick={() => { onDelete(lead.id); onClose(); }}><Trash2 size={13} /></button>
          </div>
        </div>
        <div className="drawer-body">
          <div className="form-group">
            <label className="form-label">Name</label>
            <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Company</label>
            <input className="form-input" value={form.company} onChange={e => set('company', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" value={form.email} onChange={e => set('email', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input className="form-input" value={form.phone || ''} onChange={e => set('phone', e.target.value)} />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="hot">Hot</option>
                <option value="warm">Warm</option>
                <option value="cold">Cold</option>
                <option value="escalated">Escalated</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Potential value ($)</label>
              <input className="form-input" type="number" value={form.value} onChange={e => set('value', Number(e.target.value))} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Source</label>
            <input className="form-input" value={form.source} onChange={e => set('source', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Intent score</label>
            <div className="flex items-center gap-8">
              <span style={{ fontWeight: 700, fontSize: 18 }}>{form.score}/100</span>
              <input type="range" min={0} max={100} value={form.score} onChange={e => set('score', Number(e.target.value))} style={{ flex: 1 }} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-textarea" value={form.notes || ''} onChange={e => set('notes', e.target.value)} rows={4} />
          </div>
          <div className="divider" />
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            <div className="inline-label-value">
              <span className="inline-label">Created</span>
              <span className="inline-value">{fmtDate(lead.createdAt)}</span>
            </div>
            <div className="inline-label-value">
              <span className="inline-label">Last touch</span>
              <span className="inline-value">{timeAgo(lead.lastTouch)}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Overview Page ────────────────────────────────────────────────────────────
function OverviewPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [data, setData] = useState<{
    activePipeline: number; qualifiedLeads: number; avgResponseSla: string; invoiceRecovery: string;
    collected: number; outstanding: number; overdue: number; recoveryRate: number;
    recentActivity: ActivityEvent[]; pipelineVelocity: { total: number; growth: number; weekly: number[] };
  } | null>(null);

  useEffect(() => {
    fetch('/api/overview').then(r => r.json()).then(setData);
  }, []);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

  const chartData = data?.pipelineVelocity.weekly.map((v, i) => ({
    name: `W${Math.floor(i / 3) + 1}`,
    value: v,
  })) ?? [];

  return (
    <div className="page-content">
      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="hero-content">
          <div className="hero-label"><span className="hero-dot" /> Live workspace telemetry</div>
          <div className="hero-title">Good {greeting}, Marcus.</div>
          <div className="hero-subtitle">Your operator is already moving.</div>
          <div className="hero-desc">Qualified leads, recovered revenue, and scheduled conversations — all coordinated from one intelligent workspace.</div>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={() => onNavigate('leads')}><Plus size={16} /> Create a lead</button>
            <button className="btn btn-secondary" onClick={() => onNavigate('widget')}><Cpu size={15} /> Test your agent</button>
          </div>
        </div>
        <div className="hero-visual">
          <Zap size={48} color="var(--accent-cyan)" strokeWidth={1.5} />
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid mb-6">
        <div className="stat-card">
          <div>
            <div className="stat-label">Active pipeline</div>
            <div className="stat-value">{data ? `$${(data.activePipeline / 1000).toFixed(0)}k` : '—'}</div>
            <div className="stat-change positive">↗ +18.4% vs last month</div>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(0,212,200,0.1)' }}>
            <TrendingUp size={20} color="var(--accent-cyan)" />
          </div>
        </div>
        <div className="stat-card">
          <div>
            <div className="stat-label">Qualified leads</div>
            <div className="stat-value">{data?.qualifiedLeads ?? '—'}</div>
            <div className="stat-change positive">↗ +1 today</div>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(124,110,244,0.1)' }}>
            <Users size={20} color="var(--accent-purple)" />
          </div>
        </div>
        <div className="stat-card">
          <div>
            <div className="stat-label">Avg response SLA</div>
            <div className="stat-value" style={{ fontSize: 22, letterSpacing: -0.5 }}>{data?.avgResponseSla ?? '—'}</div>
            <div className="stat-change positive">↘ 42s faster than average</div>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(245,166,35,0.1)' }}>
            <Clock size={20} color="var(--accent-amber)" />
          </div>
        </div>
        <div className="stat-card">
          <div>
            <div className="stat-label">Invoice recovery</div>
            <div className="stat-value">{data?.invoiceRecovery ?? '—'}</div>
            <div className="stat-change positive">↗ +8.2% this quarter</div>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(0,196,140,0.1)' }}>
            <Check size={20} color="var(--accent-green)" style={{ border: '2px solid var(--accent-green)', borderRadius: '50%', padding: 2 }} />
          </div>
        </div>
      </div>

      {/* Chart + Feed */}
      <div className="grid-2">
        {/* Pipeline Velocity Chart */}
        <div className="card card-p">
          <div className="section-label mb-2">Pipeline velocity</div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1 }}>
                {data ? fmtMoney(data.pipelineVelocity.total) : '—'}
              </div>
              <div style={{ fontSize: 12 }}>
                <span className="font-medium">Autonomous deal qualification</span>
                <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>Last 30 days · revenue influenced</span>
              </div>
            </div>
            {data && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(0,196,140,0.12)', color: 'var(--accent-green)', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                <TrendingUp size={12} /> {data.pipelineVelocity.growth}%
              </div>
            )}
          </div>
          {data && (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chartData} barCategoryGap="30%">
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 8, fontSize: 12 }}
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  formatter={(v: number) => [`$${v.toLocaleString()}`, 'Value']}
                />
                <Bar dataKey="value" fill="var(--accent-purple)" radius={[4, 4, 0, 0]}
                  label={false}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Agent Activity Feed */}
        <div className="card card-p">
          <div className="flex items-center justify-between mb-3">
            <div className="section-label">Live operations feed</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(0,196,140,0.1)', color: 'var(--accent-green)', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, border: '1px solid rgba(0,196,140,0.2)' }}>
              <span style={{ width: 6, height: 6, background: 'var(--accent-green)', borderRadius: '50%' }} /> Real-time
            </div>
          </div>
          <div className="section-title mb-3">Agent activity</div>
          {data?.recentActivity.map(event => (
            <div key={event.id} className="activity-item">
              <div className="activity-icon">
                {event.type === 'lead_captured' ? <KanbanSquare size={14} color="var(--accent-cyan)" /> :
                  event.type === 'lead_qualified' ? <Zap size={14} color="var(--accent-amber)" /> :
                  event.type === 'invoice_paid' ? <DollarSign size={14} color="var(--accent-green)" /> :
                  event.type === 'appointment_booked' ? <Calendar size={14} color="var(--accent-purple)" /> :
                  <Activity size={14} color="var(--text-muted)" />}
              </div>
              <div className="activity-content">
                <div className="activity-title">{event.title}</div>
                <div className="activity-desc">{event.description}</div>
              </div>
              <div className="activity-time">{timeAgo(event.timestamp)}</div>
            </div>
          ))}
          <button className="btn btn-ghost btn-sm mt-4" onClick={() => onNavigate('activity')} style={{ width: '100%', justifyContent: 'center' }}>
            View all activity <ArrowUpRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Leads Page ───────────────────────────────────────────────────────────────
function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const load = async () => {
    const p = new URLSearchParams();
    if (filter !== 'all') p.set('status', filter);
    if (q) p.set('q', q);
    const r = await fetch(`/api/leads?${p}`);
    const d = await r.json();
    setLeads(d.leads);
  };
  useEffect(() => { load(); }, [filter, q]);

  const addLead = async (data: Partial<Lead>) => {
    await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    setToast({ msg: 'Lead added successfully', type: 'success' });
    load();
  };

  const saveLead = async (id: string, data: Partial<Lead>) => {
    await fetch(`/api/leads/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    setToast({ msg: 'Lead updated', type: 'success' });
    load();
  };

  const deleteLead = async (id: string) => {
    await fetch(`/api/leads/${id}`, { method: 'DELETE' });
    setToast({ msg: 'Lead deleted', type: 'success' });
    load();
  };

  const allLeads = leads;
  const hot = leads.filter(l => l.status === 'hot').length;
  const warm = leads.filter(l => l.status === 'warm').length;
  const cold = leads.filter(l => l.status === 'cold').length;
  const escalated = leads.filter(l => l.status === 'escalated').length;
  const avgScore = leads.length ? Math.round(leads.reduce((s, l) => s + l.score, 0) / leads.length) : 0;

  const statusColors: Record<string, string> = { hot: 'var(--accent-red)', warm: 'var(--accent-amber)', cold: 'var(--accent-blue)', escalated: 'var(--accent-purple)' };

  return (
    <div className="page-content">
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
      {showAdd && <AddLeadModal onClose={() => setShowAdd(false)} onAdd={addLead} />}
      {selected && <LeadDrawer lead={selected} onClose={() => setSelected(null)} onSave={saveLead} onDelete={deleteLead} />}

      <div className="page-header page-header-row">
        <div>
          <div className="page-label">Autonomous qualification</div>
          <h1 className="page-title">Leads pipeline</h1>
          <p className="page-description">See every opportunity, its intent score, and the next best action in one place.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}><Plus size={15} /> Add lead</button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        {[
          { label: 'Total leads', value: String(leads.length).padStart(2, '0') },
          { label: 'Hot intent', value: String(hot).padStart(2, '0') },
          { label: 'This week', value: `+${leads.filter(l => { const d = Date.now() - new Date(l.createdAt).getTime(); return d < 7 * 86400000; }).length.toString().padStart(2, '0')}` },
          { label: 'Avg score', value: String(avgScore) },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ fontSize: 32 }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex items-center justify-between" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center gap-3">
            <div className="filter-tabs">
              {[
                { key: 'all', label: 'All leads' },
                { key: 'hot', label: `Hot ${hot}` },
                { key: 'warm', label: `Warm ${warm}` },
                { key: 'cold', label: `Cold ${cold}` },
                { key: 'escalated', label: `Escalated ${escalated}` },
              ].map(tab => (
                <button key={tab.key} className={`filter-tab ${filter === tab.key ? 'active' : ''}`}
                  onClick={() => setFilter(tab.key)}>
                  {tab.key !== 'all' && <span className="tab-dot" style={{ background: filter === tab.key ? 'currentColor' : statusColors[tab.key] }} />}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="search-input-wrap">
              <Search size={14} className="search-input-icon" />
              <input className="search-input" placeholder="Search leads" value={q} onChange={e => setQ(e.target.value)} />
            </div>
            <div className="view-toggles">
              <button className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}><List size={15} /></button>
              <button className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}><Grid3X3 size={15} /></button>
            </div>
          </div>
        </div>

        {viewMode === 'list' ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Lead</th>
                <th>Intent</th>
                <th>Potential value</th>
                <th>Source</th>
                <th>Last touch</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {allLeads.map(lead => (
                <tr key={lead.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(lead)}>
                  <td>
                    <div className="flex items-center gap-10">
                      <div className="user-avatar" style={{ flexShrink: 0 }}>{lead.name[0]}</div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{lead.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{lead.company}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-8">
                      <span className={`badge badge-${lead.status}`}>{lead.status}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{lead.score}/100</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>${lead.value.toLocaleString()}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{lead.source}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {new Date(lead.lastTouch).toLocaleDateString() === new Date().toLocaleDateString()
                      ? `Today, ${fmtTime(lead.lastTouch)}`
                      : timeAgo(lead.lastTouch)}
                  </td>
                  <td>
                    <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                      <button className="icon-btn" style={{ width: 28, height: 28 }} title="Send email" onClick={() => window.open(`mailto:${lead.email}`)}><Mail size={13} /></button>
                      <button className="icon-btn" style={{ width: 28, height: 28, color: 'var(--accent-red)', borderColor: 'rgba(255,91,91,0.2)' }} title="Delete" onClick={() => deleteLead(lead.id)}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="leads-grid" style={{ padding: 20 }}>
            {allLeads.map(lead => (
              <div key={lead.id} className="lead-card" onClick={() => setSelected(lead)}>
                <div className="flex items-center gap-10 mb-3">
                  <div className="user-avatar">{lead.name[0]}</div>
                  <div className="min-w-0">
                    <div className="truncate" style={{ fontWeight: 600 }}>{lead.name}</div>
                    <div className="truncate" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{lead.company}</div>
                  </div>
                  <span className={`badge badge-${lead.status}`} style={{ marginLeft: 'auto', flexShrink: 0 }}>{lead.status}</span>
                </div>
                <div className="flex items-center justify-between" style={{ fontSize: 12 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Score</span>
                  <span style={{ fontWeight: 700 }}>{lead.score}/100</span>
                </div>
                <div className="score-bar mt-2 mb-3">
                  <div className="score-fill" style={{ width: `${lead.score}%` }} />
                </div>
                <div className="flex items-center justify-between" style={{ fontSize: 12 }}>
                  <span style={{ color: 'var(--text-muted)' }}>{lead.source}</span>
                  <span style={{ fontWeight: 600 }}>${lead.value.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        {allLeads.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon"><KanbanSquare size={40} color="var(--text-muted)" /></div>
            <div className="empty-state-title">No leads found</div>
            <div className="empty-state-desc">Add your first lead to get started.</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Invoices Page ────────────────────────────────────────────────────────────
function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [autoDunning, setAutoDunning] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const load = async () => {
    const r = await fetch('/api/invoices');
    const d = await r.json();
    setInvoices(d.invoices);
  };
  useEffect(() => { load(); }, []);

  const addInvoice = async (data: Partial<Invoice>) => {
    await fetch('/api/invoices', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    setToast({ msg: 'Invoice created', type: 'success' });
    load();
  };

  const updateStatus = async (id: string, status: Invoice['status']) => {
    await fetch(`/api/invoices/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    setToast({ msg: `Status updated to ${status}`, type: 'success' });
    load();
  };

  const deleteInvoice = async (id: string) => {
    await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
    setToast({ msg: 'Invoice deleted', type: 'success' });
    load();
  };

  const collected = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const outstanding = invoices.filter(i => i.status === 'sent' || i.status === 'draft').reduce((s, i) => s + i.amount, 0);
  const overdue = invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount, 0);
  const paidCount = invoices.filter(i => i.status === 'paid').length;
  const recoveryRate = invoices.length > 0 ? Math.round((paidCount / invoices.length) * 100) : 0;

  return (
    <div className="page-content">
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
      {showAdd && <AddInvoiceModal onClose={() => setShowAdd(false)} onAdd={addInvoice} />}

      <div className="page-header page-header-row">
        <div>
          <div className="page-label">Financial SLA</div>
          <h1 className="page-title">Invoices & recovery</h1>
          <p className="page-description">Keep cash moving with professional billing and autonomous follow-up sequences.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}><Plus size={15} /> Create invoice</button>
      </div>

      <div className="stats-grid mb-6">
        {[
          { label: 'Collected', value: `$${collected.toLocaleString()}`, sub: 'This quarter', icon: <DollarSign size={20} color="var(--accent-green)" />, iconBg: 'rgba(0,196,140,0.1)' },
          { label: 'Outstanding', value: `$${outstanding.toLocaleString()}`, sub: `Across ${invoices.filter(i => i.status === 'sent').length} invoices`, icon: <Clock size={20} color="var(--accent-cyan)" />, iconBg: 'rgba(0,212,200,0.1)' },
          { label: 'Overdue', value: `$${overdue.toLocaleString()}`, sub: 'Needs attention', icon: <AlertTriangle size={20} color="var(--accent-red)" />, iconBg: 'rgba(255,91,91,0.1)' },
          { label: 'Recovery rate', value: `${recoveryRate}%`, sub: '+8.2% this quarter', icon: <ArrowUpRight size={20} color="var(--accent-purple)" />, iconBg: 'rgba(124,110,244,0.1)' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ fontSize: 26 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.sub}</div>
            </div>
            <div className="stat-icon" style={{ background: s.iconBg }}>{s.icon}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex items-center justify-between" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div>
            <div className="section-label">Receivables ledger</div>
            <div className="section-title">Recent invoices</div>
          </div>
          <div className="flex items-center gap-8">
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--accent-amber)', fontWeight: 600 }}>
              <span style={{ width: 8, height: 8, background: 'var(--accent-amber)', borderRadius: '50%' }} />
              Auto-dunning active
            </span>
            <label className="toggle">
              <input type="checkbox" checked={autoDunning} onChange={e => setAutoDunning(e.target.checked)} />
              <span className="toggle-slider" />
            </label>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Client</th>
              <th>Amount</th>
              <th>Due date</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id}>
                <td>
                  <div className="flex items-center gap-8">
                    <FileText size={14} color="var(--text-muted)" />
                    <span style={{ fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{inv.invoiceNumber}</span>
                  </div>
                </td>
                <td style={{ color: 'var(--accent-cyan)', fontWeight: 500 }}>{inv.client}</td>
                <td style={{ fontWeight: 700 }}>${inv.amount.toLocaleString()}</td>
                <td style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{inv.dueDate}</td>
                <td>
                  <div className="flex items-center gap-8">
                    {inv.status === 'sent' && <span className="badge badge-sent">↗ SENT</span>}
                    <select
                      className="status-select"
                      value={inv.status}
                      onChange={e => updateStatus(inv.id, e.target.value as Invoice['status'])}
                      onClick={e => e.stopPropagation()}
                      style={{ color: inv.status === 'paid' ? 'var(--accent-green)' : inv.status === 'overdue' ? 'var(--accent-red)' : inv.status === 'draft' ? 'var(--text-muted)' : 'var(--accent-cyan)' }}
                    >
                      <option value="draft">draft</option>
                      <option value="sent">sent</option>
                      <option value="paid">paid</option>
                      <option value="overdue">overdue</option>
                    </select>
                  </div>
                </td>
                <td>
                  <button className="icon-btn" style={{ width: 28, height: 28, color: 'var(--accent-red)', borderColor: 'rgba(255,91,91,0.2)' }} onClick={() => deleteInvoice(inv.id)}><Trash2 size={13} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {invoices.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon"><FileText size={40} color="var(--text-muted)" /></div>
            <div className="empty-state-title">No invoices yet</div>
            <div className="empty-state-desc">Create your first invoice to start tracking payments.</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Appointments Page ────────────────────────────────────────────────────────
function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const load = async () => {
    const r = await fetch('/api/appointments');
    const d = await r.json();
    setAppointments(d.appointments);
  };
  useEffect(() => { load(); }, []);

  const addAppt = async (data: Partial<Appointment>) => {
    await fetch('/api/appointments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    setToast({ msg: 'Appointment booked!', type: 'success' });
    load();
  };

  const upcoming = appointments.filter(a => new Date(a.date) >= new Date());
  const confirmed = appointments.filter(a => a.status === 'confirmed').length;

  return (
    <div className="page-content">
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
      {showAdd && <BookSlotModal onClose={() => setShowAdd(false)} onAdd={addAppt} />}

      <div className="page-header page-header-row">
        <div>
          <div className="page-label">Zero no-show operations</div>
          <h1 className="page-title">Appointments</h1>
          <p className="page-description">Keep every conversation moving with confirmation and reminder automation.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}><Plus size={15} /> Book slot</button>
      </div>

      <div className="stats-grid mb-6" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        {[
          { label: 'Upcoming', value: String(upcoming.length).padStart(2, '0'), icon: <Calendar size={20} color="var(--accent-cyan)" />, iconBg: 'rgba(0,212,200,0.1)' },
          { label: 'Confirmed', value: String(confirmed).padStart(2, '0'), icon: <Check size={20} color="var(--accent-green)" />, iconBg: 'rgba(0,196,140,0.1)' },
          { label: 'Reminder rate', value: '98%', icon: <Clock size={20} color="var(--accent-purple)" />, iconBg: 'rgba(124,110,244,0.1)' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ fontSize: 32 }}>{s.value}</div>
            </div>
            <div className="stat-icon" style={{ background: s.iconBg }}>{s.icon}</div>
          </div>
        ))}
      </div>

      {/* Week Banner */}
      {upcoming.length > 0 && (
        <div className="calendar-week mb-4">
          <div className="calendar-month-badge">
            {new Date(upcoming[0].date).toLocaleString('en-US', { month: 'short' }).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Week of {fmtDate(upcoming[0].date)}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Your operator is monitoring {upcoming.length} conversation{upcoming.length !== 1 ? 's' : ''}</div>
          </div>
        </div>
      )}

      {/* Appointments List */}
      {appointments.length > 0 ? (
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Client</th>
                <th>Date</th>
                <th>Time</th>
                <th>Duration</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(appt => (
                <tr key={appt.id}>
                  <td style={{ fontWeight: 600 }}>{appt.title}</td>
                  <td>{appt.client}</td>
                  <td style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{fmtDate(appt.date)}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{appt.time}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{appt.duration}m</td>
                  <td>
                    <span className={`badge ${appt.status === 'confirmed' ? 'badge-paid' : appt.status === 'pending' ? 'badge-warm' : 'badge-overdue'}`}>
                      {appt.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <Calendar size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>No appointments yet</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Book your first slot to get started.</div>
        </div>
      )}
    </div>
  );
}

// ─── Knowledge Base Page ──────────────────────────────────────────────────────
function KnowledgePage() {
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newContent, setNewContent] = useState('');
  const [testQ, setTestQ] = useState('');
  const [testAnswer, setTestAnswer] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const load = async () => {
    const r = await fetch('/api/knowledge');
    const d = await r.json();
    setSources(d.sources);
  };
  useEffect(() => { load(); }, []);

  const addSource = async () => {
    if (!newName) return;
    await fetch('/api/knowledge', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newName, type: 'text', content: newContent }) });
    setNewName(''); setNewContent(''); setShowAdd(false);
    setToast({ msg: 'Source added and synced', type: 'success' });
    load();
  };

  const deleteSource = async (id: string) => {
    await fetch(`/api/knowledge?id=${id}`, { method: 'DELETE' });
    setToast({ msg: 'Source removed', type: 'success' });
    load();
  };

  const testResponse = () => {
    if (!testQ) return;
    // Simulate grounded response
    const found = sources.find(s => s.content.toLowerCase().includes(testQ.toLowerCase().split(' ').find(w => w.length > 4) || ''));
    if (found) {
      setTestAnswer(found.content.slice(0, 200) + (found.content.length > 200 ? '...' : ''));
    } else {
      setTestAnswer('Our standard discovery engagement starts at $8,500 and includes a 30-day implementation window.');
    }
  };

  return (
    <div className="page-content">
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}

      <div className="page-header page-header-row">
        <div>
          <div className="page-label">RAG context layer</div>
          <h1 className="page-title">Knowledge base</h1>
          <p className="page-description">Ground every autonomous answer in your actual offers, FAQs, and operating rules.</p>
        </div>
        <div className="flex gap-2">
          <input className="search-input" style={{ width: 220 }} placeholder="Add FAQ source…" value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && setShowAdd(true)} />
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}><Plus size={15} /> Add source</button>
        </div>
      </div>

      {showAdd && (
        <div className="modal-backdrop" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Add knowledge source</span>
              <button className="modal-close" onClick={() => setShowAdd(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Source name</label>
                <input className="form-input" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Service & pricing guide" />
              </div>
              <div className="form-group">
                <label className="form-label">Content</label>
                <textarea className="form-textarea" value={newContent} onChange={e => setNewContent(e.target.value)} rows={6} placeholder="Paste your FAQ content, pricing info, or operating rules here…" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={addSource}><Plus size={14} /> Add source</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid-2">
        {/* Grounded Sources */}
        <div className="card card-p">
          <div className="section-label">Grounded sources</div>
          <div className="flex items-center justify-between mb-4">
            <div className="section-title">Your private context</div>
            <span className="badge badge-synced">SYNCED</span>
          </div>
          {sources.map(src => (
            <div key={src.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ width: 36, height: 36, background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {src.type === 'pdf' ? <FileText size={16} color="var(--accent-red)" /> : <BookOpen size={16} color="var(--accent-cyan)" />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{src.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  {src.synced ? <span style={{ color: 'var(--accent-green)' }}>✓ Synced</span> : 'Not synced'} · Added {timeAgo(src.createdAt)}
                </div>
              </div>
              <button className="icon-btn" style={{ width: 28, height: 28, flexShrink: 0 }} onClick={() => deleteSource(src.id)}><Trash2 size={12} /></button>
            </div>
          ))}
          {sources.length === 0 && (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No sources added yet.</div>
            </div>
          )}
          <button className="btn btn-secondary btn-sm mt-4" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setShowAdd(true)}>
            <Upload size={13} /> Upload PDF or paste content
          </button>
        </div>

        {/* Grounding Inspector */}
        <div className="card card-p">
          <div className="flex items-center gap-10 mb-4">
            <div style={{ width: 40, height: 40, background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Search size={18} color="var(--accent-cyan)" />
            </div>
            <div>
              <div className="section-label">Grounding inspector</div>
              <div className="section-title">Test a response</div>
            </div>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>
            Ask a question and verify which private sources your operator uses before it responds to a customer.
          </p>
          <div className="code-block mb-3" style={{ display: testAnswer ? 'block' : 'none' }}>
            <div style={{ color: 'var(--text-primary)', marginBottom: 8 }}>"{testAnswer}"</div>
            <div style={{ color: 'var(--accent-green)', fontSize: 12 }}>✓ Grounded in {sources[0]?.name || 'knowledge base'}</div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>ⓘ Responses are grounded before they are sent.</div>
          <div className="form-group">
            <label className="form-label">Test question</label>
            <input className="form-input" value={testQ} onChange={e => setTestQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && testResponse()} placeholder="e.g. What does discovery cost?" />
          </div>
          <button className="btn btn-primary btn-sm" onClick={testResponse}><Search size={13} /> Test response</button>
        </div>
      </div>
    </div>
  );
}

// ─── Smart Widget Page ────────────────────────────────────────────────────────
function SmartWidgetPage() {
  const [settings, setSettings] = useState({ agentName: 'OpsAgent', openingMessage: 'Hi! I can help you qualify your next project.', accentColor: '#00d4c8' });
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hi! I can help you qualify your next project.' },
    { role: 'user', text: "I'm looking for help with a new project." },
    { role: 'bot', text: "Great — I can help with that. What outcome are you hoping to achieve?" },
  ]);
  const [input, setInput] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const colors = ['#00d4c8', '#7c6ef4', '#3b7bff', '#ff5b5b', '#f5a623', '#00c48c'];

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => {
      if (d.settings) setSettings({ agentName: d.settings.agentName, openingMessage: d.settings.openingMessage, accentColor: d.settings.accentColor });
    });
  }, []);

  const saveSettings = async () => {
    await fetch('/api/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) });
    setToast({ msg: 'Widget settings saved', type: 'success' });
  };

  const sendMsg = () => {
    if (!input.trim()) return;
    setMessages(m => [...m, { role: 'user', text: input }, { role: 'bot', text: "Thanks for sharing that. Could you tell me more about your timeline and budget?" }]);
    setInput('');
  };

  return (
    <div className="page-content">
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}

      <div className="page-header">
        <div className="page-label">Embeddable agent</div>
        <h1 className="page-title">Smart widget</h1>
        <p className="page-description">Give every visitor a helpful first conversation with your trained operations agent.</p>
      </div>

      <div className="grid-2">
        {/* Live Preview */}
        <div className="card card-p">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="section-label">Live preview</div>
              <div className="section-title">Your customer view</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--accent-green)', fontWeight: 600 }}>
              <span style={{ width: 8, height: 8, background: 'var(--accent-green)', borderRadius: '50%' }} /> Online
            </div>
          </div>

          {/* Chat Interface */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, background: settings.accentColor, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Cpu size={16} color="#080d14" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{settings.agentName}</div>
                <div style={{ fontSize: 11, color: 'var(--accent-green)' }}>Online now</div>
              </div>
              <button style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <ExternalLink size={14} />
              </button>
            </div>
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 10, minHeight: 260 }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div className={`chat-bubble ${m.role}`} style={m.role === 'bot' ? {} : { background: settings.accentColor }}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: '0 12px 12px', display: 'flex', gap: 8 }}>
              <input className="form-input" style={{ flex: 1 }} placeholder="Type a message…" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMsg()} />
              <button className="btn btn-primary btn-sm" onClick={sendMsg} style={{ background: settings.accentColor }}>Send</button>
            </div>
          </div>
        </div>

        {/* Persona Settings */}
        <div className="card card-p">
          <div className="flex items-center gap-10 mb-4">
            <div style={{ width: 40, height: 40, background: 'var(--accent-cyan-dim)', border: '1px solid rgba(0,212,200,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Palette size={18} color="var(--accent-cyan)" />
            </div>
            <div>
              <div className="section-label">Persona settings</div>
              <div className="section-title">Make it yours</div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Agent name</label>
            <input className="form-input" value={settings.agentName} onChange={e => setSettings(s => ({ ...s, agentName: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Opening message</label>
            <textarea className="form-textarea" value={settings.openingMessage} onChange={e => setSettings(s => ({ ...s, openingMessage: e.target.value }))} rows={3} />
          </div>
          <div className="form-group">
            <label className="form-label">Accent color</label>
            <div className="flex gap-2 mt-2">
              {colors.map(c => (
                <div key={c} className={`color-swatch ${settings.accentColor === c ? 'selected' : ''}`} style={{ background: c }} onClick={() => setSettings(s => ({ ...s, accentColor: c }))} />
              ))}
            </div>
          </div>
          <button className="btn btn-primary mt-2" onClick={saveSettings}>Save widget settings</button>
        </div>
      </div>
    </div>
  );
}

// ─── Activity Log Page ────────────────────────────────────────────────────────
function ActivityLogPage() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    fetch('/api/activity').then(r => r.json()).then(d => setEvents(d.events));
  }, []);

  const iconMap: Record<string, React.ReactNode> = {
    lead_captured: <KanbanSquare size={14} color="var(--accent-cyan)" />,
    lead_qualified: <Zap size={14} color="var(--accent-amber)" />,
    invoice_sent: <FileText size={14} color="var(--accent-blue)" />,
    invoice_paid: <DollarSign size={14} color="var(--accent-green)" />,
    appointment_booked: <Calendar size={14} color="var(--accent-purple)" />,
    agent_response: <Cpu size={14} color="var(--text-muted)" />,
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-label">Audit-ready telemetry</div>
        <h1 className="page-title">Activity log</h1>
        <p className="page-description">A transparent timeline of every autonomous decision and operational trigger.</p>
      </div>

      <div className="card card-p">
        <div className="flex items-center gap-8 mb-4">
          <Bell size={16} color="var(--accent-cyan)" />
          <span style={{ fontWeight: 600 }}>Recent events</span>
          <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>{events.length} events</span>
        </div>
        {events.length > 0 ? events.map(ev => (
          <div key={ev.id} className="activity-item">
            <div className="activity-icon">{iconMap[ev.type] || <Activity size={14} color="var(--text-muted)" />}</div>
            <div className="activity-content">
              <div className="activity-title">{ev.title}</div>
              <div className="activity-desc">{ev.description}</div>
            </div>
            <div className="activity-time">{timeAgo(ev.timestamp)}</div>
          </div>
        )) : (
          <div className="empty-state">
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No activity yet. Events will appear here as your operator takes actions.</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Settings Page ────────────────────────────────────────────────────────────
function SettingsPage() {
  const [tab, setTab] = useState('account');
  const [form, setForm] = useState({ ownerName: 'Marcus Vance', ownerEmail: 'marcus@apexconsulting.com', notifyNewLead: true, notifyInvoicePaid: true, notifyAppointment: true });
  const [team, setTeam] = useState<{ id: string; name: string; email: string; role: string; avatar: string }[]>([]);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => {
      if (d.settings) setForm(f => ({ ...f, ownerName: d.settings.ownerName, ownerEmail: d.settings.ownerEmail, notifyNewLead: d.settings.notifyNewLead, notifyInvoicePaid: d.settings.notifyInvoicePaid, notifyAppointment: d.settings.notifyAppointment }));
      if (d.team) setTeam(d.team);
    });
  }, []);

  const save = async () => {
    await fetch('/api/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setToast({ msg: 'Settings saved', type: 'success' });
  };

  return (
    <div className="page-content">
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}

      <div className="page-header">
        <div className="page-label">Workspace controls</div>
        <h1 className="page-title">Settings</h1>
        <p className="page-description">Tune your workspace, operator behavior, and team access from one place.</p>
      </div>

      <div className="grid-2" style={{ alignItems: 'flex-start' }}>
        {/* Settings Nav */}
        <div style={{ gridColumn: '1', maxWidth: 220 }}>
          <div className="card card-p">
            <div className="settings-tabs">
              {[
                { key: 'account', label: 'Account', icon: <Users size={14} /> },
                { key: 'team', label: 'Team access', icon: <Users size={14} /> },
                { key: 'notifications', label: 'Notifications', icon: <Bell size={14} /> },
                { key: 'security', label: 'Security', icon: <Shield size={14} /> },
              ].map(t => (
                <button key={t.key} className={`settings-tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div style={{ gridColumn: '2' }}>
          {tab === 'account' && (
            <div className="card card-p">
              <div className="flex items-center gap-10 mb-5">
                <div className="user-avatar" style={{ width: 48, height: 48, fontSize: 16 }}>MV</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>Account profile</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Your workspace owner details</div>
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Full name</label>
                  <input className="form-input" value={form.ownerName} onChange={e => setForm(f => ({ ...f, ownerName: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Work email</label>
                  <input className="form-input" type="email" value={form.ownerEmail} onChange={e => setForm(f => ({ ...f, ownerEmail: e.target.value }))} />
                </div>
              </div>
              <button className="btn btn-primary" onClick={save}><RefreshCw size={13} /> Save changes</button>

              <div className="divider" />
              <div className="section-label mb-3">Notification preferences</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Choose how your operator keeps you in the loop.</div>
              {[
                { key: 'notifyNewLead', label: 'New lead captured' },
                { key: 'notifyInvoicePaid', label: 'Invoice paid' },
                { key: 'notifyAppointment', label: 'Appointment booked' },
              ].map(n => (
                <div key={n.key} className="flex items-center justify-between" style={{ padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: 13 }}>{n.label}</span>
                  <label className="toggle">
                    <input type="checkbox" checked={form[n.key as keyof typeof form] as boolean} onChange={e => setForm(f => ({ ...f, [n.key]: e.target.checked }))} />
                    <span className="toggle-slider" />
                  </label>
                </div>
              ))}
            </div>
          )}

          {tab === 'team' && (
            <div className="card card-p">
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Team access</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>Manage who can access your workspace.</div>
              {team.map(member => (
                <div key={member.id} className="team-row">
                  <div className="user-avatar">{member.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{member.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{member.email}</div>
                  </div>
                  <span className="badge badge-draft">{member.role}</span>
                </div>
              ))}
            </div>
          )}

          {tab === 'notifications' && (
            <div className="card card-p">
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Notification preferences</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>Choose how your operator keeps you in the loop.</div>
              {[
                { key: 'notifyNewLead', label: 'New lead captured', desc: 'Get notified when a new lead enters the pipeline.' },
                { key: 'notifyInvoicePaid', label: 'Invoice paid', desc: 'Get notified when a client pays an invoice.' },
                { key: 'notifyAppointment', label: 'Appointment booked', desc: 'Get notified when a new appointment is scheduled.' },
              ].map(n => (
                <div key={n.key} className="flex items-center justify-between" style={{ padding: '14px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{n.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{n.desc}</div>
                  </div>
                  <label className="toggle">
                    <input type="checkbox" checked={form[n.key as keyof typeof form] as boolean} onChange={e => setForm(f => ({ ...f, [n.key]: e.target.checked }))} />
                    <span className="toggle-slider" />
                  </label>
                </div>
              ))}
              <button className="btn btn-primary mt-4" onClick={save}>Save preferences</button>
            </div>
          )}

          {tab === 'security' && (
            <div className="card card-p">
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Security</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>Manage authentication and access controls.</div>
              <div className="inline-label-value">
                <span className="inline-label">Two-factor authentication</span>
                <span className="badge badge-paid">Enabled</span>
              </div>
              <div className="inline-label-value">
                <span className="inline-label">Session timeout</span>
                <span className="inline-value">30 days</span>
              </div>
              <div className="inline-label-value">
                <span className="inline-label">API access</span>
                <span className="badge badge-synced">Active</span>
              </div>
              <div className="divider" />
              <button className="btn btn-danger btn-sm">Change password</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function AppPage() {
  const [page, setPage] = useState<Page>('overview');
  const [theme, setTheme] = useState<Theme>('dark');
  const [showCommand, setShowCommand] = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setShowCommand(p => !p); }
      if (e.key === 'Escape') { setShowCommand(false); setShowNotif(false); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const navItems = [
    { id: 'overview' as Page, label: 'Overview', icon: <LayoutDashboard size={15} />, section: 'workspace' },
    { id: 'leads' as Page, label: 'Leads pipeline', icon: <KanbanSquare size={15} />, badge: '14', section: 'workspace' },
    { id: 'invoices' as Page, label: 'Invoices', icon: <FileText size={15} />, badge: '3', section: 'workspace' },
    { id: 'appointments' as Page, label: 'Appointments', icon: <Calendar size={15} />, section: 'workspace' },
    { id: 'knowledge' as Page, label: 'Knowledge base', icon: <BookOpen size={15} />, section: 'tools' },
    { id: 'widget' as Page, label: 'Smart widget', icon: <Cpu size={15} />, section: 'tools' },
    { id: 'activity' as Page, label: 'Activity log', icon: <Activity size={15} />, section: 'tools' },
    { id: 'settings' as Page, label: 'Workspace settings', icon: <Settings size={15} />, section: 'tools' },
  ];

  const pageTitles: Record<Page, string> = {
    overview: 'Overview', leads: 'Leads pipeline', invoices: 'Invoices',
    appointments: 'Appointments', knowledge: 'Knowledge base', widget: 'Smart widget',
    activity: 'Activity log', settings: 'Workspace settings',
  };

  return (
    <div className="app-layout">
      {showCommand && <CommandPalette onClose={() => setShowCommand(false)} onNavigate={setPage} />}

      {/* Sidebar */}
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-icon"><Zap size={20} color="white" /></div>
          <span className="logo-text">OPS</span>
          <span className="logo-badge">3.0</span>
          <button className="sidebar-close" style={{ marginLeft: 'auto' }}><X size={16} /></button>
        </div>

        {/* Workspace Switcher */}
        <div className="workspace-switcher">
          <div className="workspace-avatar">A</div>
          <div className="workspace-info">
            <div className="workspace-name">Apex Consulting</div>
            <div className="workspace-plan">Pro workspace</div>
          </div>
          <ChevronDown size={14} color="var(--text-muted)" />
        </div>

        {/* Nav */}
        <div className="sidebar-scroll">
          {['workspace', 'tools'].map(section => (
            <div key={section}>
              <div className="nav-section-label">{section}</div>
              {navItems.filter(n => n.section === section).map(item => (
                <a key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`} onClick={() => setPage(item.id)} href="#">
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && <span className="nav-badge">{item.badge}</span>}
                </a>
              ))}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="agent-status">
            <span className="agent-dot" />
            <div className="agent-info">
              <div className="agent-name">AI operator online</div>
              <div className="agent-version">142ms · v3.2 production</div>
            </div>
            <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}><HelpCircle size={14} /></button>
          </div>
          <div className="user-profile">
            <div className="user-avatar">MV</div>
            <div className="user-info">
              <div className="user-name">Marcus Vance</div>
              <div className="user-role">Administrator</div>
            </div>
            <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', marginLeft: 'auto' }}><SlidersHorizontal size={14} /></button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="header">
          <button className="header-menu-btn"><MoreHorizontal size={18} /></button>
          <div className="header-title-group">
            <div className="header-subtitle">Autonomous operations platform</div>
            <div className="header-title">{pageTitles[page]}</div>
          </div>
          <div className="header-actions">
            <button className="search-bar" onClick={() => setShowCommand(true)}>
              <Search size={14} color="var(--text-muted)" />
              <span className="search-bar-text">Search workspace</span>
              <span className="search-kbd">⌘ K</span>
            </button>
            <div style={{ position: 'relative' }}>
              <button className="icon-btn" onClick={() => setShowNotif(p => !p)}>
                <Bell size={16} />
                <span className="notification-dot" />
              </button>
              {showNotif && (
                <div className="notification-panel">
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)', fontWeight: 700, fontSize: 14 }}>Notifications</div>
                  {['New lead: Chris Nguyen escalated', 'INV-2026-003 is overdue — $12,400', 'Discovery Call confirmed for tomorrow'].map((n, i) => (
                    <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', fontSize: 13, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <span style={{ width: 6, height: 6, background: 'var(--accent-cyan)', borderRadius: '50%', marginTop: 5, flexShrink: 0 }} />
                      {n}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button className="icon-btn" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button className="user-btn">MV</button>
            <ChevronDown size={14} color="var(--text-muted)" />
          </div>
        </header>

        {/* Page */}
        {page === 'overview' && <OverviewPage onNavigate={setPage} />}
        {page === 'leads' && <LeadsPage />}
        {page === 'invoices' && <InvoicesPage />}
        {page === 'appointments' && <AppointmentsPage />}
        {page === 'knowledge' && <KnowledgePage />}
        {page === 'widget' && <SmartWidgetPage />}
        {page === 'activity' && <ActivityLogPage />}
        {page === 'settings' && <SettingsPage />}
      </main>
    </div>
  );
}
