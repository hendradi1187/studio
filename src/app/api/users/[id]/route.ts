
import { NextRequest } from 'next/server';
import { query } from '@/lib/database';
import { getUserFromRequest, hasPermission } from '@/lib/auth';
import { validateBody, updateUserSchema } from '@/lib/validation';
import {
  asyncHandler,
  successResponse,
  noContentResponse,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  NotFoundError
} from '@/lib/errors';

// GET /api/users/[id] - Get user by ID
async function getUserHandler(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getUserFromRequest(request);
  if (!user) {
    throw new AuthenticationError();
  }
  
  const targetUserId = params.id;
  
  // Users can view their own profile, or if they have permission to read users
  if (user.id !== targetUserId && !hasPermission(user, 'read', 'users')) {
    throw new AuthorizationError('Insufficient permissions to view this user');
  }
  
  const result = await query(
    `SELECT u.id, u.email, u.name, u.organization_id, u.role_id, u.status, u.last_login, u.created_at,
            o.name as organization_name, o.type as organization_type,
            r.name as role_name, r.permissions
     FROM users u
     LEFT JOIN organizations o ON u.organization_id = o.id
     LEFT JOIN user_roles r ON u.role_id = r.id
     WHERE u.id = $1`,
    [targetUserId]
  );
  
  if (result.rows.length === 0) {
    throw new NotFoundError('User not found');
  }
  
  const userData = result.rows[0];
  
  // For non-admin users, restrict to their organization
  if (!hasPermission(user, '*') && userData.organization_id !== user.organizationId) {
    throw new AuthorizationError('Access denied');
  }
  
  return successResponse({
    id: userData.id,
    email: userData.email,
    name: userData.name,
    status: userData.status,
    lastLogin: userData.last_login,
    createdAt: userData.created_at,
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
  });
}

