'use server';
/**
 * @fileOverview A commission calculation AI agent.
 *
 * - calculateCommissions - A function that handles the commission calculation process.
 * - CalculateCommissionsInput - The input type for the calculateCommissions function.
 * - CalculateCommissionsOutput - The return type for the calculateCommissions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { addMonths, formatISO } from 'date-fns';

export type CommissionFormula = 'Standard' | 'TOP50' | 'INBORSA' | 'INBORSA TOP';

const CalculateCommissionsInputSchema = z.object({
  contractId: z.string(),
  agentId: z.string(),
  agentCommissionRate: z.number().min(0).max(1).describe('The agent\'s commission percentage, e.g., 0.7 for 70%'),
  baseCommission: z.number().describe('The total commission value for the contract, e.g., 100'),
  offerCommissionFormula: z.enum(['Standard', 'TOP50', 'INBORSA', 'INBORSA TOP']).describe('The commission formula associated with the offer.'),
  annualConsumption: z.number().optional().describe('The annual consumption, required for some formulas.'),
  provider: z.string().describe('The provider of the contract, e.g., "edison"'),
  startDate: z.string().describe('The start date of the contract in ISO format.'),
});
export type CalculateCommissionsInput = z.infer<typeof CalculateCommissionsInputSchema>;

const CommissionPaymentSchema = z.object({
    agentId: z.string(),
    contractId: z.string(),
    amount: z.number(),
    paymentDate: z.string().describe('The date the commission should be paid in ISO format.'),
    type: z.enum(['OneTime', 'Recurring']),
});

const CalculateCommissionsOutputSchema = z.object({
  payments: z.array(CommissionPaymentSchema).describe('A list of commission payments to be made.'),
});
export type CalculateCommissionsOutput = z.infer<typeof CalculateCommissionsOutputSchema>;

export async function calculateCommissions(input: CalculateCommissionsInput): Promise<CalculateCommissionsOutput> {
  return calculateCommissionsFlow(input);
}


const calculateCommissionsFlow = ai.defineFlow(
  {
    name: 'calculateCommissionsFlow',
    inputSchema: CalculateCommissionsInputSchema,
    outputSchema: CalculateCommissionsOutputSchema,
  },
  async (input) => {
    const payments: z.infer<typeof CommissionPaymentSchema>[] = [];
    const { 
        agentCommissionRate, 
        baseCommission, 
        agentId, 
        contractId, 
        startDate,
        provider,
        offerCommissionFormula,
        annualConsumption 
    } = input;
    
    const isSpecialEdisonFormula = provider.toLowerCase() === 'edison' && offerCommissionFormula !== 'Standard';

    if (isSpecialEdisonFormula) {
        // Special formula calculation for Edison should replace the base commission logic.
        if (!annualConsumption) {
            throw new Error('Annual consumption is required for special Edison commission formulas.');
        }

        const startDateObj = new Date(startDate);

        switch (offerCommissionFormula) {
            case 'TOP50': {
                // Base one-time commission from contract
                if (baseCommission > 0) {
                     payments.push({
                        agentId,
                        contractId,
                        amount: baseCommission * agentCommissionRate,
                        paymentDate: startDate,
                        type: 'OneTime',
                    });
                }
                // Recurring commission
                const monthlyCommission = (annualConsumption * 0.006) / 12 * agentCommissionRate;
                for (let i = 0; i < 12; i++) {
                    payments.push({
                        agentId,
                        contractId,
                        amount: monthlyCommission,
                        paymentDate: formatISO(addMonths(startDateObj, i + 1)),
                        type: 'Recurring',
                    });
                }
                break;
            }
            case 'INBORSA':
            case 'INBORSA TOP': {
                const factor = offerCommissionFormula === 'INBORSA' ? 0.065 : 0.05;
                const totalFormulaCommission = annualConsumption * factor;
                const agentTotalCommission = totalFormulaCommission * agentCommissionRate;

                // 30% one-time payment based on the formula's total
                payments.push({
                    agentId,
                    contractId,
                    amount: agentTotalCommission * 0.30,
                    paymentDate: startDate,
                    type: 'OneTime',
                });
                
                // 70% divided into 12 months for the first year
                const recurringAmount = (agentTotalCommission * 0.70) / 12;
                for (let i = 0; i < 12; i++) {
                    payments.push({
                        agentId,
                        contractId,
                        amount: recurringAmount,
                        paymentDate: formatISO(addMonths(startDateObj, i + 1)),
                        type: 'Recurring',
                    });
                }
                break;
            }
        }
    } else {
        // Standard commission calculation (non-Edison or 'Standard' formula)
        const agentBaseCommission = baseCommission * agentCommissionRate;
        if (agentBaseCommission > 0) {
            payments.push({
                agentId,
                contractId,
                amount: agentBaseCommission,
                paymentDate: startDate,
                type: 'OneTime',
            });
        }
    }
    
    // Filter out any zero-amount payments
    const finalPayments = payments.filter(p => p.amount > 0);

    return { payments: finalPayments };
  }
);
