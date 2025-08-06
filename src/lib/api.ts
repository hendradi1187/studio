// This file will contain functions to fetch data from your backend API.
// You can replace the mock data logic in your pages with calls to these functions.

// Example structure for fetching assets
export async function getAssets() {
  // In a real scenario, you would fetch this from your backend:
  // const response = await fetch('/api/assets');
  // const data = await response.json();
  // return data;
  
  // For now, we return mock data.
  return []; 
}

export async function createAsset(assetData: any) {
  console.log('Creating asset:', assetData);
  // const response = await fetch('/api/assets', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(assetData),
  // });
  // return response.json();
  return { id: 'new-asset', ...assetData };
}

// Example for Policies
export async function getPolicies() {
  return [];
}

export async function createPolicy(policyData: any) {
    console.log('Creating policy:', policyData);
    return { id: 'new-policy', ...policyData };
}

// Example for Data Offers
export async function getDataOffers() {
    return [
        {
            id: 'my-data-offer',
            assetId: 'urn:artifact:my-asset:1.0',
            accessPolicy: 'my-policy-1',
            contractPolicy: 'my-policy-1',
        }
    ];
}

export async function createDataOffer(offerData: any) {
    console.log('Creating data offer:', offerData);
    return { id: 'new-offer', ...offerData };
}

// Example for Catalog
export async function fetchCatalog(connectorEndpoint: string) {
    console.log('Fetching catalog for:', connectorEndpoint);
    if (!connectorEndpoint) return [];
    return [
      {
        id: 'demotest',
        name: 'DemoTest',
        description: 'Demo Description',
        version: '1.0',
        license: 'https://creativecommons.org/licenses/by/4.0/',
        policy: 'unrestricted',
        provider: 'provider',
      },
    ];
}

// Example for Contracts
export async function getContracts() {
     return [
        {
            id: '0197f34c-3b31-7622-b6b4-4b303d162489',
            assetId: 'demotest',
            provider: 'provider',
            consumer: 'You',
            signedAt: 'Signed 1 minute ago',
            terminatedAt: 'Ongoing',
            transfers: 0,
        },
    ];
}

export async function getContractDetails(id: string) {
    console.log('Fetching contract details for:', id);
    // This would fetch specific contract details
    return {
        id,
        assetId: 'demotest',
        counterPartyId: 'provider',
        counterPartyEndpoint: 'http://provider/api/dsp',
        signedAt: '10/07/2025 09:45:48',
        direction: 'CONSUMING',
        policy: 'Unrestricted',
        violations: [
            "$: Policy has an assigner, which is currently unsupported.",
            "$: Policy has an assignee, which is currently unsupported.",
            "$: Policy does not have type SET, but CONTRACT, which is currently unsupported.",
        ]
    }
}

// Example for Transfer History
export async function getTransferHistory() {
     return [
        {
            id: '0197f356-3cce-722f-b83b-0c83a3099b2e',
            contractId: 'demotest',
            provider: 'provider',
            consumer: 'You',
            state: 'STARTED',
            lastUpdated: '19 seconds ago',
        },
        {
            id: '0197f353-a21a-7eef-bd77-a82ceea2b74c',
            contractId: 'demotest',
            provider: 'provider',
            consumer: 'You',
            state: 'STARTED',
            lastUpdated: '3 minutes ago',
        }
    ];
}
