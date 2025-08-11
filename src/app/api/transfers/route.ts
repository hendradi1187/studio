
import { NextResponse } from 'next/server';

const mockTransfers = [
    {
        id: 't-process-123',
        contractId: 'contract:demotest:1',
        provider: 'provider',
        consumer: 'You',
        state: 'COMPLETED',
        lastUpdated: '2024-07-11 14:30:00'
    },
     {
        id: 't-process-456',
        contractId: 'contract:seismic-q1:5',
        provider: 'alpha-oil',
        consumer: 'You',
        state: 'IN_PROGRESS',
        lastUpdated: '2024-07-12 09:05:00'
    }
];

export async function GET() {
  return NextResponse.json(mockTransfers);
}
