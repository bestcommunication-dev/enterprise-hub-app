import { config } from 'dotenv';
config();

import '@/ai/flows/calculate-commissions.ts';
import '@/ai/flows/contract-parser.ts';
import '@/ai/flows/send-notification.ts';
