
import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const assetId = params.id;
  console.log(`Mock API: Deleting asset ${assetId}`);
  // In a real API, you would delete the asset from the database.
  return NextResponse.json({ success: true, message: `Asset ${assetId} deleted` });
}
