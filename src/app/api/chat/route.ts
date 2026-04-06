
import { NextRequest, NextResponse } from 'next/server';
import { chatbotInteractionAndLanguageSupport } from '@/ai/flows/chatbot-interaction-and-language-support-flow';

/**
 * Route handler for /api/chat.
 * Provides a standard REST endpoint for the chatbot logic.
 */
export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const result = await chatbotInteractionAndLanguageSupport({ query });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
