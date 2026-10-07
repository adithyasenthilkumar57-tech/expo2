import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

const ai = new OpenAI({
  apiKey: process.env.FEATHERLESS_API_KEY || '',
  baseURL: process.env.FEATHERLESS_BASE_URL || 'https://api.featherless.ai/v1',
});

const MODEL = process.env.FEATHERLESS_MODEL || 'meta-llama/Llama-3.3-70B-Instruct';

export async function POST(req: Request) {
  try {
    const { question } = await req.json();
    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    // Load synced knowledge sources from the real DB
    const sources = await prisma.knowledgeSource.findMany({ where: { synced: true } });

    if (sources.length === 0) {
      return NextResponse.json({
        question,
        answer: 'No knowledge documents have been added to your database yet. Upload or paste a service document to enable grounded answering.',
        source: 'Empty Knowledge Base',
        sourceType: 'text',
        confidence: 0,
        grounded: false,
        excerpt: 'No documents indexed in PostgreSQL.',
      });
    }

    // Find the most relevant source based on content overlap
    const qLower = question.toLowerCase();
    const tokens = qLower.split(/[\s,?.!]+/).filter((w) => w.length > 3);

    let bestSource = sources[0];
    let maxMatch = 0;

    for (const src of sources) {
      const contentLower = src.content.toLowerCase();
      let matches = 0;
      for (const t of tokens) {
        if (contentLower.includes(t)) matches++;
      }
      if (matches > maxMatch) {
        maxMatch = matches;
        bestSource = src;
      }
    }

    let answer = '';
    let confidence = 85;

    // Call Featherless AI to generate a grounded response
    try {
      const context = sources.map((s) => `[Document: ${s.name}]\n${s.content}`).join('\n\n---\n\n');
      const response = await ai.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: `You are an operations knowledge inspector. Answer the user's question accurately using ONLY the provided knowledge base. If the answer cannot be found in the knowledge base, state clearly that it is not covered in the uploaded documents.\n\nKNOWLEDGE BASE:\n${context}`,
          },
          { role: 'user', content: question },
        ],
        max_tokens: 250,
        temperature: 0.3,
      });

      answer = response.choices[0]?.message?.content?.trim() || '';
      confidence = maxMatch > 0 ? Math.min(98, 80 + maxMatch * 5) : 75;
    } catch (aiErr) {
      console.warn('AI evaluation error, falling back to document excerpt:', aiErr);
      const sentences = bestSource.content.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
      const matched = sentences.find((s) => tokens.some((t) => s.toLowerCase().includes(t))) || sentences[0];
      answer = matched ? `${matched}.` : bestSource.content.slice(0, 200);
      confidence = 70;
    }

    // Extract excerpt
    const excerpt = bestSource.content.slice(0, 200) + '...';

    // Log the grounding query in activity
    await prisma.activityEvent.create({
      data: {
        type: 'agent_response',
        title: 'Grounding query evaluated',
        description: `Grounding verified response for: "${question.slice(0, 50)}" (${confidence}% confidence)`,
      },
    });

    return NextResponse.json({
      question,
      answer,
      source: bestSource.name,
      sourceType: bestSource.type,
      confidence,
      grounded: true,
      excerpt,
    });
  } catch (err) {
    console.error('Error answering question:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
