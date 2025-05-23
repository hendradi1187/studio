'use server';
/**
 * @fileOverview Flow to retrieve a list of tickets from BMC Remedy.
 *
 * - getRemedyTicketList - Fetches a list of tickets based on a qualification.
 * - GetRemedyTicketListInput - Input type for the flow.
 * - RemedyTicketListOutput - Output type (array of Tickets).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { Ticket, TicketPriority, TicketStatus } from '@/types';
import { callRemedyService } from '@/lib/remedy-client';
import { parseISO, isValid, formatISO } from 'date-fns';

// Define Zod schema for individual ticket matching the Ticket interface
const TicketSchema = z.object({
  id: z.string(), // Incident_Number
  title: z.string(), // Summary
  owner: z.string(), // Assignee
  assignedGroup: z.string(), // Assigned_Group
  status: z.string(), // Status - will be cast to TicketStatus
  priority: z.string(), // Priority - will be cast to TicketPriority
  slaDeadline: z.string(), // Target_Date
  createdAt: z.string(), // Reported_Date
  closedDate: z.string().nullable().optional(), // Closed_Date
  lastModifiedDate: z.string().nullable().optional(), // Placeholder for now
});

const GetRemedyTicketListInputSchema = z.object({
  qualification: z.string().describe("The Remedy query string (e.g., 'Status' != \"Closed\")"),
  startRecord: z.string().optional().default("0").describe("Start record for pagination"),
  maxLimit: z.string().optional().default("100").describe("Maximum number of records to return"),
});
export type GetRemedyTicketListInput = z.infer<typeof GetRemedyTicketListInputSchema>;

export type RemedyTicketListOutput = Ticket[];

// Helper to safely parse dates from Remedy, returning null if invalid
function parseRemedyDate(dateString: any): string | null {
  if (!dateString || typeof dateString !== 'string') {
    return null;
  }
  try {
    const parsed = parseISO(dateString);
    return isValid(parsed) ? formatISO(parsed) : null;
  } catch (e) {
    return null; // If parseISO throws for some reason
  }
}


const getRemedyTicketListFlow = ai.defineFlow(
  {
    name: 'getRemedyTicketListFlow',
    inputSchema: GetRemedyTicketListInputSchema,
    outputSchema: z.array(TicketSchema), // Flow will return an array of tickets
  },
  async (input: GetRemedyTicketListInput): Promise<Ticket[]> => {
    console.log("Attempting to fetch ticket list from live Remedy service with qualification:", input.qualification);

    if (!process.env.REMEDY_USERNAME || !process.env.REMEDY_PASSWORD) {
      console.error("Remedy username or password not configured. Returning empty ticket list.");
      return [];
    }

    const args = {
      Qualification: input.qualification,
      startRecord: input.startRecord,
      maxLimit: input.maxLimit,
    };

    try {
      const responseArray = await callRemedyService('HelpDesk_QueryList_Service', args);
      const resultObject = responseArray?.[0];
      
      if (resultObject && resultObject.getListValues) {
        const rawTickets = Array.isArray(resultObject.getListValues)
          ? resultObject.getListValues
          : [resultObject.getListValues]; // Handle single item case

        const tickets: Ticket[] = rawTickets.map((rawTicket: any): Ticket => {
          // Basic safety checks for status and priority before casting
          const status = rawTicket.Status as TicketStatus || 'Unknown';
          const priority = rawTicket.Priority as TicketPriority || 'Unknown';
          
          return {
            id: rawTicket.Incident_Number || 'N/A',
            title: rawTicket.Summary || 'No Title',
            owner: rawTicket.Assignee || 'Unassigned',
            assignedGroup: rawTicket.Assigned_Group || 'N/A',
            status: status,
            priority: priority,
            slaDeadline: parseRemedyDate(rawTicket.Target_Date) || formatISO(new Date(0)), // Default to epoch if null
            createdAt: parseRemedyDate(rawTicket.Reported_Date) || formatISO(new Date(0)), // Default to epoch if null
            closedDate: parseRemedyDate(rawTicket.Closed_Date),
            lastModifiedDate: parseRemedyDate(rawTicket.Last_Modified_By_Date), // Assuming a field like Last_Modified_By_Date exists, adjust if needed
          };
        });
        console.log(`Successfully fetched and mapped ${tickets.length} tickets.`);
        return tickets;
      } else {
        console.log("No getListValues found in Remedy response or response was empty.");
        return [];
      }
    } catch (error) {
      console.error('Failed to fetch or process ticket list from Remedy:', error);
      return []; // Return empty list on error
    }
  }
);

export async function getRemedyTicketList(input: GetRemedyTicketListInput): Promise<RemedyTicketListOutput> {
  return getRemedyTicketListFlow(input);
}
