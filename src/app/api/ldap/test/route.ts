import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { testLDAPConnection, LDAPConfig } from '@/lib/ldap';
import { asyncHandler, AuthenticationError, ValidationError, successResponse } from '@/lib/errors';
import { z } from 'zod';

// Validation schema for LDAP test
const ldapTestSchema = z.object({
  serverUrl: z.string().url('Invalid server URL'),
  bindDn: z.string().min(1, 'Bind DN is required'),
  bindPassword: z.string().min(1, 'Bind password is required'),
  baseDn: z.string().min(1, 'Base DN is required'),
  port: z.number().int().min(1).max(65535).optional(),
  sslEnabled: z.boolean().optional(),
  timeout: z.number().int().min(1000).max(30000).optional()
});

// POST /api/ldap/test - Test LDAP connection
async function testLDAPHandler(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    throw new AuthenticationError();
  }

  // Check if user has admin permissions
  if (!user.permissions?.includes('admin')) {
    throw new AuthenticationError('Admin access required');
  }

  const body = await request.json();
  
  // Validate input
  const validationResult = ldapTestSchema.safeParse(body);
  if (!validationResult.success) {
    throw new ValidationError('Invalid LDAP configuration', validationResult.error.errors);
  }

  const config: LDAPConfig = {
    name: 'Test Configuration',
    ...validationResult.data
  };

  try {
    const isConnected = await testLDAPConnection(config);
    
    return successResponse({
      success: isConnected,
      message: isConnected ? 'LDAP connection successful' : 'LDAP connection failed'
    });
  } catch (error) {
    return successResponse({
      success: false,
      message: `LDAP connection error: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
}

export const POST = asyncHandler(testLDAPHandler);