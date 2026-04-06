'use server';
/**
 * @fileOverview A secure multi-language chatbot assistant for PlantSpeakAI using OpenRouter.
 * Enforces strict 2-3 line responses for speed and specific topic focus.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL_NAME = 'liquid/lfm-2.5-1.2b-instruct:free';

const ChatbotInteractionAndLanguageSupportInputSchema = z.object({
  query: z.string().describe("The user's query for the chatbot."),
  language: z.string().optional().describe('The preferred language for the response.'),
});
export type ChatbotInteractionAndLanguageSupportInput = z.infer<typeof ChatbotInteractionAndLanguageSupportInputSchema>;

const ChatbotInteractionAndLanguageSupportOutputSchema = z.object({
  response: z.string().describe("The chatbot's response to the query."),
});
export type ChatbotInteractionAndLanguageSupportOutput = z.infer<typeof ChatbotInteractionAndLanguageSupportOutputSchema>;

const SYSTEM_PROMPT = `You are PlantSpeakAI Assistant.

Answer ONLY questions related to:
- PlantSpeakAI project
- Plant Electrophysiology
- Bio-electrical signals (Bio signals)
- Plant stress detection and plant health
- ThingSpeak
- ESP32
- Sensors used (AD8232, ECG electrodes)
- IoT in PlantSpeakAI
- Workflow of PlantSpeakAI system
- Plant care solutions (water, heat, cold, pest, etc.)

If the question is NOT related to the above topics, reply:
"I can only assist with PlantSpeakAI related queries."

STRICT RULES:
- Keep answers VERY SHORT: exactly 2 to 3 lines.
- Be clear and accurate.
- Language Rules:
  - If user speaks Tamil or language context is Tamil -> reply in Tamil
  - If user speaks Hindi or language context is Hindi -> reply in Hindi
  - Otherwise -> reply in English

Context: Preferred language is {{language}}.`;

export async function chatbotInteractionAndLanguageSupport(
  input: ChatbotInteractionAndLanguageSupportInput
): Promise<ChatbotInteractionAndLanguageSupportOutput> {
  return chatbotInteractionAndLanguageSupportFlow(input);
}

const chatbotInteractionAndLanguageSupportFlow = ai.defineFlow(
  {
    name: 'chatbotInteractionAndLanguageSupportFlow',
    inputSchema: ChatbotInteractionAndLanguageSupportInputSchema,
    outputSchema: ChatbotInteractionAndLanguageSupportOutputSchema,
  },
  async (input) => {
    try {
      const apiKey = process.env.OPENROUTER_API_KEY || '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';
      
      const preferredLanguage = input.language || 'English';
      const resolvedSystemPrompt = SYSTEM_PROMPT.replace('{{language}}', preferredLanguage);

      const response = await fetch(OPENROUTER_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://plantspeakai.firebaseapp.com',
          'X-OpenRouter-Title': 'PlantSpeakAI',
        },
        body: JSON.stringify({
          model: MODEL_NAME,
          messages: [
            { role: 'system', content: resolvedSystemPrompt },
            { role: 'user', content: input.query }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenRouter API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || 'I could not generate a response.';

      return { response: content.trim() };
    } catch (err: any) {
      return { response: `Error: ${err.message || 'Connecting to AI service failed.'}` };
    }
  }
);
