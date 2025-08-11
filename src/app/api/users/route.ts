
import { NextResponse } from 'next/server';
import { users as mockUsers } from '@/lib/mock-data';

export async function GET() {
  return NextResponse.json(mockUsers);
}

export async function POST(request: Request) {
    const body = await request.json();
    console.log("Mock API: Creating new user with data:", body);
    const newUser = {
        id: `usr-${Math.random().toString(36).substr(2, 9)}`,
        lastActive: 'Just now',
        ...body
    };
    // In a real API, you'd save this to a database. We don't add it to the mock array
    // to keep the initial state predictable across re-renders.
    return NextResponse.json(newUser, { status: 201 });
}
