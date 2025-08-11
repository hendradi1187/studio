
import { NextResponse } from 'next/server';

const mockCatalog = [
    {
        id: 'demotest',
        name: 'DemoTest',
        description: 'Test Asset for the demonstration of the dataspace connector.',
        version: '1.0.0',
        license: 'https://www.apache.org/licenses/LICENSE-2.0',
        policy: 'Unrestricted',
        provider: 'provider',
    }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');

  if (!endpoint) {
    return NextResponse.json({ message: "Endpoint parameter is required" }, { status: 400 });
  }

  console.log(`Mock API: Fetching catalog for endpoint: ${endpoint}`);

  // In a real scenario, you'd use the endpoint to fetch data.
  // Here, we just return the same mock catalog regardless of the endpoint.
  return NextResponse.json(mockCatalog);
}
