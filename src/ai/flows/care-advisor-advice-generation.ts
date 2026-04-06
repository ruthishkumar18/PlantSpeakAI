'use server';
/**
 * @fileOverview A Genkit flow for generating actionable care advice based on detected plant stress.
 * Enforces strict 2-3 line responses and uses the openai/gpt-oss-20b:free model.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL_NAME = 'openai/gpt-oss-20b:free';
const API_KEY = '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';

const CareAdvisorAdviceGenerationInputSchema = z.object({
  stressLabel: z.number().int().min(0).max(6).describe('The numeric label indicating the type of plant stress.'),
});
export type CareAdvisorAdviceGenerationInput = z.infer<typeof CareAdvisorAdviceGenerationInputSchema>;

const CareAdvisorAdviceGenerationOutputSchema = z.object({
  recommendation: z.string().describe('An actionable recommendation for the detected plant stress.'),
});
export type CareAdvisorAdviceGenerationOutput = z.infer<typeof CareAdvisorAdviceGenerationOutputSchema>;

function getStressTypeDescription(stressLabel: number): string {
  switch (stressLabel) {
    case 0: return 'Healthy';
    case 1: return 'Water Stress (Dry)';
    case 2: return 'Over Water (Soggy)';
    case 3: return 'Heat Stress (High Temp)';
    case 4: return 'Cold Stress (Low Temp)';
    case 5: return 'Mechanical Stress (Physical Damage)';
    case 6: return 'Pest Attack (Insects/Bugs)';
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
      return { recommendation: 'Your plant is healthy. Maintain current humidity and lighting for best results!' };
    }

    try {
      const response = await fetch(OPENROUTER_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://github.com/ruthishkumar18/PlantSpeakAI',
          'X-OpenRouter-Title': 'PlantSpeakAI Advisor',
        },
        body: JSON.stringify({
          model: MODEL_NAME,
          messages: [
            {
              role: 'system',
              content: 'You are an expert botanist. Provide a concise, actionable 2 to 3 line recommendation for the detected plant stress. Focus on immediate steps.'
            },
            {
              role: 'user',
              content: `Plant Stress detected: ${stressTypeDescription}`
            }
          ],
          max_tokens: 150,
          temperature: 0.7,
          reasoning: { enabled: true }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || `API error: ${response.status}`);
      }

      const content = data.choices?.[0]?.message?.content || 'Check your plant conditions and adjust watering or environment.';
      return { recommendation: content.trim() };
    } catch (err: any) {
      console.error('Advisor Flow Error:', err);
      return { recommendation: 'Monitor your plant bio-signals closely and adjust environmental factors.' };
    }
  }
);
