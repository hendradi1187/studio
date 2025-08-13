
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { getUserFromRequest } from '@/lib/auth';
import { asyncHandler, AuthenticationError, ValidationError, successResponse } from '@/lib/errors';
import { z } from 'zod';

// Validation schema for policy
const policySchema = z.object({
  name: z.string().min(1, 'Policy name is required'),
  description: z.string().optional(),
  policyType: z.enum(['access', 'contract', 'usage']),
  policyRules: z.record(z.any()).optional(),
  status: z.enum(['draft', 'active', 'inactive']).optional()
});

// GET /api/policies - Get all policies with pagination and search
async function getPoliciesHandler(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    throw new AuthenticationError();
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
  const search = searchParams.get('search') || '';
  const sortBy = searchParams.get('sortBy') || 'created_at';
  const sortOrder = searchParams.get('sortOrder') || 'desc';
  const policyType = searchParams.get('type') || '';
  const status = searchParams.get('status') || '';

  const offset = (page - 1) * limit;

  // Build WHERE clause
  let whereConditions = ['1=1'];
  const queryParams: any[] = [];
  let paramIndex = 1;

  if (search) {
    whereConditions.push(`(p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`);
    queryParams.push(`%${search}%`);
    paramIndex++;
  }

  if (policyType) {
    whereConditions.push(`p.policy_type = $${paramIndex}`);
    queryParams.push(policyType);
    paramIndex++;
  }

  if (status) {
    whereConditions.push(`p.status = $${paramIndex}`);
    queryParams.push(status);
    paramIndex++;
  }

  const whereClause = whereConditions.join(' AND ');

  // Get total count
  const countResult = await query(
    `SELECT COUNT(*) as total FROM policies p WHERE ${whereClause}`,
    queryParams
  );

  // Get policies with pagination
  const policiesResult = await query(
    `SELECT 
       p.id, p.name, p.description, p.policy_type, p.policy_rules,
       p.permissions_count, p.prohibitions_count, p.obligations_count,
       p.status, p.created_at, p.updated_at,
       u.name as created_by_name
     FROM policies p
     LEFT JOIN users u ON p.created_by = u.id
     WHERE ${whereClause}
     ORDER BY p.${sortBy} ${sortOrder.toUpperCase()}
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...queryParams, limit, offset]
  );

  const total = parseInt(countResult.rows[0].total);
  const totalPages = Math.ceil(total / limit);

  return successResponse({
    policies: policiesResult.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      policyType: row.policy_type,
      policyRules: row.policy_rules,
      permissionsCount: row.permissions_count,
      prohibitionsCount: row.prohibitions_count,
      obligationsCount: row.obligations_count,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      createdBy: row.created_by_name
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages
    }
  });
}

// POST /api/policies - Create new policy
async function createPolicyHandler(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    throw new AuthenticationError();
  }

  const body = await request.json();
  
  // Validate input
  const validationResult = policySchema.safeParse(body);
  if (!validationResult.success) {
    throw new ValidationError('Invalid policy data', validationResult.error.errors);
  }

  const { name, description, policyType, policyRules, status } = validationResult.data;

  // Count rules for the policy
  const rules = policyRules || {};
  const permissionsCount = (rules.permissions && Array.isArray(rules.permissions)) ? rules.permissions.length : 0;
  const prohibitionsCount = (rules.prohibitions && Array.isArray(rules.prohibitions)) ? rules.prohibitions.length : 0;
  const obligationsCount = (rules.obligations && Array.isArray(rules.obligations)) ? rules.obligations.length : 0;

  // Insert new policy
  const result = await query(
    `INSERT INTO policies 
     (name, description, policy_type, policy_rules, permissions_count, prohibitions_count, 
      obligations_count, status, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id, name, description, policy_type, policy_rules, permissions_count, 
               prohibitions_count, obligations_count, status, created_at, updated_at`,
    [
      name,
      description,
      policyType,
      JSON.stringify(rules),
      permissionsCount,
      prohibitionsCount,
      obligationsCount,
      status || 'draft',
      user.id
    ]
  );

  const newPolicy = result.rows[0];

  // Log policy creation
  await query(
    `INSERT INTO transaction_logs 
     (user_id, organization_id, action_type, target_type, target_id, status, ip_address, user_agent)
     VALUES ($1, $2, 'create', 'policy', $3, 'success', $4, $5)`,
    [user.id, user.organizationId, newPolicy.id, request.ip || 'unknown', request.headers.get('user-agent') || 'unknown']
  );

  return successResponse({
    message: 'Policy created successfully',
    policy: {
      id: newPolicy.id,
      name: newPolicy.name,
      description: newPolicy.description,
      policyType: newPolicy.policy_type,
      policyRules: newPolicy.policy_rules,
      permissionsCount: newPolicy.permissions_count,
      prohibitionsCount: newPolicy.prohibitions_count,
      obligationsCount: newPolicy.obligations_count,
      status: newPolicy.status,
      createdAt: newPolicy.created_at,
      updatedAt: newPolicy.updated_at
    }
  });
}

export const GET = asyncHandler(getPoliciesHandler);
export const POST = asyncHandler(createPolicyHandler);
