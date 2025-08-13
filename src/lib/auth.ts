import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production';

export interface JWTPayload {
  userId: string;
  email: string;
  organizationId: string;
  roleId: string;
  iat?: number;
  exp?: number;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  organizationId: string;
  roleId: string;
  status: string;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// Generate JWT access token
export function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '15m', // Short-lived access token
  });
}

// Generate JWT refresh token
export function generateRefreshToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: '7d', // Longer-lived refresh token
  });
}

// Verify JWT access token
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    console.error('Access token verification failed:', error);
    return null;
  }
}

// Verify JWT refresh token
export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
  } catch (error) {
    console.error('Refresh token verification failed:', error);
    return null;
  }
}

// Extract token from Authorization header
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

// Get user from request
export async function getUserFromRequest(request: NextRequest): Promise<AuthUser | null> {
  const authHeader = request.headers.get('authorization');
  const token = extractTokenFromHeader(authHeader);
  
  if (!token) {
    return null;
  }
  
  const payload = verifyAccessToken(token);
  if (!payload) {
    return null;
  }
  
  // In a real implementation, you might want to fetch fresh user data from database
  // For now, we'll trust the JWT payload
  return {
    id: payload.userId,
    email: payload.email,
    name: '', // We'd need to fetch this from DB
    organizationId: payload.organizationId,
    roleId: payload.roleId,
    status: 'active', // We'd need to fetch this from DB
  };
}

// Check if user has permission
export function hasPermission(user: AuthUser, permission: string, resource?: string): boolean {
  // This is a simplified permission check
  // In a real implementation, you'd fetch the user's role permissions from database
  
  // For now, let's implement basic role-based checks
  const rolePermissions: Record<string, string[]> = {
    'role_regulator': ['*'], // Full access
    'role_kkks_admin': ['read:assets', 'write:assets', 'read:offers', 'write:offers', 'approve:access_requests'],
    'role_data_custodian': ['read:assets', 'write:assets', 'upload:datasets'],
    'role_technical_analyst': ['read:assets', 'download:permitted_data', 'analyze:datasets'],
    'role_compliance_officer': ['read:logs', 'audit:activities', 'report:violations'],
    'role_integration_engineer': ['read:systems', 'configure:integrations', 'monitor:connections'],
    'role_external_partner': ['read:public_data', 'request:access'],
    'role_auditor': ['read:*', 'audit:*', 'report:findings'],
  };
  
  const userPermissions = rolePermissions[user.roleId] || [];
  
  // Check for wildcard permission
  if (userPermissions.includes('*')) {
    return true;
  }
  
  // Check for specific permission
  const fullPermission = resource ? `${permission}:${resource}` : permission;
  return userPermissions.includes(fullPermission) || userPermissions.includes(permission);
}

// Middleware function to protect routes
export function requireAuth(requiredPermission?: string, requiredResource?: string) {
  return async (request: NextRequest) => {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    if (user.status !== 'active') {
      return new Response(JSON.stringify({ error: 'Account is not active' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    if (requiredPermission && !hasPermission(user, requiredPermission, requiredResource)) {
      return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Attach user to request for use in route handlers
    (request as any).user = user;
    return null; // Continue to route handler
  };
}