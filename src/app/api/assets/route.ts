
import { NextResponse } from 'next/server';
import { datasets } from '@/lib/mock-data'; // Assuming datasets are your assets

const mockAssets = datasets.map(d => ({
    id: d.id,
    asset: d.title,
    description: d.abstract,
}));

export async function GET() {
  return NextResponse.json(mockAssets);
}

export async function POST(request: Request) {
    const body = await request.json();
    console.log("Mock API: Creating new asset with data:", body);
    const newAsset = {
        id: `ast-${Math.random().toString(36).substr(2, 9)}`,
        ...body
    };
    // In a real API, you'd save this to a database.
    return NextResponse.json(newAsset, { status: 201 });
}
