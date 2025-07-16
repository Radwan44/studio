'use server';
/**
 * @fileOverview This file defines a Genkit flow for summarizing search results.
 *
 * - summarizeSearchResults - A function that takes search results and returns a summarized overview.
 * - SummarizeSearchResultsInput - The input type for the summarizeSearchResults function.
 * - SummarizeSearchResultsOutput - The return type for the summarizeSearchResults function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeSearchResultsInputSchema = z.object({
  results: z.array(z.object({
    studentName: z.string(),
    governorate: z.string(),
    doctorName: z.string(),
    className: z.string(),
    jobTitle: z.string(),
  })).describe('An array of search results, where each result is an object containing student information.'),
});
export type SummarizeSearchResultsInput = z.infer<typeof SummarizeSearchResultsInputSchema>;

const SummarizeSearchResultsOutputSchema = z.object({
  summary: z.string().describe('A summarized overview of the search results.'),
});
export type SummarizeSearchResultsOutput = z.infer<typeof SummarizeSearchResultsOutputSchema>;

export async function summarizeSearchResults(input: SummarizeSearchResultsInput): Promise<SummarizeSearchResultsOutput> {
  return summarizeSearchResultsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeSearchResultsPrompt',
  input: {schema: SummarizeSearchResultsInputSchema},
  output: {schema: SummarizeSearchResultsOutputSchema},
  prompt: `You are an AI assistant that summarizes search results related to students.

  Given the following search results, provide a concise overview highlighting key trends, commonalities, and notable individual entries.
  Focus on providing a summary that helps the user quickly understand the overall content of the search results.
  Only summarize entries that are related.
  
  Search Results:
  {{#each results}}
  - Student Name: {{studentName}}, Governorate: {{governorate}}, Doctor Name: {{doctorName}}, Class Name: {{className}}, Job Title: {{jobTitle}}
  {{/each}}
  `,
});

const summarizeSearchResultsFlow = ai.defineFlow(
  {
    name: 'summarizeSearchResultsFlow',
    inputSchema: SummarizeSearchResultsInputSchema,
    outputSchema: SummarizeSearchResultsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
