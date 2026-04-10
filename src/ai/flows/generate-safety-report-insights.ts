'use server';
/**
 * @fileOverview A Genkit flow for generating AI-powered summaries, insights, and recommendations
 * from aggregated gig worker accident data, intended for municipal traffic authorities or platform safety managers.
 *
 * - generateSafetyReportInsights - A function that handles the generation of safety report insights.
 * - GenerateSafetyReportInsightsInput - The input type for the generateSafetyReportInsights function.
 * - GenerateSafetyReportInsightsOutput - The return type for the generateSafetyReportInsights function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateSafetyReportInsightsInputSchema = z.object({
  quarter: z.string().describe('The quarter for which the report is generated (e.g., "Q1 2024").'),
  totalIncidents: z.number().describe('Total number of incidents detected in the quarter.'),
  platformsWithHighestIncidents: z.array(z.string()).describe('List of platforms with the highest incident rates.').optional(),
  topIncidentLocations: z.array(z.object({
    locationName: z.string().describe('Name or description of the location (e.g., "Intersection of Main St and 1st Ave").'),
    incidentCount: z.number().describe('Number of incidents at this location.'),
  })).describe('Top locations with the highest number of incidents.').optional(),
  peakIncidentTimes: z.array(z.string()).describe('Times of day (e.g., "18:00-21:00") with the highest incident frequency.').optional(),
  commonWeatherConditions: z.array(z.string()).describe('Most common weather conditions during incidents (e.g., "Rainy", "Foggy").').optional(),
  commonRoadTypes: z.array(z.string()).describe('Most common road types where incidents occurred (e.g., "Arterial Road", "Residential Street").').optional(),
});
export type GenerateSafetyReportInsightsInput = z.infer<typeof GenerateSafetyReportInsightsInputSchema>;

const GenerateSafetyReportInsightsOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the key findings from the aggregated accident data for the quarter.'),
  insights: z.array(z.string()).describe('Key observations and patterns identified from the data, providing deeper understanding of the trends.'),
  recommendations: z.array(z.string()).describe('Actionable recommendations based on the insights to improve road safety for gig workers.'),
});
export type GenerateSafetyReportInsightsOutput = z.infer<typeof GenerateSafetyReportInsightsOutputSchema>;

export async function generateSafetyReportInsights(input: GenerateSafetyReportInsightsInput): Promise<GenerateSafetyReportInsightsOutput> {
  return generateSafetyReportInsightsFlow(input);
}

const safetyReportPrompt = ai.definePrompt({
  name: 'safetyReportPrompt',
  input: { schema: GenerateSafetyReportInsightsInputSchema },
  output: { schema: GenerateSafetyReportInsightsOutputSchema },
  prompt: `You are an expert safety analyst specializing in urban logistics and gig worker safety. Your task is to analyze aggregated accident data for a specific quarter and provide a concise summary, key insights, and actionable recommendations to improve road safety.

Here is the aggregated accident data for the quarter {{{quarter}}}:

- Total incidents: {{{totalIncidents}}}
{{#if platformsWithHighestIncidents}}
- Platforms with highest incidents: {{#each platformsWithHighestIncidents}}- {{{this}}} {{/each}}
{{/if}}
{{#if topIncidentLocations}}
- Top incident locations: {{#each topIncidentLocations}}- {{{locationName}}} ({{incidentCount}} incidents) {{/each}}
{{/if}}
{{#if peakIncidentTimes}}
- Peak incident times: {{#each peakIncidentTimes}}- {{{this}}} {{/each}}
{{/if}}
{{#if commonWeatherConditions}}
- Common weather conditions: {{#each commonWeatherConditions}}- {{{this}}} {{/each}}
{{/if}}
{{#if commonRoadTypes}}
- Common road types: {{#each commonRoadTypes}}- {{{this}}} {{/each}}
{{/if}}


Based on this data, please provide:
1.  A concise summary of the overall safety situation.
2.  Key insights or patterns you observe.
3.  Actionable recommendations for municipal traffic authorities, gig platforms, and worker unions to enhance safety.`,
});

const generateSafetyReportInsightsFlow = ai.defineFlow(
  {
    name: 'generateSafetyReportInsightsFlow',
    inputSchema: GenerateSafetyReportInsightsInputSchema,
    outputSchema: GenerateSafetyReportInsightsOutputSchema,
  },
  async (input) => {
    const { output } = await safetyReportPrompt(input);
    return output!;
  }
);
