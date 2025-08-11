
import { NextResponse } from 'next/server';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const userId = params.id;
  const body = await request.json();
  console.log(`Mock API: Updating user ${userId} with data:`, body);
  // In a real API, you would update the user in the database.
  return NextResponse.json({ ...body, id: userId });
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const userId = params.id;
  console.log(`Mock API: Deleting user ${userId}`);
  // In a real API, you would delete the user from the database.
  return NextResponse.json({ success: true, message: `User ${userId} deleted` });
}
