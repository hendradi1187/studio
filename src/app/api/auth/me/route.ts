import { NextRequest } from 'next/server';
import { query } from '@/lib/database';
import { getUserFromRequest } from '@/lib/auth';
import { asyncHandler, errorResponse, successResponse, AuthenticationError } from '@/lib/errors';

async function getMeHandler(request: NextRequest) {
  const user = await getUserFromRequest(request);
  
  if (!user) {
    throw new AuthenticationError();
  }
  
  // Get full user details from database
  const userResult = await query(
    `SELECT u.id, u.email, u.name, u.organization_id, u.role_id, u.status, u.last_login, u.profile_photo,
            o.name as organization_name, o.type as organization_type,
            r.name as role_name, r.permissions
     FROM users u
     LEFT JOIN organizations o ON u.organization_id = o.id
     LEFT JOIN user_roles r ON u.role_id = r.id
     WHERE u.id = $1`,
    [user.id]
  );
  
  if (userResult.rows.length === 0) {
    throw new AuthenticationError('User not found');
  }
  
  const userData = userResult.rows[0];
  
  return successResponse({
    user: {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      status: userData.status,
      lastLogin: userData.last_login,
      profilePhoto: userData.profile_photo,
      organization: {
        id: userData.organization_id,
        name: userData.organization_name,
        type: userData.organization_type,
      },
      role: {
        id: userData.role_id,
        name: userData.role_name,
        permissions: userData.permissions,
      },
    }
  });
}

export const GET = asyncHandler(getMeHandler);