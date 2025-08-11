
import { NextResponse } from 'next/server';

const mockContractDetails = {
    id: 'contract:demotest:1',
    assetId: 'demotest',
    provider: 'provider',
    consumer: 'You',
    signedAt: '10/07/2025 09:45:48',
    policy: {
        type: 'SET',
        assigner: 'provider',
        assignee: 'consumer',
        rules: 'Unrestricted'
    },
    counterParty: {
        id: 'provider',
        endpoint: 'http://provider/api/dsp'
    }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const contractId = params.id;
  console.log(`Mock API: Fetching details for contract ${contractId}`);
  
  // In a real API, you would look up the contract by its ID.
  // For now, we return the same mock detail object with the requested ID.
  return NextResponse.json({ ...mockContractDetails, id: contractId });
}
