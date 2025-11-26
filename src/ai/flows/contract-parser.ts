'use server';
/**
 * @fileOverview An AI agent for parsing contract documents.
 *
 * - extractContractData - A function that handles the contract data extraction process.
 * - ContractParserInput - The input type for the extractContractData function.
 * - ContractParserOutput - The return type for the extractContractData function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ContractParserInputSchema = z.object({
  documents: z.array(z.string()).describe(
    "An array of contract document pages, as data URIs. Each must include a MIME type and use Base64 encoding. e.g., 'data:image/png;base64,<encoded_data>'"
  ),
});
export type ContractParserInput = z.infer<typeof ContractParserInputSchema>;

const ContractParserOutputSchema = z.object({
    clientName: z.string().optional().describe('The full name of the client.'),
    agentName: z.string().optional().describe('The full name of the agent.'),
    department: z.string().optional().describe("The business department, which can be 'Energia', 'Telefonia', or 'Noleggio'."),
    contractType: z.string().optional().describe("The type of contract, e.g., 'Luce', 'Gas', 'Mobile'."),
    signatureDate: z.string().optional().describe("The signature date of the contract in dd/MM/yyyy format."),
    pdrPod: z.string().optional().describe('The PDR or POD code for energy contracts.'),
    annualConsumption: z.number().optional().describe('The annual consumption in kWh or Smc.'),
});
export type ContractParserOutput = z.infer<typeof ContractParserOutputSchema>;

export async function extractContractData(input: ContractParserInput): Promise<ContractParserOutput> {
  return contractParserFlow(input);
}

const contractParserFlow = ai.defineFlow(
  {
    name: 'contractParserFlow',
    inputSchema: ContractParserInputSchema,
    outputSchema: ContractParserOutputSchema,
  },
  async (input) => {
    const { documents } = input;

    const mediaParts = documents.map(doc => ({ media: { url: doc } }));

    const prompt = `
      You are an expert in analyzing contracts for a multi-utility company.
      Your task is to extract the following information from the provided document images or PDFs.
      Provide the output in JSON format.
      - clientName: The full name of the client.
      - agentName: The full name of the sales agent.
      - department: The business department. Must be one of: 'Energia', 'Telefonia', 'Noleggio'.
      - contractType: The type of contract (e.g., 'Luce', 'Gas', 'Mobile').
      - signatureDate: The date the contract was signed, in dd/MM/yyyy format.
      - pdrPod: The PDR (for gas) or POD (for electricity) code, if present.
      - annualConsumption: The annual consumption value (consumo annuo), if present.

      Analyze the following document pages:
    `;

    const { output } = await ai.generate({
      prompt: [
        { text: prompt },
        ...mediaParts
      ],
      output: {
        format: 'json',
        schema: ContractParserOutputSchema,
      },
      model: 'googleai/gemini-2.5-flash',
      config: {
        temperature: 0, // Be precise
      }
    });

    return output!;
  }
);
