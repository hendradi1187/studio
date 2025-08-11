
import { NextResponse } from 'next/server';
import { mockState } from '@/lib/mock-data';

export async function POST(
  request: Request,
  { params }: { params: { connectorName: string } }
) {
  const connectorName = params.connectorName;
  console.log(`Mock API: Syncing connector ${connectorName}`);
  
  const connection = mockState.brokerConnections.find(c => c.name === connectorName);

  if (!connection) {
    return NextResponse.json({ message: 'Connector not found' }, { status: 404 });
  }

  // Simulate a successful sync
  const updatedConnection = {
      ...connection,
      status: 'Active',
      lastSync: new Date().toLocaleString('en-US'),
  };

  return NextResponse.json(updatedConnection);
}
