'use server';

/**
 * @fileOverview This file defines a Genkit flow for detecting the game state
 * based on OCR analysis of the screen.
 *
 * - detectGameState - A function that initiates the game state detection process.
 * - DetectGameStateInput - The input type for the detectGameState function.
 * - DetectGameStateOutput - The return type for the detectGameState function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectGameStateInputSchema = z.object({
  screenImage: z
    .string()
    .describe(
      "A screenshot of the game, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DetectGameStateInput = z.infer<typeof DetectGameStateInputSchema>;

const DetectGameStateOutputSchema = z.object({
  gameState: z.enum([
    'DAY_I',
    'DAY_II',
    'DAY_III',
    'DEFEAT',
    'NIGHT_LORD_DEFEATED',
    'UNKNOWN',
  ]).describe('The detected game state based on the screen image.'),
});
export type DetectGameStateOutput = z.infer<typeof DetectGameStateOutputSchema>;

export async function detectGameState(input: DetectGameStateInput): Promise<DetectGameStateOutput> {
  return detectGameStateFlow(input);
}

const detectGameStatePrompt = ai.definePrompt({
  name: 'detectGameStatePrompt',
  input: {schema: DetectGameStateInputSchema},
  output: {schema: DetectGameStateOutputSchema},
  prompt: `You are an expert game state detection AI.

You are given a screenshot of the game and must determine the current game state based on the text present in the image. The possible game states are DAY_I, DAY_II, DAY_III, DEFEAT, NIGHT_LORD_DEFEATED, and UNKNOWN. Return UNKNOWN if you cannot confidently determine the state.

Analyze the following screenshot to determine the game state:

{{media url=screenImage}}

Consider the following keywords when detecting game state:
- DAY_I: "ДЕНЬ I" or "DAY I"
- DAY_II: "ДЕНЬ II" or "DAY II"
- DAY_III: "ДЕНЬ III" or "DAY III"
- DEFEAT: "ПОРАЖЕНИЕ" or "DEFEATED"
- NIGHT_LORD_DEFEATED: "НОЧНОЙ ВЛАДЫКА ПОВЕРЖЕН" or "NIGHTLORD FELLED"
`,
});

const detectGameStateFlow = ai.defineFlow(
  {
    name: 'detectGameStateFlow',
    inputSchema: DetectGameStateInputSchema,
    outputSchema: DetectGameStateOutputSchema,
  },
  async input => {
    const {output} = await detectGameStatePrompt(input);
    return output!;
  }
);
