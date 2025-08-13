// Client-side authentication utilities

export interface User {
  id: string;
  email: string;
  name: string;
  organization: {
    id: string;
    name: string;
    type?: string;
  };
  role: {
    id: string;
    name: string;
    permissions?: any;
  };
  status: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// Storage keys
const ACCESS_TOKEN_KEY = 'spektra_access_token';
const REFRESH_TOKEN_KEY = 'spektra_refresh_token';
const USER_KEY = 'spektra_user';

// Get tokens from localStorage
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
}

// Store tokens and user info
export function setAuthData(authResponse: AuthResponse): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(ACCESS_TOKEN_KEY, authResponse.tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, authResponse.tokens.refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(authResponse.user));
}

// Clear auth data
export function clearAuthData(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

// Get auth headers for API calls
export function getAuthHeaders(): Record<string, string> {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Sign in function
export async function signIn(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch('/api/auth/sign-in', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }
  
  const authResponse: AuthResponse = await response.json();
  setAuthData(authResponse);
  return authResponse;
}

// Sign out function
export async function signOut(): Promise<void> {
  clearAuthData();
  // Optionally call backend logout endpoint
  // await fetch('/api/auth/logout', { method: 'POST' });
}

// Refresh token function
export async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    
    if (!response.ok) return false;
    
    const { tokens } = await response.json();
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    return true;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
}

// Authenticated fetch wrapper
export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...options.headers,
  };
  
  let response = await fetch(url, {
    ...options,
    headers,
  });
  
  // If unauthorized, try to refresh token
  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      // Retry the request with new token
      const newHeaders = {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
        ...options.headers,
      };
      
      response = await fetch(url, {
        ...options,
        headers: newHeaders,
      });
    } else {
      // Refresh failed, redirect to login
      clearAuthData();
      window.location.href = '/sign-in';
      throw new Error('Authentication required');
    }
  }
  
  return response;
}