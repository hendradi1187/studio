
import { authenticatedFetch } from './auth-client';

// This file will contain functions to fetch data from your backend API.
// You can replace the mock data logic in your pages with calls to these functions.

export type BrokerConnection = {
    name: string;
    status: 'Active' | 'Inactive' | 'Error';
    lastSync: string;
}

// ================== Assets API ==================
export async function getAssets() {
  try {
    const response = await authenticatedFetch('/api/assets');
    if (!response.ok) {
      console.error("Failed to fetch assets");
      return { assets: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
    }
    return response.json();
  } catch (error) {
    console.error("Failed to fetch assets:", error);
    return { assets: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
  }
}

export async function createAsset(assetData: any) {
  console.log('Creating asset:', assetData);
  const response = await authenticatedFetch('/api/assets', {
    method: 'POST',
    body: JSON.stringify(assetData),
  });
  if (!response.ok) {
      throw new Error('Failed to create asset');
  }
  return response.json();
}

export async function deleteAsset(assetId: string) {
    console.log('Deleting asset:', assetId);
    const response = await authenticatedFetch(`/api/assets/${assetId}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Failed to delete asset');
    }
    return { success: true };
}


// ================== Policies API ==================
export async function getPolicies(params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
}) {
    try {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.set('page', params.page.toString());
        if (params?.limit) searchParams.set('limit', params.limit.toString());
        if (params?.search) searchParams.set('search', params.search);
        if (params?.type) searchParams.set('type', params.type);
        if (params?.status) searchParams.set('status', params.status);
        if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
        if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);

        const url = `/api/policies${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
        const response = await authenticatedFetch(url);
        
        if (!response.ok) {
            console.error("Failed to fetch policies");
            return { policies: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
        }
        return response.json();
    } catch (error) {
        console.error("Failed to fetch policies:", error);
        return { policies: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
    }
}

export async function getPolicy(policyId: string) {
    try {
        const response = await authenticatedFetch(`/api/policies/${policyId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch policy');
        }
        return response.json();
    } catch (error) {
        console.error("Failed to fetch policy:", error);
        throw error;
    }
}

export async function createPolicy(policyData: {
    name: string;
    description?: string;
    policyType: 'access' | 'contract' | 'usage';
    policyRules?: any;
    status?: 'draft' | 'active' | 'inactive';
}) {
    console.log('Creating policy:', policyData);
    const response = await authenticatedFetch('/api/policies', {
        method: 'POST',
        body: JSON.stringify(policyData),
    });
    if (!response.ok) {
        throw new Error('Failed to create policy');
    }
    return response.json();
}

export async function updatePolicy(policyId: string, policyData: {
    name?: string;
    description?: string;
    policyType?: 'access' | 'contract' | 'usage';
    policyRules?: any;
    status?: 'draft' | 'active' | 'inactive';
}) {
    console.log('Updating policy:', policyId, policyData);
    const response = await authenticatedFetch(`/api/policies/${policyId}`, {
        method: 'PUT',
        body: JSON.stringify(policyData),
    });
    if (!response.ok) {
        throw new Error('Failed to update policy');
    }
    return response.json();
}

export async function deletePolicy(policyId: string) {
    console.log('Deleting policy:', policyId);
    const response = await authenticatedFetch(`/api/policies/${policyId}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Failed to delete policy');
    }
    return response.json();
}


// ================== Data Offers API ==================
export async function getDataOffers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
}) {
    try {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.set('page', params.page.toString());
        if (params?.limit) searchParams.set('limit', params.limit.toString());
        if (params?.search) searchParams.set('search', params.search);
        if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
        if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);

        const url = `/api/data-offers${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
        const response = await authenticatedFetch(url);
        
        if (!response.ok) {
            console.error("Failed to fetch data offers");
            return { dataOffers: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
        }
        return response.json();
    } catch (error) {
        console.error("Failed to fetch data offers:", error);
        return { dataOffers: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
    }
}

export async function getDataOffer(offerId: string) {
    try {
        const response = await authenticatedFetch(`/api/data-offers/${offerId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch data offer');
        }
        return response.json();
    } catch (error) {
        console.error("Failed to fetch data offer:", error);
        throw error;
    }
}

export async function createDataOffer(offerData: {
    assetId: string;
    accessPolicyId?: string;
    contractPolicyId?: string;
    price?: number;
    currency?: string;
    validUntil?: string;
    description?: string;
}) {
    console.log('Creating data offer:', offerData);
    const response = await authenticatedFetch('/api/data-offers', {
        method: 'POST',
        body: JSON.stringify(offerData),
    });
    if (!response.ok) {
        throw new Error('Failed to create data offer');
    }
    return response.json();
}

export async function updateDataOffer(offerId: string, offerData: {
    assetId?: string;
    accessPolicyId?: string;
    contractPolicyId?: string;
    price?: number;
    currency?: string;
    validUntil?: string;
    description?: string;
}) {
    console.log('Updating data offer:', offerId, offerData);
    const response = await authenticatedFetch(`/api/data-offers/${offerId}`, {
        method: 'PUT',
        body: JSON.stringify(offerData),
    });
    if (!response.ok) {
        throw new Error('Failed to update data offer');
    }
    return response.json();
}

export async function deleteDataOffer(offerId: string) {
    console.log('Deleting data offer:', offerId);
    const response = await authenticatedFetch(`/api/data-offers/${offerId}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Failed to delete data offer');
    }
    return response.json();
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

// ================== Vocabulary API ==================
export async function getVocabulary() {
    const response = await fetch('/api/vocabulary');
    if (!response.ok) {
        console.error("Failed to fetch vocabulary");
        return [];
    }
    return response.json();
}

export async function addVocabularyTerm(termData: { term: string, parent?: string }) {
    console.log('Adding vocabulary term:', termData);
    const response = await fetch('/api/vocabulary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(termData),
    });
    if (!response.ok) {
        throw new Error('Failed to add vocabulary term');
    }
    return response.json();
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

// ================== Contracts API ==================
export async function getContracts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
}) {
    try {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.set('page', params.page.toString());
        if (params?.limit) searchParams.set('limit', params.limit.toString());
        if (params?.search) searchParams.set('search', params.search);
        if (params?.status) searchParams.set('status', params.status);
        if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
        if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);

        const url = `/api/contracts${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
        const response = await authenticatedFetch(url);
        
        if (!response.ok) {
            console.error("Failed to fetch contracts");
            return { contracts: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
        }
        return response.json();
    } catch (error) {
        console.error("Failed to fetch contracts:", error);
        return { contracts: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
    }
}

export async function getContract(contractId: string) {
    try {
        const response = await authenticatedFetch(`/api/contracts/${contractId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch contract');
        }
        return response.json();
    } catch (error) {
        console.error("Failed to fetch contract:", error);
        throw error;
    }
}

export async function createContract(contractData: {
    dataOfferId: string;
    consumerId: string;
    contractTerms?: any;
    signedAt?: string;
}) {
    console.log('Creating contract:', contractData);
    const response = await authenticatedFetch('/api/contracts', {
        method: 'POST',
        body: JSON.stringify(contractData),
    });
    if (!response.ok) {
        throw new Error('Failed to create contract');
    }
    return response.json();
}

export async function updateContract(contractId: string, contractData: {
    contractTerms?: any;
    status?: 'draft' | 'pending' | 'active' | 'terminated' | 'expired';
    terminatedAt?: string;
}) {
    console.log('Updating contract:', contractId, contractData);
    const response = await authenticatedFetch(`/api/contracts/${contractId}`, {
        method: 'PUT',
        body: JSON.stringify(contractData),
    });
    if (!response.ok) {
        throw new Error('Failed to update contract');
    }
    return response.json();
}

export async function deleteContract(contractId: string) {
    console.log('Deleting contract:', contractId);
    const response = await authenticatedFetch(`/api/contracts/${contractId}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Failed to delete contract');
    }
    return response.json();
}

// Legacy function for backward compatibility
export async function getContractDetails(id: string) {
    return getContract(id);
}

// ================== Transfers API ==================
export async function getTransfers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    contractId?: string;
    sortBy?: string;
    sortOrder?: string;
}) {
    try {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.set('page', params.page.toString());
        if (params?.limit) searchParams.set('limit', params.limit.toString());
        if (params?.search) searchParams.set('search', params.search);
        if (params?.status) searchParams.set('status', params.status);
        if (params?.contractId) searchParams.set('contractId', params.contractId);
        if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
        if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);

        const url = `/api/transfers${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
        const response = await authenticatedFetch(url);
        
        if (!response.ok) {
            console.error("Failed to fetch transfers");
            return { transfers: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
        }
        return response.json();
    } catch (error) {
        console.error("Failed to fetch transfers:", error);
        return { transfers: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
    }
}

export async function getTransfer(transferId: string) {
    try {
        const response = await authenticatedFetch(`/api/transfers/${transferId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch transfer');
        }
        return response.json();
    } catch (error) {
        console.error("Failed to fetch transfer:", error);
        throw error;
    }
}

export async function createTransfer(transferData: {
    contractId: string;
    transferType?: 'download' | 'stream' | 'api_access';
    filePath?: string;
    fileSize?: number;
    metadata?: any;
}) {
    console.log('Creating transfer:', transferData);
    const response = await authenticatedFetch('/api/transfers', {
        method: 'POST',
        body: JSON.stringify(transferData),
    });
    if (!response.ok) {
        throw new Error('Failed to create transfer');
    }
    return response.json();
}

export async function updateTransfer(transferId: string, transferData: {
    transferState?: 'initiated' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
    bytesTransferred?: number;
    errorMessage?: string;
    metadata?: any;
}) {
    console.log('Updating transfer:', transferId, transferData);
    const response = await authenticatedFetch(`/api/transfers/${transferId}`, {
        method: 'PUT',
        body: JSON.stringify(transferData),
    });
    if (!response.ok) {
        throw new Error('Failed to update transfer');
    }
    return response.json();
}

export async function deleteTransfer(transferId: string) {
    console.log('Deleting transfer:', transferId);
    const response = await authenticatedFetch(`/api/transfers/${transferId}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Failed to delete transfer');
    }
    return response.json();
}

// Legacy function for backward compatibility
export async function getTransferHistory() {
    const response = await getTransfers();
    return response.transfers || [];
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
