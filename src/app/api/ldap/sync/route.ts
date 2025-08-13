import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { syncUsersFromLDAP } from '@/lib/ldap';
import { asyncHandler, AuthenticationError, ValidationError, successResponse } from '@/lib/errors';
import { z } from 'zod';

// Validation schema for LDAP sync
const ldapSyncSchema = z.object({
  configId: z.string().min(1, 'Configuration ID is required')
});

// POST /api/ldap/sync - Sync users from LDAP
async function syncLDAPUsersHandler(request: NextRequest) {
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
  const validationResult = ldapSyncSchema.safeParse(body);
  if (!validationResult.success) {
    throw new ValidationError('Invalid sync request', validationResult.error.errors);
  }

  const { configId } = validationResult.data;

  try {
    const result = await syncUsersFromLDAP(configId);
    
    return successResponse({
      message: `User sync completed. ${result.success} users processed.`,
      success: result.success,
      errors: result.errors
    });
  } catch (error) {
    return successResponse({
      message: `LDAP sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      success: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    });
  }
}

export const POST = asyncHandler(syncLDAPUsersHandler);