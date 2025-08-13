import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { saveLDAPConfig, getLDAPConfigs, LDAPConfig } from '@/lib/ldap';
import { asyncHandler, AuthenticationError, ValidationError, successResponse } from '@/lib/errors';
import { z } from 'zod';

// Validation schema for LDAP configuration
const ldapConfigSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  serverUrl: z.string().url('Invalid server URL'),
  bindDn: z.string().min(1, 'Bind DN is required'),
  bindPassword: z.string().min(1, 'Bind password is required'),
  baseDn: z.string().min(1, 'Base DN is required'),
  userSearchFilter: z.string().optional(),
  emailAttribute: z.string().optional(),
  nameAttribute: z.string().optional(),
  enabled: z.boolean().optional(),
  sslEnabled: z.boolean().optional(),
  port: z.number().int().min(1).max(65535).optional(),
  timeout: z.number().int().min(1000).max(30000).optional()
});

// GET /api/ldap/config - Get all LDAP configurations
async function getLDAPConfigsHandler(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    throw new AuthenticationError();
  }

  // Check if user has admin permissions
  if (!user.permissions?.includes('admin')) {
    throw new AuthenticationError('Admin access required');
  }

  const configs = await getLDAPConfigs();
  return successResponse({ configs });
}

// POST /api/ldap/config - Create new LDAP configuration
async function createLDAPConfigHandler(request: NextRequest) {
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
  const validationResult = ldapConfigSchema.safeParse(body);
  if (!validationResult.success) {
    throw new ValidationError('Invalid LDAP configuration', validationResult.error.errors);
  }

  const config: LDAPConfig = validationResult.data;
  const configId = await saveLDAPConfig(config, user.id);

  return successResponse({
    message: 'LDAP configuration saved successfully',
    configId
  });
}

export const GET = asyncHandler(getLDAPConfigsHandler);
export const POST = asyncHandler(createLDAPConfigHandler);