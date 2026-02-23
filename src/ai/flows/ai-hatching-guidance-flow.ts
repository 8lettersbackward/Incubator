'use server';
/**
 * @fileOverview Provides AI-assisted hatching guidance.
 *
 * - aiHatchingGuidance - A function that analyzes incubator conditions and provides recommendations.
 * - AiHatchingGuidanceInput - The input type for the aiHatchingGuidance function.
 * - AiHatchingGuidanceOutput - The return type for the aiHatchingGuidance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiHatchingGuidanceInputSchema = z.object({
  currentTemperature: z
    .number()
    .describe('Current temperature inside the incubator in Celsius.'),
  currentHumidity: z
    .number()
    .describe('Current humidity inside the incubator as a percentage (0-100).'),
  isHeaterActive: z.boolean().describe('Whether the heater is currently active.'),
  isFanActive: z.boolean().describe('Whether the ventilation fan is currently active.'),
  isTurningMotorActive: z
    .boolean()
    .describe('Whether the egg turning motor is currently active.'),
  waterLevelPercentage: z
    .number()
    .describe('Current water level in the reservoir as a percentage (0-100).'),
  eggType: z.string().describe('The type of egg being incubated (e.g., Chicken, Quail, Duck).'),
  historicalSummary: z
    .string()
    .optional()
    .describe('A summary of historical environmental data, if available.'),
});
export type AiHatchingGuidanceInput = z.infer<typeof AiHatchingGuidanceInputSchema>;

const AiHatchingGuidanceOutputSchema = z.object({
  recommendedTemperatureC: z.number().describe('Recommended temperature in Celsius.'),
  recommendedHumidityRH: z.number().describe('Recommended humidity as a percentage (0-100).'),
  recommendedTurningSchedule: z
    .string()
    .describe('Recommended egg turning schedule (e.g., "Turn every 4 hours").'),
  alerts: z
    .array(z.string())
    .describe('A list of proactive alerts or potential issues detected.'),
  generalGuidance: z.string().describe('General guidance or tips for optimal hatching.'),
});
export type AiHatchingGuidanceOutput = z.infer<typeof AiHatchingGuidanceOutputSchema>;

export async function aiHatchingGuidance(
  input: AiHatchingGuidanceInput
): Promise<AiHatchingGuidanceOutput> {
  return aiHatchingGuidanceFlow(input);
}

const aiHatchingGuidancePrompt = ai.definePrompt({
  name: 'aiHatchingGuidancePrompt',
  input: {schema: AiHatchingGuidanceInputSchema},
  output: {schema: AiHatchingGuidanceOutputSchema},
  prompt: `You are an expert embryologist specializing in avian incubation. Your task is to analyze the provided incubator conditions, egg type, and historical data to provide optimized environmental setting recommendations and proactive alerts.

Current Incubator Conditions:
- Temperature: {{{currentTemperature}}}°C
- Humidity: {{{currentHumidity}}}% RH
- Heater Active: {{{isHeaterActive}}}
- Fan Active: {{{isFanActive}}}
- Turning Motor Active: {{{isTurningMotorActive}}}
- Water Level: {{{waterLevelPercentage}}}%

Egg Type: {{{eggType}}}

{{#if historicalSummary}}
Historical Data Summary:
{{{historicalSummary}}}
{{/if}}

Based on this information, provide:
1.  **Optimized environmental setting recommendations** for temperature, humidity, and egg turning schedule for the specified egg type.
2.  **Proactive alerts** for any potential issues or deviations from ideal conditions.
3.  **General guidance** for successful hatching.

Ensure your response is structured exactly as per the output schema provided.`,
});

const aiHatchingGuidanceFlow = ai.defineFlow(
  {
    name: 'aiHatchingGuidanceFlow',
    inputSchema: AiHatchingGuidanceInputSchema,
    outputSchema: AiHatchingGuidanceOutputSchema,
  },
  async input => {
    const {output} = await aiHatchingGuidancePrompt(input);
    return output!;
  }
);
