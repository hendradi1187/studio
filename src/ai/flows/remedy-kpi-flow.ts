'use server';
/**
 * @fileOverview Flow to retrieve KPI data for BMC Remedy tickets.
 *
 * - getRemedyKpiData - Fetches KPI data from the BMC Remedy SOAP service.
 * - RemedyKpiOutput - The return type for KPI data.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { KpiData } from '@/types';
import { callRemedyService } from '@/lib/remedy-client';
import { formatISO, startOfDay, endOfDay } from 'date-fns';

const KpiDataSchema = z.object({
  activeTickets: z.number().describe('Total number of active tickets (Open or In Progress).'),
  pendingTickets: z.number().describe('Total number of tickets awaiting user or external action.'),
  breachedTickets: z.number().describe('Total number of tickets that have missed their SLA.'),
  closedToday: z.number().describe('Total number of tickets resolved and closed today.'),
});
export type RemedyKpiOutput = z.infer<typeof KpiDataSchema>;

// Helper function to get ticket counts for a given qualification
// IMPORTANT: This function needs to be updated to correctly parse the count
// from the actual SOAP response. Currently, it returns 0 as a placeholder.
const getTicketCount = async (qualification: string): Promise<number> => {
  try {
    const args = { Qualification: qualification, startRecord: "0", maxLimit: "0" };
    // The method name from WSDL is HelpDesk_QueryList_Service.
    const responseArray = await callRemedyService('HelpDesk_QueryList_Service', args);
    
    // TODO: Implement actual count parsing from responseArray[0] (the result object)
    // This is highly dependent on how your Remedy service returns counts with maxLimit: "0".
    // Examples:
    // - It might be in a specific field: `responseArray[0]?.numMatches` or `responseArray[0]?.totalCount`.
    // - It might be the length of `getListValues` if it returns a list even with maxLimit "0" but only metadata.
    // - You might need to inspect the raw XML `responseArray[1]` if the parsed object isn't clear.
    // For now, returning 0 to indicate this needs implementation.
    console.log(`SOAP call for qualification "${qualification}" succeeded. Count parsing is a placeholder.`);
    // Example of how you might access if it returns a list (check if `getListValues` exists and is an array):
    // const list = responseArray?.[0]?.getListValues;
    // if (Array.isArray(list)) return list.length; // This might be incorrect if it returns full items
    // If a count field is available, e.g. responseArray?.[0]?.totalMatches
    // if (responseArray?.[0] && typeof responseArray[0].totalMatches === 'number') {
    //   return responseArray[0].totalMatches;
    // } else if (responseArray?.[0] && typeof responseArray[0].totalMatches === 'string') {
    //   return parseInt(responseArray[0].totalMatches, 10) || 0;
    // }
    // If your WSDL returns a specific num_matches attribute (you'd need to check exact naming)
    // if (responseArray?.[0]?.attributes?.num_matches) {
    //  return parseInt(responseArray[0].attributes.num_matches, 10) || 0;
    // }


    // For the purpose of this exercise, since we cannot know the exact response structure for count,
    // we will return 0. The user will need to update this part.
    console.warn(`Placeholder count: The actual count extraction for qualification "${qualification}" needs to be implemented by inspecting the SOAP response.`);
    return 0; // Placeholder: Replace with actual count parsing logic.
  } catch (err) {
    console.error(`SOAP call failed for qualification "${qualification}":`, err);
    return 0; // Return 0 on error for this specific query
  }
};

async function fetchKpiDataFromRemedyService(): Promise<KpiData> {
  // Check if credentials are set (getRemedyClient will throw if not)
  // This is more of a pre-check before multiple calls.
  if (!process.env.REMEDY_USERNAME || !process.env.REMEDY_PASSWORD) {
    console.error("Remedy username or password not configured. Returning zeroed KPI data.");
    return { activeTickets: 0, pendingTickets: 0, breachedTickets: 0, closedToday: 0 };
  }
  
  // Define qualifications
  const activeTicketsQualification = "'Status'=\"New\" OR 'Status'=\"Assigned\" OR 'Status'=\"In Progress\"";
  const pendingTicketsQualification = "'Status'=\"Pending\"";
  
  // Breached Tickets: This query is highly dependent on your Remedy setup for SLA tracking.
  // It might involve checking a specific 'SLM Status' field or comparing 'Target_Date' with NOW.
  // Example assuming 'Target_Date' field and status not being final:
  // const nowISO = formatISO(new Date());
  // const breachedTicketsQualification = `'Target_Date' < "${nowISO}" AND ('Status' != "Resolved" AND 'Status' != "Closed" AND 'Status' != "Cancelled")`;
  // Or if you have a specific SLM status field:
  const breachedTicketsQualification = "'SLM Status' = \"Breached\" OR 'SLM Status' = \"SLA Missed\""; // Adjust if needed

  const todayStartISO = formatISO(startOfDay(new Date()));
  const todayEndISO = formatISO(endOfDay(new Date()));
  // Remedy date format for queries: 'YYYY-MM-DDTHH:mm:ssZ' or similar.
  // Ensure your Remedy system interprets these ISO strings correctly in queries.
  const closedTodayQualification = `'Status'="Closed" AND 'Closed_Date' >= "${todayStartISO}" AND 'Closed_Date' <= "${todayEndISO}"`;

  // Fetch counts
  // Using Promise.all to fetch concurrently
  const [activeTickets, pendingTickets, breachedTickets, closedToday] = await Promise.all([
    getTicketCount(activeTicketsQualification),
    getTicketCount(pendingTicketsQualification),
    getTicketCount(breachedTicketsQualification),
    getTicketCount(closedTodayQualification),
  ]);
  
  return {
    activeTickets,
    pendingTickets,
    breachedTickets,
    closedToday,
  };
}

const getRemedyKpiDataFlow = ai.defineFlow(
  {
    name: 'getRemedyKpiDataFlow',
    inputSchema: z.object({}), // No specific input
    outputSchema: KpiDataSchema,
  },
  async () => {
    console.log("Attempting to fetch KPI data from live Remedy service...");
    const kpiData = await fetchKpiDataFromRemedyService();
    console.log("Live KPI data received (or defaulted to 0s on error/placeholder):", kpiData);
    return kpiData;
  }
);

export async function getRemedyKpiData(): Promise<RemedyKpiOutput> {
  const result = await getRemedyKpiDataFlow({});
  return result;
}
