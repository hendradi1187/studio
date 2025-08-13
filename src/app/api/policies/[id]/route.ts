
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { getUserFromRequest } from '@/lib/auth';
import { asyncHandler, AuthenticationError, ValidationError, NotFoundError, successResponse } from '@/lib/errors';
import { z } from 'zod';

// Validation schema for policy update
const updatePolicySchema = z.object({
  name: z.string().min(1, 'Policy name is required').optional(),
  description: z.string().optional(),
  policyType: z.enum(['access', 'contract', 'usage']).optional(),
  policyRules: z.record(z.any()).optional(),
  status: z.enum(['draft', 'active', 'inactive']).optional()
});

// GET /api/policies/[id] - Get policy by ID
async function getPolicyHandler(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUserFromRequest(request);
  if (!user) {
    throw new AuthenticationError();
  }

  const policyId = params.id;

  const result = await query(
    `SELECT 
       p.id, p.name, p.description, p.policy_type, p.policy_rules,
       p.permissions_count, p.prohibitions_count, p.obligations_count,
       p.status, p.created_at, p.updated_at,
       u.name as created_by_name, u.id as created_by_id
     FROM policies p
     LEFT JOIN users u ON p.created_by = u.id
     WHERE p.id = $1`,
    [policyId]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError('Policy not found');
  }

  const policy = result.rows[0];

  return successResponse({
    policy: {
      id: policy.id,
      name: policy.name,
      description: policy.description,
      policyType: policy.policy_type,
      policyRules: policy.policy_rules,
      permissionsCount: policy.permissions_count,
      prohibitionsCount: policy.prohibitions_count,
      obligationsCount: policy.obligations_count,
      status: policy.status,
      createdAt: policy.created_at,
      updatedAt: policy.updated_at,
      createdBy: {
        id: policy.created_by_id,
        name: policy.created_by_name
      }
    }
  });
}

// PUT /api/policies/[id] - Update policy
async function updatePolicyHandler(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUserFromRequest(request);
  if (!user) {
    throw new AuthenticationError();
  }

  const policyId = params.id;
  const body = await request.json();

  // Validate input
  const validationResult = updatePolicySchema.safeParse(body);
  if (!validationResult.success) {
    throw new ValidationError('Invalid policy data', validationResult.error.errors);
  }

  // Check if policy exists
  const existingPolicy = await query(
    'SELECT id FROM policies WHERE id = $1',
    [policyId]
  );

  if (existingPolicy.rows.length === 0) {
    throw new NotFoundError('Policy not found');
  }

  const updateData = validationResult.data;
  const updateFields: string[] = [];
  const updateValues: any[] = [];
  let paramIndex = 1;

  // Build dynamic update query
  if (updateData.name !== undefined) {
    updateFields.push(`name = $${paramIndex}`);
    updateValues.push(updateData.name);
    paramIndex++;
  }

  if (updateData.description !== undefined) {
    updateFields.push(`description = $${paramIndex}`);
    updateValues.push(updateData.description);
    paramIndex++;
  }

  if (updateData.policyType !== undefined) {
    updateFields.push(`policy_type = $${paramIndex}`);
    updateValues.push(updateData.policyType);
    paramIndex++;
  }

  if (updateData.policyRules !== undefined) {
    const rules = updateData.policyRules || {};
    const permissionsCount = (rules.permissions && Array.isArray(rules.permissions)) ? rules.permissions.length : 0;
    const prohibitionsCount = (rules.prohibitions && Array.isArray(rules.prohibitions)) ? rules.prohibitions.length : 0;
    const obligationsCount = (rules.obligations && Array.isArray(rules.obligations)) ? rules.obligations.length : 0;

    updateFields.push(`policy_rules = $${paramIndex}`);
    updateValues.push(JSON.stringify(rules));
    paramIndex++;

    updateFields.push(`permissions_count = $${paramIndex}`);
    updateValues.push(permissionsCount);
    paramIndex++;

    updateFields.push(`prohibitions_count = $${paramIndex}`);
    updateValues.push(prohibitionsCount);
    paramIndex++;

    updateFields.push(`obligations_count = $${paramIndex}`);
    updateValues.push(obligationsCount);
    paramIndex++;
  }

  if (updateData.status !== undefined) {
    updateFields.push(`status = $${paramIndex}`);
    updateValues.push(updateData.status);
    paramIndex++;
  }

  // Always update the updated_at timestamp
  updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

  // Add policy ID for WHERE clause
  updateValues.push(policyId);

  const result = await query(
    `UPDATE policies 
     SET ${updateFields.join(', ')}
     WHERE id = $${paramIndex}
     RETURNING id, name, description, policy_type, policy_rules, permissions_count, 
               prohibitions_count, obligations_count, status, created_at, updated_at`,
    updateValues
  );

  const updatedPolicy = result.rows[0];

  // Log policy update
  await query(
    `INSERT INTO transaction_logs 
     (user_id, organization_id, action_type, target_type, target_id, status, ip_address, user_agent)
     VALUES ($1, $2, 'update', 'policy', $3, 'success', $4, $5)`,
    [user.id, user.organizationId, policyId, request.ip || 'unknown', request.headers.get('user-agent') || 'unknown']
  );

  return successResponse({
    message: 'Policy updated successfully',
    policy: {
      id: updatedPolicy.id,
      name: updatedPolicy.name,
      description: updatedPolicy.description,
      policyType: updatedPolicy.policy_type,
      policyRules: updatedPolicy.policy_rules,
      permissionsCount: updatedPolicy.permissions_count,
      prohibitionsCount: updatedPolicy.prohibitions_count,
      obligationsCount: updatedPolicy.obligations_count,
      status: updatedPolicy.status,
      createdAt: updatedPolicy.created_at,
      updatedAt: updatedPolicy.updated_at
    }
  });
}

// DELETE /api/policies/[id] - Delete policy
async function deletePolicyHandler(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUserFromRequest(request);
  if (!user) {
    throw new AuthenticationError();
  }

  const policyId = params.id;

  // Check if policy exists
  const existingPolicy = await query(
    'SELECT id, name FROM policies WHERE id = $1',
    [policyId]
  );

  if (existingPolicy.rows.length === 0) {
    throw new NotFoundError('Policy not found');
  }

  // Check if policy is being used by any data offers (business rule)
  const usageCheck = await query(
    'SELECT COUNT(*) as count FROM data_offers WHERE access_policy_id = $1 OR contract_policy_id = $1',
    [policyId]
  );

  if (parseInt(usageCheck.rows[0].count) > 0) {
    throw new ValidationError('Cannot delete policy that is currently in use by data offers');
  }

  // Delete the policy
  await query('DELETE FROM policies WHERE id = $1', [policyId]);

  // Log policy deletion
  await query(
    `INSERT INTO transaction_logs 
     (user_id, organization_id, action_type, target_type, target_id, status, ip_address, user_agent)
     VALUES ($1, $2, 'delete', 'policy', $3, 'success', $4, $5)`,
    [user.id, user.organizationId, policyId, request.ip || 'unknown', request.headers.get('user-agent') || 'unknown']
  );

  return successResponse({
    message: `Policy "${existingPolicy.rows[0].name}" deleted successfully`
  });
}

export const GET = asyncHandler(getPolicyHandler);
export const PUT = asyncHandler(updatePolicyHandler);
export const DELETE = asyncHandler(deletePolicyHandler);
