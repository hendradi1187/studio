import { NextRequest } from 'next/server';
import { query } from '@/lib/database';
import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from '@/lib/auth';
import { asyncHandler, errorResponse, successResponse, AuthenticationError } from '@/lib/errors';

async function refreshHandler(request: NextRequest) {
  const body = await request.json();
  
  if (!body.refreshToken) {
    throw new AuthenticationError('Refresh token is required');
  }
  
  // Verify refresh token
  const payload = verifyRefreshToken(body.refreshToken);
  if (!payload) {
    throw new AuthenticationError('Invalid refresh token');
  }
  
  // Check if user still exists and is active
  const userResult = await query(
    'SELECT id, email, organization_id, role_id, status FROM users WHERE id = $1',
    [payload.userId]
  );
  
  if (userResult.rows.length === 0) {
    throw new AuthenticationError('User not found');
  }
  
  const user = userResult.rows[0];
  
  if (user.status !== 'active') {
    throw new AuthenticationError('Account is not active');
  }
  
  // Generate new tokens
  const tokenPayload = {
    userId: user.id,
    email: user.email,
    organizationId: user.organization_id,
    roleId: user.role_id,
  };
  
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);
  
  return successResponse({
    tokens: {
      accessToken,
      refreshToken,
    },
  });
}

export const POST = asyncHandler(refreshHandler);