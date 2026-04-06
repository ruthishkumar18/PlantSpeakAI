
'use server';
/**
 * @fileOverview A Genkit flow for generating actionable care advice based on detected plant stress.
 * Uses OpenRouter for advice generation to avoid Gemini dependency.
 *
 * - careAdvisorAdviceGeneration - A function that generates plant care advice.
 * - CareAdvisorAdviceGenerationInput - The input type for the careAdvisorAdviceGeneration function.
 * - CareAdvisorAdviceGenerationOutput - The return type for the careAdvisorAdviceGeneration function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL_NAME = 'qwen/qwen3.6-plus:free';

const CareAdvisorAdviceGenerationInputSchema = z.object({
  stressLabel: z.number().int().min(0).max(6).describe('The numeric label indicating the type of plant stress.'),
});
export type CareAdvisorAdviceGenerationInput = z.infer<typeof CareAdvisorAdviceGenerationInputSchema>;

const CareAdvisorAdviceGenerationOutputSchema = z.object({
  recommendation: z.string().describe('An actionable recommendation or solution for the detected plant stress.'),
});
export type CareAdvisorAdviceGenerationOutput = z.infer<typeof CareAdvisorAdviceGenerationOutputSchema>;

function getStressTypeDescription(stressLabel: number): string {
  switch (stressLabel) {
    case 0: return 'Healthy';
    case 1: return 'Water Stress';
    case 2: return 'Over Water';
    case 3: return 'Heat Stress';
    case 4: return 'Cold Stress';
    case 5: return 'Mechanical Stress';
    case 6: return 'Pest Attack';
    default: return 'Unknown Stress';
  }
}

export async function careAdvisorAdviceGeneration(
  input: CareAdvisorAdviceGenerationInput
): Promise<CareAdvisorAdviceGenerationOutput> {
  return careAdvisorAdviceGenerationFlow(input);
}

const careAdvisorAdviceGenerationFlow = ai.defineFlow(
  {
    name: 'careAdvisorAdviceGenerationFlow',
    inputSchema: CareAdvisorAdviceGenerationInputSchema,
    outputSchema: CareAdvisorAdviceGenerationOutputSchema,
  },
  async (input) => {
    const stressTypeDescription = getStressTypeDescription(input.stressLabel);

    if (input.stressLabel === 0) {
      return { recommendation: 'Your plant is healthy. Keep up the good care!' };
    }

    try {
      const apiKey = process.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        throw new Error('OPENROUTER_API_KEY is not configured.');
      }

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
            {
              role: 'system',
              content: 'You are an expert botanist. Provide a concise, actionable 1-sentence recommendation for the given plant stress. Return ONLY the recommendation text.'
            },
            {
              role: 'user',
              content: `Plant Stress detected: ${stressTypeDescription}`
            }
          ]
        })
      });

      if (!response.ok) throw new Error('OpenRouter advice generation failed.');

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || 'Please check the standard care instructions.';

      return { recommendation: content.trim() };
    } catch (err) {
      console.error('Care Advisor Error:', err);
      return { recommendation: 'Monitor your plant and adjust conditions as needed.' };
    }
  }
);