// PUT /api/users/[id] - Update user
async function updateUserHandler(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getUserFromRequest(request);
  if (!user) {
    throw new AuthenticationError();
  }
  
  const targetUserId = params.id;
  
  // Users can update their own profile (limited fields), or if they have permission
  const canUpdateAnyUser = hasPermission(user, 'write', 'users');
  const canUpdateSelf = user.id === targetUserId;
  
  if (!canUpdateAnyUser && !canUpdateSelf) {
    throw new AuthorizationError('Insufficient permissions to update this user');
  }
  
  // Check if target user exists
  const existingUser = await query(
    'SELECT id, organization_id FROM users WHERE id = $1',
    [targetUserId]
  );
  
  if (existingUser.rows.length === 0) {
    throw new NotFoundError('User not found');
  }
  
  // For non-admin users, restrict to their organization
  if (!hasPermission(user, '*') && existingUser.rows[0].organization_id !== user.organizationId) {
    throw new AuthorizationError('Access denied');
  }
  
  const body = await request.json();
  const validation = validateBody(updateUserSchema, body);
  if (!validation.success) {
    throw new ValidationError('Invalid input', validation.errors);
  }
  
  const updates = validation.data;
  
  // Self-update restrictions: users can only update name and email
  if (canUpdateSelf && !canUpdateAnyUser) {
    const allowedFields = ['name', 'email'];
    const requestedFields = Object.keys(updates);
    const unauthorizedFields = requestedFields.filter(field => !allowedFields.includes(field));
    
    if (unauthorizedFields.length > 0) {
      throw new AuthorizationError(`Cannot update fields: ${unauthorizedFields.join(', ')}`);
    }
  }
  
  // Build dynamic update query
  const updateFields = [];
  const updateValues = [];
  let paramIndex = 1;
  
  if (updates.email) {
    // Check if new email already exists (for other users)
    const emailCheck = await query(
      'SELECT id FROM users WHERE email = $1 AND id != $2',
      [updates.email, targetUserId]
    );
    
    if (emailCheck.rows.length > 0) {
      throw new ValidationError('Email already exists');
    }
    
    updateFields.push(`email = $${paramIndex++}`);
    updateValues.push(updates.email);
  }
  
  if (updates.name) {
    updateFields.push(`name = $${paramIndex++}`);
    updateValues.push(updates.name);
  }
  
  if (updates.organizationId && canUpdateAnyUser) {
    // Verify organization exists
    const orgCheck = await query(
      'SELECT id FROM organizations WHERE id = $1',
      [updates.organizationId]
    );
    
    if (orgCheck.rows.length === 0) {
      throw new ValidationError('Organization not found');
    }
    
    updateFields.push(`organization_id = $${paramIndex++}`);
    updateValues.push(updates.organizationId);
  }
  
  if (updates.roleId && canUpdateAnyUser) {
    // Verify role exists
    const roleCheck = await query(
      'SELECT id FROM user_roles WHERE id = $1',
      [updates.roleId]
    );
    
    if (roleCheck.rows.length === 0) {
      throw new ValidationError('Role not found');
    }
    
    updateFields.push(`role_id = $${paramIndex++}`);
    updateValues.push(updates.roleId);
  }
  
  if (updates.status && canUpdateAnyUser) {
    updateFields.push(`status = $${paramIndex++}`);
    updateValues.push(updates.status);
  }
  
  if (updateFields.length === 0) {
    throw new ValidationError('No valid fields to update');
  }
  
  // Add updated_at
  updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
  updateValues.push(targetUserId);
  
  // Execute update
  const result = await query(
    `UPDATE users SET ${updateFields.join(', ')}
     WHERE id = $${paramIndex}
     RETURNING id, email, name, organization_id, role_id, status, updated_at`,
    updateValues
  );
  
  const updatedUser = result.rows[0];
  
  // Log user update
  await query(
    `INSERT INTO transaction_logs (user_id, organization_id, action_type, target_type, target_id, status, ip_address)
     VALUES ($1, $2, 'update', 'user', $3, 'success', $4)`,
    [
      user.id,
      user.organizationId,
      targetUserId,
      request.headers.get('x-forwarded-for') || 'unknown'
    ]
  );
  
  return successResponse({
    id: updatedUser.id,
    email: updatedUser.email,
    name: updatedUser.name,
    status: updatedUser.status,
    organizationId: updatedUser.organization_id,
    roleId: updatedUser.role_id,
    updatedAt: updatedUser.updated_at,
  });
}

// DELETE /api/users/[id] - Delete user
async function deleteUserHandler(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getUserFromRequest(request);
  if (!user) {
    throw new AuthenticationError();
  }
  
  if (!hasPermission(user, 'delete', 'users')) {
    throw new AuthorizationError('Insufficient permissions to delete users');
  }
  
  const targetUserId = params.id;
  
  // Prevent self-deletion
  if (user.id === targetUserId) {
    throw new ValidationError('Cannot delete your own account');
  }
  
  // Check if user exists
  const existingUser = await query(
    'SELECT id, organization_id FROM users WHERE id = $1',
    [targetUserId]
  );
  
  if (existingUser.rows.length === 0) {
    throw new NotFoundError('User not found');
  }
  
  // For non-admin users, restrict to their organization
  if (!hasPermission(user, '*') && existingUser.rows[0].organization_id !== user.organizationId) {
    throw new AuthorizationError('Access denied');
  }
  
  // Soft delete: update status to 'inactive' instead of hard delete
  await query(
    'UPDATE users SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
    ['inactive', targetUserId]
  );
  
  // Log user deletion
  await query(
    `INSERT INTO transaction_logs (user_id, organization_id, action_type, target_type, target_id, status, ip_address)
     VALUES ($1, $2, 'delete', 'user', $3, 'success', $4)`,
    [
      user.id,
      user.organizationId,
      targetUserId,
      request.headers.get('x-forwarded-for') || 'unknown'
    ]
  );
  
  return noContentResponse();
}

export const GET = asyncHandler(getUserHandler);
export const PUT = asyncHandler(updateUserHandler);
export const DELETE = asyncHandler(deleteUserHandler);
