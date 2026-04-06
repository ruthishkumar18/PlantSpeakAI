
import { genkit } from 'genkit';

// Removed Google AI plugin as per user request to avoid Gemini API key requirements.
// We will use direct OpenRouter integration for AI tasks.
export const ai = genkit({
  plugins: [],
});
