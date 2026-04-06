'use server';
/**
 * @fileOverview A Genkit flow for generating actionable care advice based on detected plant stress.
 * Enforces 2-3 line responses for quick reading.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL_NAME = 'liquid/lfm-2.5-1.2b-instruct:free';

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
          'X-OpenRouter-Title': 'PlantSpeakAI',
        },
        body: JSON.stringify({
          model: MODEL_NAME,
          messages: [
            {
              role: 'system',
              content: 'You are an expert botanist. Provide a concise, actionable 2-3 line recommendation for the detected plant stress. Focus on immediate steps.'
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
      const content = data.choices?.[0]?.message?.content || 'Check your plant conditions and adjust watering or environment.';

      return { recommendation: content.trim() };
    } catch (err) {
      console.error('Care Advisor Error:', err);
      return { recommendation: 'Monitor your plant bio-signals closely and adjust environment factors.' };
    }
  }
);
