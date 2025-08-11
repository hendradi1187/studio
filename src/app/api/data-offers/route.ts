
import { NextResponse } from 'next/server';

const mockDataOffers = [
    {
        id: 'seismic-data-q1',
        assetId: 'urn:artifact:seismic-block-a:1.2',
        accessPolicy: 'unrestricted-policy',
        contractPolicy: 'standard-contract'
    },
    {
        id: 'well-log-offer-2024',
        assetId: 'urn:artifact:well-x7:3.0',
        accessPolicy: 'trusted-partner-policy',
        contractPolicy: 'ndc-contract-v2'
    }
];

export async function GET() {
  return NextResponse.json(mockDataOffers);
}

export async function POST(request: Request) {
    const body = await request.json();
    console.log("Mock API: Creating new data offer with data:", body);
    const newOffer = {
        id: `offer-${Math.random().toString(36).substr(2, 9)}`,
        ...body
    };
    return NextResponse.json(newOffer, { status: 201 });
}
