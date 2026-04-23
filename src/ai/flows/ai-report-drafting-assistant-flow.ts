'use server';
/**
 * @fileOverview An AI assistant flow for drafting and structuring operational report descriptions.
 *
 * - aiReportDraftingAssistant - A function that generates a structured report description.
 * - AiReportDraftingAssistantInput - The input type for the aiReportDraftingAssistant function.
 * - AiReportDraftingAssistantOutput - The return type for the aiReportDraftingAssistant function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AiReportDraftingAssistantInputSchema = z.object({
  reportNotes: z
    .string()
    .describe('Raw notes or key points provided by the employee for the report.'),
  projectName: z
    .string()
    .describe('The name of the project this operational report pertains to.'),
  employeeName: z
    .string()
    .describe('The name of the employee drafting the report.'),
});
export type AiReportDraftingAssistantInput = z.infer<
  typeof AiReportDraftingAssistantInputSchema
>;

const AiReportDraftingAssistantOutputSchema = z.object({
  draftedReportDescription: z
    .string()
    .describe('A comprehensive, structured, and clear draft of the operational report description.'),
  keyHighlights: z
    .array(z.string())
    .describe('A list of key highlights or main points extracted from the report.'),
});
export type AiReportDraftingAssistantOutput = z.infer<
  typeof AiReportDraftingAssistantOutputSchema
>;

export async function aiReportDraftingAssistant(
  input: AiReportDraftingAssistantInput
): Promise<AiReportDraftingAssistantOutput> {
  return aiReportDraftingAssistantFlow(input);
}

const reportDraftingPrompt = ai.definePrompt({
  name: 'reportDraftingPrompt',
  input: { schema: AiReportDraftingAssistantInputSchema },
  output: { schema: AiReportDraftingAssistantOutputSchema },
  prompt: `You are an AI assistant specialized in drafting operational reports for solar energy companies.
Your goal is to help an employee named "{{{employeeName}}}" from project "{{{projectName}}}" transform raw notes into a comprehensive, structured, and clear report description.

The report description should:
1. Start with a concise summary of the report's purpose and key activities.
2. Provide details based on the raw notes, organizing them logically (e.g., by task, issue, or progress).
3. Be professional, objective, and easy to understand for stakeholders.
4. Conclude with any immediate next steps or observations, if applicable.

Additionally, extract a bulleted list of the most important key highlights from the report.

Here are the raw notes provided by the employee:
{{{reportNotes}}}`,
});

const aiReportDraftingAssistantFlow = ai.defineFlow(
  {
    name: 'aiReportDraftingAssistantFlow',
    inputSchema: AiReportDraftingAssistantInputSchema,
    outputSchema: AiReportDraftingAssistantOutputSchema,
  },
  async (input) => {
    const { output } = await reportDraftingPrompt(input);
    return output!;
  }
);
