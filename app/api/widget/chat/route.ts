import { NextResponse } from 'next/server';
import { readDB, writeDB, addActivity, Lead } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const { message, history = [] } = await req.json();
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const db = readDB();
    const settings = db.settings;
    const msgLower = message.toLowerCase();

    // Check for email pattern
    const emailMatch = message.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    let capturedLead: Lead | null = null;

    if (emailMatch) {
      const email = emailMatch[0];
      const existing = db.leads.find(l => l.email.toLowerCase() === email.toLowerCase());
      if (!existing) {
        // Extract potential name or company
        const words = message.replace(email, '').trim().split(/\s+/);
        const nameGuess = words.length > 1 ? words.slice(0, 2).join(' ') : 'Inbound Visitor';
        const newLead: Lead = {
          id: uuidv4(),
          name: nameGuess,
          company: 'Widget Prospect',
          email,
          status: 'warm',
          score: 75,
          value: 10000,
          source: 'Website widget',
          notes: `Captured from live smart widget conversation: "${message}"`,
          createdAt: new Date().toISOString(),
          lastTouch: new Date().toISOString(),
        };
        db.leads.unshift(newLead);
        writeDB(db);

        addActivity(
          'lead_captured',
          'New lead captured via widget',
          `${newLead.name} (${newLead.email}) entered the pipeline.`
        );
        capturedLead = newLead;
      }
    }

    let reply = '';

    if (emailMatch) {
      reply = `Thank you! I've noted down your email (${emailMatch[0]}). One of our operators will review your requirements and reach out within our SLA guarantee of under 90 seconds. Is there anything else you'd like to share about your timeline?`;
    } else if (msgLower.includes('pricing') || msgLower.includes('cost') || msgLower.includes('how much') || msgLower.includes('fee')) {
      reply = `Our standard discovery engagement starts at $8,500 with a 30-day implementation window. Enterprise plans start at $15,000/month with dedicated support. What scope or outcomes are you aiming for?`;
    } else if (msgLower.includes('hello') || msgLower.includes('hi') || msgLower.includes('hey')) {
      reply = settings.openingMessage || `Hello! I'm ${settings.agentName}. I can answer questions about our autonomous platform, calculate pricing, or get you scheduled with our team. What can I help you with today?`;
    } else if (msgLower.includes('book') || msgLower.includes('call') || msgLower.includes('demo') || msgLower.includes('schedule') || msgLower.includes('meeting')) {
      reply = `I can schedule a discovery session for you right away! What day and time works best for you, or could you share your email so I can send an invite?`;
    } else if (msgLower.includes('integrate') || msgLower.includes('integration') || msgLower.includes('hubspot') || msgLower.includes('salesforce') || msgLower.includes('stripe')) {
      reply = `We support 50+ integrations out of the box including HubSpot, Salesforce, Stripe, QuickBooks, Google Calendar, and Slack. All data syncs in real-time.`;
    } else if (msgLower.includes('timeline') || msgLower.includes('how long') || msgLower.includes('weeks') || msgLower.includes('days')) {
      reply = `Standard implementations typically take 2 to 4 weeks depending on the number of systems being connected. Most teams see their first autonomous workflows live in week one.`;
    } else {
      reply = `Thanks for asking. Our autonomous operations platform helps teams manage leads, automate billing & dunning, and schedule appointments with 24/7 coverage. Could you share your email or best way to follow up?`;
    }

    addActivity(
      'agent_response',
      'Widget conversation response',
      `${settings.agentName} autonomously replied to visitor: "${message.slice(0, 40)}..."`
    );

    return NextResponse.json({
      reply,
      agentName: settings.agentName,
      leadCaptured: !!capturedLead,
      lead: capturedLead,
    });
  } catch (err) {
    console.error('Error in widget chat:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
