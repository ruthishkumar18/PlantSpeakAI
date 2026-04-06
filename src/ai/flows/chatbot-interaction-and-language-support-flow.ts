'use server';
/**
 * @fileOverview A secure multi-language chatbot assistant for PlantSpeakAI using OpenRouter.
 *
 * - chatbotInteractionAndLanguageSupport - A server-side function that handles chatbot interactions.
 * - ChatbotInteractionAndLanguageSupportInput - The input type for the chatbot function.
 * - ChatbotInteractionAndLanguageSupportOutput - The return type for the chatbot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL_NAME = 'google/gemini-2.0-flash-lite-preview-02-05:free';

const ChatbotInteractionAndLanguageSupportInputSchema = z.object({
  query: z.string().describe('The user\'s query for the chatbot.'),
  language: z.string().optional().describe('The preferred language for the response.'),
});
export type ChatbotInteractionAndLanguageSupportInput = z.infer<typeof ChatbotInteractionAndLanguageSupportInputSchema>;

const ChatbotInteractionAndLanguageSupportOutputSchema = z.object({
  response: z.string().describe('The chatbot\'s response to the query.'),
});
export type ChatbotInteractionAndLanguageSupportOutput = z.infer<typeof ChatbotInteractionAndLanguageSupportOutputSchema>;

const SYSTEM_PROMPT = `You are PlantSpeakAI Assistant.

- Answer ONLY questions related to: PlantSpeakAI, plant health, stress detection, IoT, ESP32, sensors, and plant care.
- If the question is NOT related, reply: 'I can only assist with PlantSpeakAI related queries.'
- Support languages: Tamil, English, Hindi.
- MANDATORY: Respond ONLY in the user's preferred language: {{language}}.
- MANDATORY: Keep responses extremely brief (strictly 2-3 lines max). 
- Be direct, clear, and provide solutions quickly. No long explanations.`;

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
      const apiKey = process.env.OPENROUTER_API_KEY;
      
      if (!apiKey) {
        throw new Error("API Key is missing in environment variables.");
      }

      const preferredLanguage = input.language || 'English';
      const resolvedSystemPrompt = SYSTEM_PROMPT.replace('{{language}}', preferredLanguage);

      const response = await fetch(OPENROUTER_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://plantspeakai.firebaseapp.com',
          'X-Title': 'PlantSpeakAI',
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
      console.error('Chatbot Integration Error:', err);
      return { response: `Error: ${err.message || 'Connecting to AI service failed.'}` };
    }
  }
);
