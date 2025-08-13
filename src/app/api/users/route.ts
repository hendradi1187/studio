
import { NextRequest } from 'next/server';
import { query } from '@/lib/database';
import { getUserFromRequest, hashPassword, hasPermission } from '@/lib/auth';
import { validateBody, validateQuery, createUserSchema, paginationSchema } from '@/lib/validation';
import {
  asyncHandler,
  errorResponse,
  successResponse,
  createdResponse,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  ConflictError
} from '@/lib/errors';

// GET /api/users - Get all users with pagination and filtering
async function getUsersHandler(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    throw new AuthenticationError();
  }
  
  if (!hasPermission(user, 'read', 'users')) {
    throw new AuthorizationError('Insufficient permissions to view users');
  }
  
  const url = new URL(request.url);
  const queryValidation = validateQuery(paginationSchema, url.searchParams);
  if (!queryValidation.success) {
    throw new ValidationError('Invalid query parameters', queryValidation.errors);
  }
  
  const { page, limit, search, sortBy = 'created_at', sortOrder } = queryValidation.data;
  const offset = (page - 1) * limit;
  
  // Build WHERE clause for search
  let whereClause = 'WHERE 1=1';
  const queryParams: any[] = [];
  
  if (search) {
    whereClause += ` AND (u.name ILIKE $${queryParams.length + 1} OR u.email ILIKE $${queryParams.length + 1} OR o.name ILIKE $${queryParams.length + 1})`;
    queryParams.push(`%${search}%`);
  }
  
  // For non-admin users, restrict to their organization
  if (!hasPermission(user, '*')) {
    whereClause += ` AND u.organization_id = $${queryParams.length + 1}`;
    queryParams.push(user.organizationId);
  }
  
  // Get total count
  const countResult = await query(
    `SELECT COUNT(*) as total
     FROM users u
     LEFT JOIN organizations o ON u.organization_id = o.id
     ${whereClause}`,
    queryParams
  );
  
  const total = parseInt(countResult.rows[0].total);
  
  // Get users with pagination
  const usersResult = await query(
    `SELECT u.id, u.email, u.name, u.organization_id, u.role_id, u.status, u.last_login, u.created_at,
            o.name as organization_name, o.type as organization_type,
            r.name as role_name
     FROM users u
     LEFT JOIN organizations o ON u.organization_id = o.id
     LEFT JOIN user_roles r ON u.role_id = r.id
     ${whereClause}
     ORDER BY u.${sortBy} ${sortOrder}
     LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`,
    [...queryParams, limit, offset]
  );
  
  const users = usersResult.rows.map((row: any) => ({
    id: row.id,
    email: row.email,
    name: row.name,
    status: row.status,
    lastActive: row.last_login,
    createdAt: row.created_at,
    organization: {
      id: row.organization_id,
      name: row.organization_name,
      type: row.organization_type,
    },
    role: {
      id: row.role_id,
      name: row.role_name,
    },
  }));
  
  return successResponse({
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

// POST /api/users - Create new user
async function createUserHandler(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    throw new AuthenticationError();
  }
  
  if (!hasPermission(user, 'write', 'users')) {
    throw new AuthorizationError('Insufficient permissions to create users');
  }
  
  const body = await request.json();
  const validation = validateBody(createUserSchema, body);
  if (!validation.success) {
    throw new ValidationError('Invalid input', validation.errors);
  }
  
  const { email, name, password, organizationId, roleId } = validation.data;
  
  // Check if email already exists
  const existingUser = await query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );
  
  if (existingUser.rows.length > 0) {
    throw new ConflictError('User with this email already exists');
  }
  
  // Verify organization and role exist
  const orgCheck = await query(
    'SELECT id FROM organizations WHERE id = $1',
    [organizationId]
  );
  
  const roleCheck = await query(
    'SELECT id FROM user_roles WHERE id = $1',
    [roleId]
  );
  
  if (orgCheck.rows.length === 0) {
    throw new ValidationError('Organization not found');
  }
  
  if (roleCheck.rows.length === 0) {
    throw new ValidationError('Role not found');
  }
  
  // Hash password
  const passwordHash = await hashPassword(password);
  
  // Create user
  const result = await query(
    `INSERT INTO users (email, name, password_hash, organization_id, role_id, status)
     VALUES ($1, $2, $3, $4, $5, 'pending')
     RETURNING id, email, name, organization_id, role_id, status, created_at`,
    [email, name, passwordHash, organizationId, roleId]
  );
  
  const newUser = result.rows[0];
  
  // Log user creation
  await query(
    `INSERT INTO transaction_logs (user_id, organization_id, action_type, target_type, target_id, status, ip_address)
     VALUES ($1, $2, 'create', 'user', $3, 'success', $4)`,
    [
      user.id,
      user.organizationId,
      newUser.id,
      request.headers.get('x-forwarded-for') || 'unknown'
    ]
  );
  
  return createdResponse({
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
    status: newUser.status,
    organizationId: newUser.organization_id,
    roleId: newUser.role_id,
    createdAt: newUser.created_at,
  });
}

export const GET = asyncHandler(getUsersHandler);
export const POST = asyncHandler(createUserHandler);
