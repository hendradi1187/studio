
import { NextResponse } from 'next/server';

const mockPolicies = [
    { id: 'unrestricted-policy', permissions: 1, prohibitions: 0, obligations: 0 },
    { id: 'standard-contract', permissions: 5, prohibitions: 2, obligations: 3 },
    { id: 'trusted-partner-policy', permissions: 2, prohibitions: 0, obligations: 1 },
];

export async function GET() {
  return NextResponse.json(mockPolicies);
}

export async function POST(request: Request) {
    const body = await request.json();
    console.log("Mock API: Creating new policy with data:", body);
    const newPolicy = {
        id: body.id || `pol-${Math.random().toString(36).substr(2, 9)}`,
        permissions: 0,
        prohibitions: 0,
        obligations: 0,
        ...body
    };
    return NextResponse.json(newPolicy, { status: 201 });
}
