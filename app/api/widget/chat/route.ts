import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const { message, history = [] } = await req.json();
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Load settings + knowledge base from DB
    const [settings, knowledgeSources] = await Promise.all([
      prisma.settings.findUnique({ where: { id: 'singleton' } }),
      prisma.knowledgeSource.findMany({ where: { synced: true } }),
    ]);

    const agentName = settings?.agentName || 'OpsAgent';

    // Build knowledge context string
    const knowledgeContext = knowledgeSources
      .map((k) => `[${k.name}]\n${k.content}`)
      .join('\n\n---\n\n');

    // System prompt grounded in knowledge base
    const systemPrompt = `You are ${agentName}, an intelligent operations assistant for a professional business services company. You help website visitors with questions about services, pricing, and scheduling.

KNOWLEDGE BASE (use ONLY this information to answer questions):
${knowledgeContext || 'No specific services or pricing documents have been published yet. Ask the visitor for their email address and project requirements so our leadership team can provide a tailored quote.'}

INSTRUCTIONS:
- Answer concisely and professionally (2-4 sentences max)
- If asked for pricing, quote from the knowledge base
- If the visitor wants to book a call or meeting, ask for their email address
- If they share an email, confirm you've captured it and will follow up
- Never make up information not in the knowledge base
- Keep responses friendly but professional
- If unsure, offer to connect them with the team`;

    // Build conversation history for Gemini (alternating user/model)
    const chatHistory = (history.slice(-10) as { role: string; text: string }[]).map(
      (m: { role: string; text: string }) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      })
    );

    // Call Google Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: systemPrompt,
    });

    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(message);
    const reply = result.response.text()?.trim() ||
      "Thanks for reaching out! Could you share your email so our team can follow up with you directly?";

    // Auto-capture lead if email is detected
    const emailMatch = message.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    let capturedLead = null;

    if (emailMatch) {
      const email = emailMatch[0];
      const existing = await prisma.lead.findFirst({ where: { email: { equals: email, mode: 'insensitive' } } });

      if (!existing) {
        const words = message.replace(email, '').trim().split(/\s+/);
        const nameGuess = words.filter(w => w.length > 1).slice(0, 2).join(' ') || 'Inbound Visitor';

        capturedLead = await prisma.lead.create({
          data: {
            name: nameGuess,
            company: 'Widget Prospect',
            email,
            status: 'warm',
            score: 75,
            value: 10000,
            source: 'Website widget',
            notes: `Captured from live widget conversation: "${message}"`,
          },
        });

        await prisma.activityEvent.create({
          data: {
            type: 'lead_captured',
            title: 'New lead captured via widget',
            description: `${capturedLead.name} (${capturedLead.email}) entered the pipeline.`,
          },
        });
      }
    }

    // Log agent response activity
    await prisma.activityEvent.create({
      data: {
        type: 'agent_response',
        title: 'Widget conversation response',
        description: `${agentName} replied to visitor: "${message.slice(0, 60)}..."`,
      },
    });

    return NextResponse.json({
      reply,
      agentName,
      leadCaptured: !!capturedLead,
      lead: capturedLead,
    });
  } catch (err) {
    console.error('Error in widget chat:', err);
    return NextResponse.json({
      reply: "Thanks for your message! Please share your email address and our team will follow up with you shortly.",
      agentName: 'OpsAgent',
      leadCaptured: false,
      lead: null,
    });
  }
}
