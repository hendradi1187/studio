
import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const policyId = params.id;
  console.log(`Mock API: Deleting policy ${policyId}`);
  // In a real API, you would delete the policy from the database.
  return NextResponse.json({ success: true, message: `Policy ${policyId} deleted` });
}
