
import { NextResponse } from 'next/server';
import { vocabulary } from '@/lib/mock-data';

export async function GET() {
  // In a real API, you would fetch this from a database.
  return NextResponse.json(vocabulary);
}

export async function POST(request: Request) {
    const body = await request.json();
    console.log("Mock API: Creating new vocabulary term with data:", body);
    
    // In a real API, you'd save this to a database.
    // For this mock, we'll just log it and return a success response.
    const newTerm = {
        id: `vocab-${Math.random().toString(36).substr(2, 9)}`,
        ...body
    };
    
    return NextResponse.json(newTerm, { status: 201 });
}
