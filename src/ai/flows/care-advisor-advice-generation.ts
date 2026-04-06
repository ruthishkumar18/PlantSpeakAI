'use server';
/**
 * @fileOverview A Genkit flow for generating actionable care advice based on detected plant stress.
 *
 * - careAdvisorAdviceGeneration - A function that generates plant care advice.
 * - CareAdvisorAdviceGenerationInput - The input type for the careAdvisorAdviceGeneration function.
 * - CareAdvisorAdviceGenerationOutput - The return type for the careAdvisorAdviceGeneration function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input schema for the wrapper function and flow
const CareAdvisorAdviceGenerationInputSchema = z.object({
  stressLabel: z.number().int().min(0).max(6).describe('The numeric label indicating the type of plant stress.'),
});
export type CareAdvisorAdviceGenerationInput = z.infer<typeof CareAdvisorAdviceGenerationInputSchema>;

// Output schema for the flow and wrapper function
const CareAdvisorAdviceGenerationOutputSchema = z.object({
  recommendation: z.string().describe('An actionable recommendation or solution for the detected plant stress.'),
});
export type CareAdvisorAdviceGenerationOutput = z.infer<typeof CareAdvisorAdviceGenerationOutputSchema>;

// Helper function to map stress label to a descriptive string for the LLM
function getStressTypeDescription(stressLabel: number): string {
  switch (stressLabel) {
    case 0: return 'Healthy';
    case 1: return 'Water Stress';
    case 2: return 'Over Water';
    case 3: return 'Heat Stress';
    case 4: return 'Cold Stress';
    case 5: return 'Mechanical Stress';
    case 6: return 'Pest Attack';
    default: return 'Unknown Stress'; // Should not happen with min/max validation
  }
}

// Define the prompt for the AI Care Advisor
const careAdvisorAdvicePrompt = ai.definePrompt({
  name: 'careAdvisorAdvicePrompt',
  input: {
    schema: z.object({
      stressType: z.string().describe('A descriptive string of the plant stress type.'),
    }),
  },
  output: {
    schema: CareAdvisorAdviceGenerationOutputSchema,
  },
  prompt: `You are a helpful and knowledgeable plant care advisor. Your task is to provide a concise, actionable, and practical recommendation or solution to a plant owner based on the detected plant stress type. The output should be a JSON object with a single field, "recommendation".

Stress Type: {{{stressType}}}

Here are some examples of desired output format and content:
If "Water Stress": {"recommendation": "Check soil moisture immediately. If dry, water thoroughly until it drains from the bottom. Ensure good drainage to prevent waterlogging."}
If "Over Water": {"recommendation": "Allow the soil to dry out completely before watering again. Improve drainage and consider repotting if soil is consistently soggy."}
If "Heat Stress": {"recommendation": "Move the plant to a cooler, shadier location. Increase humidity around the plant if possible. Avoid direct afternoon sun."}
If "Cold Stress": {"recommendation": "Relocate the plant to a warmer environment. Protect from cold drafts and ensure temperatures stay above its minimum tolerance."}
If "Pest Attack": {"recommendation": "Isolate the plant. Identify the specific pest and apply an appropriate organic pesticide, neem oil, or insecticidal soap. Repeat treatment as necessary."}
If "Mechanical Stress": {"recommendation": "Gently prune damaged parts. Provide support for broken stems. Avoid further physical damage and ensure stable conditions."}
`,
});

// Define the Genkit flow for generating care advice
const careAdvisorAdviceGenerationFlow = ai.defineFlow(
  {
    name: 'careAdvisorAdviceGenerationFlow',
    inputSchema: CareAdvisorAdviceGenerationInputSchema,
    outputSchema: CareAdvisorAdviceGenerationOutputSchema,
  },
  async (input) => {
    const stressTypeDescription = getStressTypeDescription(input.stressLabel);

    // Handle 'Healthy' status without calling the LLM for efficiency
    if (input.stressLabel === 0) {
      return { recommendation: 'Your plant is healthy. Keep up the good care!' };
    }

    // Call the prompt to generate advice for other stress types
    const { output } = await careAdvisorAdvicePrompt({ stressType: stressTypeDescription });

    if (!output) {
      throw new Error('The AI model failed to generate a recommendation.');
    }

    return output;
  }
);

// Exported wrapper function for the flow
export async function careAdvisorAdviceGeneration(
  input: CareAdvisorAdviceGenerationInput
): Promise<CareAdvisorAdviceGenerationOutput> {
  return careAdvisorAdviceGenerationFlow(input);
}
