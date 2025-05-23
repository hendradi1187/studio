'use server';
import { createClientAsync, type Client } from 'soap';

// This module aims to manage a singleton SOAP client instance.
// However, in a serverless environment (like Next.js API routes or Genkit flows on serverless),
// global variables might not persist reliably across invocations or scale well.
// For Genkit flows which are server-side, this approach might be acceptable if flows are short-lived
// or if the environment manages state better. Consider implications for scaling.

let remedyClientInstance: Client | null = null;
let clientInitializationPromise: Promise<Client> | null = null;

const wsdlUrl = 'https://helpdesk.skkmigas.go.id/arsys/WSDL/public/jkt-aplikasi291.bpmigas.com/HPD_IncidentInterface_WS';

async function initializeClient(): Promise<Client> {
  try {
    const remedyUsername = process.env.REMEDY_USERNAME;
    const remedyPassword = process.env.REMEDY_PASSWORD;

    if (!remedyUsername || !remedyPassword) {
      console.error("Remedy username or password not configured in .env file. Please set REMEDY_USERNAME and REMEDY_PASSWORD.");
      throw new Error("Remedy username or password not configured.");
    }

    console.log('Initializing new SOAP client instance...');
    const client = await createClientAsync(wsdlUrl);
    console.log('SOAP client created from WSDL.');

    const authHeader = {
      'AuthenticationInfo': {
        attributes: { 'xmlns': 'urn:HPD_IncidentInterface_WS' }, // Namespace from WSDL targetNamespace
        'userName': remedyUsername,
        'password': remedyPassword,
      }
    };
    client.addSoapHeader(authHeader);
    console.log('SOAP auth header added to client.');
    remedyClientInstance = client;
    return client;
  } catch (error) {
    console.error("Failed to initialize SOAP client or set auth header:", error);
    remedyClientInstance = null; // Ensure instance is null on failure
    clientInitializationPromise = null; // Reset promise so next attempt tries again
    throw error; // Re-throw the error to be caught by the caller
  }
}

export async function getRemedyClient(): Promise<Client> {
  if (remedyClientInstance) {
    // console.log("Returning existing SOAP client instance.");
    return remedyClientInstance;
  }

  if (clientInitializationPromise) {
    // console.log("Waiting for existing client initialization promise.");
    return clientInitializationPromise;
  }

  // console.log("No client or promise, starting new initialization.");
  clientInitializationPromise = initializeClient();
  
  try {
    const client = await clientInitializationPromise;
    return client;
  } finally {
    // Whether it succeeded or failed, the current attempt is done.
    // If it failed, initializeClient would have set clientInitializationPromise to null.
    // If it succeeded, future calls will get remedyClientInstance.
    // This simple model doesn't explicitly clear clientInitializationPromise here on success,
    // as initializeClient assigns to remedyClientInstance which takes precedence.
  }
  return clientInitializationPromise; // Should have resolved or rejected by now
}

export async function callRemedyService(
  methodName: string,
  args: any
): Promise<[any, string,any, string] | null> { // Adjusted to return the typical full response from `soap` client
  const client = await getRemedyClient(); // Ensures client is initialized

  // The `soap` library methods are often suffixed with `Async`
  const asyncMethodName = `${methodName}Async`;

  if (typeof (client as any)[asyncMethodName] !== 'function') {
    console.error(`SOAP method ${asyncMethodName} not found on client.`);
    throw new Error(`SOAP method ${asyncMethodName} not found on client.`);
  }

  console.log(`Calling Remedy service: ${methodName} with args:`, JSON.stringify(args));
  try {
    // The `*Async` methods of the `soap` library typically return an array:
    // [result, rawResponse, soapHeader, rawRequest]
    const responseArray = await (client as any)[asyncMethodName](args);
    
    // Log a snippet of the result part for brevity
    // console.log(`Raw response from ${methodName}:`, JSON.stringify(responseArray?.[0], null, 2).substring(0, 1000) + "...");
    
    return responseArray as [any, string, any, string];
  } catch (error: any) {
    console.error(`Error calling SOAP method ${methodName}:`, error.message);
    if (error.root && error.root.Envelope && error.root.Envelope.Body && error.root.Envelope.Body.Fault) {
      console.error("SOAP Fault:", JSON.stringify(error.root.Envelope.Body.Fault, null, 2));
    } else if (error.response && error.response.body) {
       console.error("Raw SOAP error response body:", error.response.body);
    }
    throw error; // Re-throw to be handled by the calling flow
  }
}
