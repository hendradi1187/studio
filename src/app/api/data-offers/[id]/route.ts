
import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const offerId = params.id;
  console.log(`Mock API: Deleting data offer ${offerId}`);
  return NextResponse.json({ success: true, message: `Data offer ${offerId} deleted` });
}
