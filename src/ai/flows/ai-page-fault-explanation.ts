'use server';
/**
 * @fileOverview An AI agent that explains specific page fault/hit events in a page replacement simulation
 * and suggests alternative scenarios.
 *
 * - explainPageFault - A function that handles the explanation and scenario suggestion process.
 * - AiPageFaultExplanationInput - The input type for the explainPageFault function.
 * - AiPageFaultExplanationOutput - The return type for the explainPageFault function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiPageFaultExplanationInputSchema = z.object({
  referenceString: z
    .string()
    .describe('The full reference string used in the simulation, e.g., "7,0,1,2,0,3,0,4,2,3,0,3,2,1,2,0,1,7,0,1".'),
  numFrames: z.number().int().min(1).max(10).describe('The number of frames used in the simulation.'),
  algorithm: z.enum(['FIFO', 'LRU', 'LFU', 'MFU']).describe('The page replacement algorithm used.'),
  currentAccessIndex: z.number().int().min(0).describe('The index of the current page access in the reference string.'),
  pageAccessed: z.string().describe('The page value being accessed at this step, e.g., "A" or "7".'),
  isHit: z.boolean().describe('True if the current access was a page hit, false if it was a page fault.'),
  framesBefore: z
    .array(z.string())
    .describe('The state of the memory frames before the current page access.'),
  framesAfter: z
    .array(z.string())
    .describe('The state of the memory frames after the current page access (if a fault occurred).'),
  pageReplaced: z.string().optional().describe('The page that was replaced, if it was a fault.'),
  replacementReason: z
    .string()
    .optional()
    .describe(
      'A brief explanation of why a specific page was replaced, based on the algorithm (e.g., "oldest page", "least recently used").'
    ),
});
export type AiPageFaultExplanationInput = z.infer<typeof AiPageFaultExplanationInputSchema>;

const SuggestedScenarioSchema = z.object({
  description: z.string().describe('A description of the suggested scenario.'),
  changes: z
    .object({
      referenceString: z.string().optional().describe('An alternative reference string to try.'),
      numFrames: z
        .number()
        .int()
        .min(1)
        .max(10)
        .optional()
        .describe('An alternative number of frames to try.'),
      algorithm: z
        .enum(['FIFO', 'LRU', 'LFU', 'MFU'])
        .optional()
        .describe('An alternative page replacement algorithm to try.'),
    })
    .describe('The specific changes to apply for this scenario.'),
});

const AiPageFaultExplanationOutputSchema = z.object({
  explanation: z
    .string()
    .describe('A detailed explanation of why the specific page access resulted in a hit or fault.'),
  suggestedScenarios: z
    .array(SuggestedScenarioSchema)
    .describe(
      'An array of 2-3 alternative scenarios to explore, with descriptions and suggested input changes.'
    ),
});
export type AiPageFaultExplanationOutput = z.infer<typeof AiPageFaultExplanationOutputSchema>;

export async function explainPageFault(
  input: AiPageFaultExplanationInput
): Promise<AiPageFaultExplanationOutput> {
  return explainPageFaultFlow(input);
}

const explainPageFaultPrompt = ai.definePrompt({
  name: 'explainPageFaultPrompt',
  input: {schema: AiPageFaultExplanationInputSchema},
  output: {schema: AiPageFaultExplanationOutputSchema},
  prompt: `You are an expert in Operating System page replacement algorithms (FIFO, LRU, LFU, MFU).
Your task is to analyze a specific step in a page replacement simulation and provide a clear explanation for why a hit or fault occurred, and then suggest alternative scenarios to deepen understanding.

Here are the details of the simulation step:
- Algorithm: {{{algorithm}}}
- Total Frames: {{{numFrames}}}
- Reference String: {{{referenceString}}}
- Current Access Index: {{{currentAccessIndex}}}
- Page Accessed: {{{pageAccessed}}}
- Was it a Hit?: {{{isHit}}}
- Frames Before Access: {{{JSON.stringify framesBefore}}}
- Frames After Access: {{{JSON.stringify framesAfter}}}
{{#if pageReplaced}}
- Page Replaced: {{{pageReplaced}}}
- Reason for Replacement: {{{replacementReason}}}
{{/if}}

Provide a detailed explanation focusing on the core logic of the {{{algorithm}}} algorithm at this specific step.
If it was a hit, explain why the page was found in memory.
If it was a fault, explain why the page was not found, which page was chosen for replacement, and precisely why it was chosen according to the {{{algorithm}}} algorithm's rules.

After the explanation, suggest 2-3 distinct alternative scenarios. For each scenario, describe the change (e.g., a different reference string, more/fewer frames, or a different algorithm) and briefly explain what outcome one might expect and why it would be different from the current scenario. Each suggested scenario should include specific 'changes' in JSON format that could be directly applied to modify the simulation input.

Structure your output as a JSON object matching the provided schema, with an 'explanation' string and an array of 'suggestedScenarios', each having a 'description' and a 'changes' object.`,
});

const explainPageFaultFlow = ai.defineFlow(
  {
    name: 'explainPageFaultFlow',
    inputSchema: AiPageFaultExplanationInputSchema,
    outputSchema: AiPageFaultExplanationOutputSchema,
  },
  async (input) => {
    const {output} = await explainPageFaultPrompt(input);
    if (!output) {
      throw new Error('Failed to get output from prompt.');
    }
    return output;
  }
);
