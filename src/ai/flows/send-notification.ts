'use server';
/**
 * @fileOverview A flow for sending notifications via Nodemailer using a Gmail account.
 * This flow sends an email directly using SMTP.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import * as nodemailer from 'nodemailer';
import { users, clients } from '@/lib/data';

const SendNotificationInputSchema = z.object({
  contractId: z.string(),
  clientId: z.string(),
  agentId: z.string(),
  department: z.string(),
  signatureDate: z.string(),
  status: z.string(),
});
export type SendNotificationInput = z.infer<typeof SendNotificationInputSchema>;

export const sendNotificationFlow = ai.defineFlow(
  {
    name: 'sendNotificationFlow',
    inputSchema: SendNotificationInputSchema,
    outputSchema: z.object({ success: z.boolean(), message: z.string() }),
  },
  async (input) => {
    const { contractId, clientId, agentId, department, signatureDate, status } = input;

    // These are mock data lookups. In a real app, this might involve fetching from a database.
    const client = clients.find(c => c.id === clientId);
    const agent = users.find(u => u.id === agentId);
    
    // Ensure we have the required environment variables.
    const gmailEmail = process.env.GMAIL_EMAIL;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

    if (!gmailEmail || !gmailAppPassword) {
      console.error("Gmail credentials are not set in .env file.");
      throw new Error("Server is not configured for sending emails. Missing GMAIL_EMAIL or GMAIL_APP_PASSWORD.");
    }

    // Create a transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailEmail,
        pass: gmailAppPassword,
      },
    });

    const mailOptions = {
      from: `"HUB Dem Group" <${gmailEmail}>`,
      to: 'michyamico@gmail.com', // For now, sends to a fixed admin address. Could be dynamic.
      subject: `Nuovo Contratto Creato: ${client?.name || 'N/D'}`,
      html: `
        <h1>Nuovo Contratto Inserito</h1>
        <p>Un nuovo contratto è stato creato nel sistema.</p>
        <ul>
          <li><strong>ID Contratto:</strong> ${contractId}</li>
          <li><strong>Cliente:</strong> ${client?.name || 'N/D'}</li>
          <li><strong>Agente:</strong> ${agent?.name || 'N/D'}</li>
          <li><strong>Reparto:</strong> ${department}</li>
          <li><strong>Data Firma:</strong> ${signatureDate}</li>
          <li><strong>Stato:</strong> ${status}</li>
        </ul>
      `,
    };

    try {
      // Send mail with defined transport object
      const info = await transporter.sendMail(mailOptions);
      console.log('Message sent: %s', info.messageId);
      return { success: true, message: `Email sent successfully: ${info.messageId}` };
    } catch (e) {
      console.error("Error sending email with Nodemailer:", e);
      // Throw a more descriptive error to the client
      throw new Error(`Failed to send notification email. Error: ${(e as Error).message}`);
    }
  }
);
