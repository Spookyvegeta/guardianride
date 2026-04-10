'use server';
/**
 * @fileOverview A Genkit flow for generating dynamic emergency messages for gig worker accidents.
 *
 * - generateDynamicEmergencyMessage - A function that generates an emergency message.
 * - GenerateEmergencyMessageInput - The input type for the generateDynamicEmergencyMessage function.
 * - GenerateEmergencyMessageOutput - The return type for the generateDynamicEmergencyMessage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input Schema
const GenerateEmergencyMessageInputSchema = z.object({
  workerName: z.string().describe('The name of the gig worker involved in the incident.'),
  bloodGroup: z.string().describe('The blood group of the worker.'),
  medicalConditions: z.string().describe('Any known medical conditions of the worker, comma-separated if multiple.'),
  platformsWorkingOn: z.array(z.string()).describe('A list of gig platforms the worker was active on.'),
  incidentTime: z.string().describe('The time of the incident, e.g., "2:30 PM on March 15th, 2024".'),
  gpsLink: z.string().url().describe('A Google Maps link to the incident location.'),
  contactLanguagePreference: z.string().describe('The preferred language for the emergency message (e.g., "English", "Hindi").'),
  accidentDetails: z.string().describe('A summary of the accident detected by the system, e.g., "high speed deceleration followed by impact and no movement."'),
});
export type GenerateEmergencyMessageInput = z.infer<typeof GenerateEmergencyMessageInputSchema>;

// Output Schema
const GenerateEmergencyMessageOutputSchema = z.object({
  emergencyMessage: z.string().describe('The dynamically generated emergency message for the contact.'),
});
export type GenerateEmergencyMessageOutput = z.infer<typeof GenerateEmergencyMessageOutputSchema>;

// Wrapper function
export async function generateDynamicEmergencyMessage(
  input: GenerateEmergencyMessageInput
): Promise<GenerateEmergencyMessageOutput> {
  return generateEmergencyMessageFlow(input);
}

// Prompt definition
const generateEmergencyMessagePrompt = ai.definePrompt({
  name: 'generateEmergencyMessagePrompt',
  input: { schema: GenerateEmergencyMessageInputSchema },
  output: { schema: GenerateEmergencyMessageOutputSchema },
  prompt: `You are an emergency notification system. Your task is to generate a concise, urgent, and informative message for an emergency contact about a gig worker's accident. The message should be polite but emphasize urgency and clarity, providing all necessary information.\n\nGenerate the message in {{contactLanguagePreference}}.\n\nHere are the details of the incident:\n- Worker Name: {{{workerName}}}\n- Accident Details: {{{accidentDetails}}}\n- Incident Time: {{{incidentTime}}}\n- GPS Location: {{{gpsLink}}}\n- Blood Group: {{{bloodGroup}}}\n- Medical Conditions: {{{medicalConditions}}}\n- Working Platforms: {{#each platformsWorkingOn}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}\n\nPlease generate the message now.`,
});

// Flow definition
const generateEmergencyMessageFlow = ai.defineFlow(
  {
    name: 'generateEmergencyMessageFlow',
    inputSchema: GenerateEmergencyMessageInputSchema,
    outputSchema: GenerateEmergencyMessageOutputSchema,
  },
  async (input) => {
    const { output } = await generateEmergencyMessagePrompt(input);
    return output!;
  }
);
