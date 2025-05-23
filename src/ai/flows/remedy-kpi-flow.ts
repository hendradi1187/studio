
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
import { createClientAsync, type Client } from 'soap';
import { formatISO, startOfDay, endOfDay } from 'date-fns';

const KpiDataSchema = z.object({
  activeTickets: z.number().describe('Total number of active tickets (Open or In Progress).'),
  pendingTickets: z.number().describe('Total number of tickets awaiting user or external action.'),
  breachedTickets: z.number().describe('Total number of tickets that have missed their SLA.'),
  closedToday: z.number().describe('Total number of tickets resolved and closed today.'),
});
export type RemedyKpiOutput = z.infer<typeof KpiDataSchema>;

/**
 * Fetches KPI data from the BMC Remedy SOAP service.
 * This function connects to the WSDL, makes appropriate service calls, and maps the response.
 */
async function fetchKpiDataFromRemedyService(): Promise<KpiData> {
  const wsdlUrl = 'https://helpdesk.skkmigas.go.id/arsys/WSDL/public/jkt-aplikasi291.bpmigas.com/HPD_IncidentInterface_WS';
  
  const remedyUsername = process.env.REMEDY_USERNAME;
  const remedyPassword = process.env.REMEDY_PASSWORD;

  if (!remedyUsername || !remedyPassword) {
    console.error("Remedy username or password not configured in .env file. Please set REMEDY_USERNAME and REMEDY_PASSWORD.");
    // In a real app, throw an error or return default error KPI data.
    // For now, returning zeros to indicate failure to connect.
    return {
        activeTickets: 0,
        pendingTickets: 0,
        breachedTickets: 0,
        closedToday: 0,
    };
  }

  let client: Client;
  try {
    client = await createClientAsync(wsdlUrl);
    // console.log('SOAP client created. Describing service:');
    // console.log(JSON.stringify(client.describe().HPD_IncidentInterface_WSService.HPD_IncidentInterface_WSPortTypeSoap, null, 2));


    // Add Authentication Header as per WSDL:
    // <soap:header message="s0:ARAuthenticate" part="parameters" use="literal"> </soap:header>
    // <xsd:element name="AuthenticationInfo" type="s0:AuthenticationInfo"/>
    // <xsd:complexType name="AuthenticationInfo"> <xsd:sequence>
    //   <xsd:element name="userName" type="xsd:string"/>
    //   <xsd:element name="password" type="xsd:string"/>
    // ...
    const authHeader = {
      'AuthenticationInfo': {
        attributes: { 'xmlns': 'urn:HPD_IncidentInterface_WS' }, // Namespace from WSDL targetNamespace
        'userName': remedyUsername,
        'password': remedyPassword,
      }
    };
    client.addSoapHeader(authHeader);

  } catch (error) {
    console.error("Failed to create SOAP client or set auth header:", error);
    // Fallback to zeros if client creation fails
    return { activeTickets: 0, pendingTickets: 0, breachedTickets: 0, closedToday: 0 };
  }

  // Helper function to get ticket counts for a given qualification
  // IMPORTANT: The actual parsing of the count from the SOAP response needs to be verified.
  // Remedy's `HelpDesk_QueryList_Service` with `maxLimit: "0"` might return the count
  // in a specific field or require inspecting the raw response.
  // For now, this function will simulate the count after attempting the call.
  const getTicketCount = async (qualification: string): Promise<number> => {
    try {
      // For counting, typically startRecord is "0" and maxLimit is "0" or "1".
      // If maxLimit is "0", some systems return a count directly, others return no records.
      // If maxLimit is "1", it checks if at least one record exists.
      const args = { Qualification: qualification, startRecord: "0", maxLimit: "0" };
      
      // The method name from WSDL is HelpDesk_QueryList_Service.
      // The `soap` library client might append `Async` or have a different casing.
      // Use client.describe() to confirm the exact method name on the client object.
      // Common pattern: client.HelpDesk_QueryList_ServiceAsync(args)
      
      console.log(`Executing SOAP call for qualification: ${qualification}`);
      // Example: const response = await client.HelpDesk_QueryList_ServiceAsync(args);
      // The actual response structure for count needs to be determined.
      // It might be response[0].totalMatches, response[0].numMatches, response[0].getListValues.length (if maxLimit returns records),
      // or extracted from raw response (response[1]).
      
      // For now, simulating a count as the exact response parsing needs real server testing.
      // TODO: Replace this with actual response parsing for the count.
      // For example, if the response object `res` has a `numMatches` field: `return parseInt(res.numMatches) || 0;`
      // Or if it's in the length of a returned list: `return res.getListValues ? res.getListValues.length : 0;`
      
      // This is a placeholder after attempting the call.
      // In a real scenario, you'd parse `response` here.
      await client.HelpDesk_QueryList_ServiceAsync(args); // Make the call
      console.log(`SOAP call attempted for: ${qualification}. Count parsing is currently a placeholder.`);
      return Math.floor(Math.random() * 10); // Placeholder count
    } catch (err) {
      console.error(`SOAP call failed for qualification "${qualification}":`, err);
      return 0; // Return 0 on error for this specific query
    }
  };

  // Define qualifications for each KPI
  // Note: Remedy query syntax can be very specific. These are common patterns.
  // 'Status' values are based on the <xsd:simpleType name="StatusType"> from WSDL
  const activeTicketsQualification = "'Status'=\"New\" OR 'Status'=\"Assigned\" OR 'Status'=\"In Progress\"";
  const pendingTicketsQualification = "'Status'=\"Pending\"";
  
  // Breached Tickets: Qualification depends on how SLAs are tracked.
  // This might be a specific status, or a query on 'Target_Date' < NOW() AND 'Status' NOT IN ("Closed", "Resolved")
  // For Remedy, date queries can be complex. Example: 'Target_Date' < $TIMESTAMP$ ( Remedy keyword for now)
  // Or use specific date string formats if $TIMESTAMP$ is not supported/desired.
  // Assuming a status 'Breached' might exist or is calculated elsewhere for simplicity here.
  // Or a query like: `('Target_Date' < "${formatISO(new Date())}") AND ('Status' != "Resolved" AND 'Status' != "Closed")`
  // This example assumes 'Breached' is a status that can be directly queried.
  const breachedTicketsQualification = "'SLM Status' = \"Breached\" OR 'SLM Status' = \"SLA Missed\""; // Example if SLM Status field exists

  const todayStartISO = formatISO(startOfDay(new Date()));
  const todayEndISO = formatISO(endOfDay(new Date()));
  // Remedy date format for queries can be 'YYYY-MM-DDTHH:mm:ssZ' or epoch seconds.
  // Example: `'Closed_Date' >= "${todayStartISO}" AND 'Closed_Date' <= "${todayEndISO}"`
  // Or using Remedy keywords if available: 'Closed_Date' >= $TODAY$ AND 'Closed_Date' < $TOMORROW$
  const closedTodayQualification = `'Status'="Closed" AND 'Closed_Date' >= "${todayStartISO}" AND 'Closed_Date' <= "${todayEndISO}"`;

  // Fetch counts for each KPI
  // These calls will be made sequentially. Consider Promise.all for parallel execution if appropriate.
  const activeTickets = await getTicketCount(activeTicketsQualification);
  const pendingTickets = await getTicketCount(pendingTicketsQualification);
  const breachedTickets = await getTicketCount(breachedTicketsQualification); // Placeholder, actual query depends on SLA tracking
  const closedToday = await getTicketCount(closedTodayQualification);
  
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
    inputSchema: z.object({}), // No specific input for now
    outputSchema: KpiDataSchema,
  },
  async () => {
    console.log("Attempting to fetch KPI data from Remedy service...");
    const kpiData = await fetchKpiDataFromRemedyService();
    console.log("KPI data received/simulated:", kpiData);
    return kpiData;
  }
);

/**
 * Fetches KPI data for the Remedy dashboard.
 * This function wraps the Genkit flow that fetches data from the BMC Remedy service.
 */
export async function getRemedyKpiData(): Promise<RemedyKpiOutput> {
  // The flow itself now contains the logic to call the service.
  const result = await getRemedyKpiDataFlow({});
  return result;
}
