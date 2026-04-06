'use server';
/**
 * @fileOverview A multi-language chatbot assistant for PlantSpeakAI.
 *
 * - chatbotInteractionAndLanguageSupport - A function that handles chatbot interactions with language support.
 * - ChatbotInteractionAndLanguageSupportInput - The input type for the chatbotInteractionAndLanguageSupport function.
 * - ChatbotInteractionAndLanguageSupportOutput - The return type for the chatbotInteractionAndLanguageSupport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatbotInteractionAndLanguageSupportInputSchema = z.object({
  query: z.string().describe('The user\'s query for the chatbot.'),
  language: z.enum(['English', 'Tamil', 'Hindi']).describe('The desired language for the chatbot\'s response.'),
});
export type ChatbotInteractionAndLanguageSupportInput = z.infer<typeof ChatbotInteractionAndLanguageSupportInputSchema>;

const ChatbotInteractionAndLanguageSupportOutputSchema = z.object({
  response: z.string().describe('The chatbot\'s response to the query.'),
});
export type ChatbotInteractionAndLanguageSupportOutput = z.infer<typeof ChatbotInteractionAndLanguageSupportOutputSchema>;

export async function chatbotInteractionAndLanguageSupport(
  input: ChatbotInteractionAndLanguageSupportInput
): Promise<ChatbotInteractionAndLanguageSupportOutput> {
  return chatbotInteractionAndLanguageSupportFlow(input);
}

const chatbotPrompt = ai.definePrompt({
  name: 'chatbotInteractionPrompt',
  input: {schema: ChatbotInteractionAndLanguageSupportInputSchema},
  output: {schema: ChatbotInteractionAndLanguageSupportOutputSchema},
  prompt: `You are a helpful and specialized chatbot assistant for "PlantSpeakAI".

Your primary function is to answer questions strictly related to the following topics:
- PlantSpeakAI system
- General plant care
- Sensors (like those used in PlantSpeakAI, e.g., bio-electrical sensors, ESP32 connections)
- Stress detection in plants

If the user's query falls outside of these specific topics, you MUST respond with the EXACT phrase: "I can only assist with PlantSpeakAI related queries".
Do NOT try to answer unrelated questions.
Do NOT elaborate or provide additional information if the query is unrelated.

If the query is related to the allowed topics, provide a helpful and concise answer.

Ensure your response is in the requested language.

User's query: "{{{query}}}"
Requested language for response: "{{{language}}}"`,
});

const chatbotInteractionAndLanguageSupportFlow = ai.defineFlow(
  {
    name: 'chatbotInteractionAndLanguageSupportFlow',
    inputSchema: ChatbotInteractionAndLanguageSupportInputSchema,
    outputSchema: ChatbotInteractionAndLanguageSupportOutputSchema,
  },
  async (input) => {
    const {output} = await chatbotPrompt(input);
    return output!;
  }
);
