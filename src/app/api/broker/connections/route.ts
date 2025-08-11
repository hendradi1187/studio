
import { NextResponse } from 'next/server';
import { mockState } from '@/lib/mock-data';

export async function GET() {
  return NextResponse.json(mockState.brokerConnections);
}

export async function POST(request: Request) {
  const body = await request.json();
  console.log("Mock API: Registering new connector with data:", body);
  const newConnection = {
    ...body,
    status: 'Active',
    lastSync: new Date().toISOString(),
  };
  // In a real API, you'd save this and initiate a connection test.
  // For now, we don't add it to the mock array to keep the state predictable.
  return NextResponse.json(newConnection, { status: 201 });
}
