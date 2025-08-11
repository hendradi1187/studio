
import { NextResponse } from 'next/server';

const mockContracts = [
    {
        id: 'contract:demotest:1',
        assetId: 'demotest',
        provider: 'provider',
        consumer: 'You',
        signedAt: '10/07/2025 09:45:48',
        terminatedAt: '-',
        transfers: 0
    }
];

export async function GET() {
  return NextResponse.json(mockContracts);
}
