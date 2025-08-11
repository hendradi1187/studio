

// This file will contain functions to fetch data from your backend API.
// You can replace the mock data logic in your pages with calls to these functions.

export type BrokerConnection = {
    name: string;
    status: 'Active' | 'Inactive' | 'Error';
    lastSync: string;
}

// ================== Assets API ==================
export async function getAssets() {
  const response = await fetch('/api/assets');
  if (!response.ok) {
    console.error("Failed to fetch assets");
    return [];
  }
  return response.json();
}

export async function createAsset(assetData: any) {
  console.log('Creating asset:', assetData);
  const response = await fetch('/api/assets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(assetData),
  });
  if (!response.ok) {
      throw new Error('Failed to create asset');
  }
  return response.json();
}

export async function deleteAsset(assetId: string) {
    console.log('Deleting asset:', assetId);
    const response = await fetch(`/api/assets/${assetId}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Failed to delete asset');
    }
    return { success: true };
}


// ================== Policies API ==================
export async function getPolicies() {
    const response = await fetch('/api/policies');
    if (!response.ok) {
        console.error("Failed to fetch policies");
        return [];
    }
    return response.json();
}

export async function createPolicy(policyData: any) {
    console.log('Creating policy:', policyData);
    const response = await fetch('/api/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(policyData),
    });
    if (!response.ok) {
        throw new Error('Failed to create policy');
    }
    return response.json();
}

export async function deletePolicy(policyId: string) {
    console.log('Deleting policy:', policyId);
    const response = await fetch(`/api/policies/${policyId}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Failed to delete policy');
    }
    return { success: true };
}


// ================== Data Offers API ==================
export async function getDataOffers() {
    const response = await fetch('/api/data-offers');
    if (!response.ok) {
        console.error("Failed to fetch data offers");
        return [];
    }
    return response.json();
}

export async function createDataOffer(offerData: any) {
    console.log('Creating data offer:', offerData);
    const response = await fetch('/api/data-offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offerData),
    });
    if (!response.ok) {
        throw new Error('Failed to create data offer');
    }
    return response.json();
}

export async function deleteDataOffer(offerId: string) {
    console.log('Deleting data offer:', offerId);
    const response = await fetch(`/api/data-offers/${offerId}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Failed to delete data offer');
    }
    return { success: true };
}


// ================== Users API ==================
export async function getUsers() {
    const response = await fetch('/api/users');
    if (!response.ok) {
        console.error("Failed to fetch users");
        return [];
    }
    return response.json();
}

export async function saveUser(userData: any) {
    const isEditing = !!userData.id;
    const url = isEditing ? `/api/users/${userData.id}` : '/api/users';
    const method = isEditing ? 'PUT' : 'POST';

    console.log(`${isEditing ? 'Updating' : 'Creating'} user:`, userData);
    const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
    });
    if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} user`);
    }
    return response.json();
}

export async function deleteUser(userId: string) {
    console.log('Deleting user:', userId);
    const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Failed to delete user');
    }
    return { success: true };
}


// ================== Other APIs (placeholders) ==================

export async function fetchCatalog(connectorEndpoint: string) {
    console.log('Fetching catalog for:', connectorEndpoint);
    if (!connectorEndpoint) return [];
    
    const response = await fetch(`/api/catalog?endpoint=${encodeURIComponent(connectorEndpoint)}`);
    if (!response.ok) {
        console.error("Failed to fetch catalog");
        return [];
    }
    return response.json();
}

export async function getContracts() {
    const response = await fetch('/api/contracts');
    if (!response.ok) {
        console.error("Failed to fetch contracts");
        return [];
    }
    return response.json();
}

export async function getContractDetails(id: string) {
    console.log('Fetching contract details for:', id);
    const response = await fetch(`/api/contracts/${id}`);
    if (!response.ok) {
        throw new Error('Failed to get contract details');
    }
    return response.json();
}

export async function getTransferHistory() {
    const response = await fetch('/api/transfers');
    if (!response.ok) {
        console.error("Failed to fetch transfer history");
        return [];
    }
    return response.json();
}

// Broker / Connector Management
export async function getBrokerConnections() {
    const response = await fetch('/api/broker/connections');
    if (!response.ok) {
        console.error("Failed to fetch broker connections");
        return [];
    }
    return response.json();
}

export async function registerConnector(connectorData: { name: string, endpoint: string }) {
    console.log('Attempting to register connector with backend:', connectorData);
    const response = await fetch('/api/broker/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(connectorData),
    });
    if (!response.ok) {
        throw new Error('Failed to register connector');
    }
    return response.json();
}

export async function syncConnector(connectorName: string) {
    console.log(`Triggering sync for ${connectorName} via backend...`);
    const response = await fetch(`/api/broker/sync/${connectorName}`, {
        method: 'POST'
    });
    if (!response.ok) {
        throw new Error('Failed to sync connector');
    }
    return response.json();
}
