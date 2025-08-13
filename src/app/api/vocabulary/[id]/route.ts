import { NextRequest } from 'next/server';
import { query } from '@/lib/database';
import { getUserFromRequest, hasPermission } from '@/lib/auth';
import { validateBody, createVocabularySchema } from '@/lib/validation';
import {
  asyncHandler,
  successResponse,
  notFoundResponse,
  AuthenticationError,
  AuthorizationError,
  ValidationError
} from '@/lib/errors';

interface RouteParams {
  params: { id: string };
}

// GET /api/vocabulary/[id] - Get single vocabulary term
async function getVocabularyTermHandler(request: NextRequest, { params }: RouteParams) {
  const user = await getUserFromRequest(request);
  if (!user) {
    throw new AuthenticationError();
  }
  
  const { id } = params;
  
  const result = await query(
    `SELECT vt.id, vt.term, vt.description, vt.parent_id, vt.level, vt.sort_order,
            vt.created_at, vt.updated_at,
            parent.term as parent_term,
            COUNT(children.id) as children_count,
            COUNT(av.asset_id) as assets_count
     FROM vocabulary_terms vt
     LEFT JOIN vocabulary_terms parent ON vt.parent_id = parent.id
     LEFT JOIN vocabulary_terms children ON vt.id = children.parent_id AND children.status = 'active'
     LEFT JOIN asset_vocabulary av ON vt.id = av.vocabulary_id
     WHERE vt.id = $1 AND vt.status = 'active'
     GROUP BY vt.id, parent.term`,
    [id]
  );
  
  if (result.rows.length === 0) {
    return notFoundResponse('Vocabulary term not found');
  }
  
  const term = result.rows[0];
  
  // Get children terms
  const childrenResult = await query(
    `SELECT id, term, description, level, sort_order, 
            COUNT(av.asset_id) as assets_count
     FROM vocabulary_terms vt
     LEFT JOIN asset_vocabulary av ON vt.id = av.vocabulary_id
     WHERE parent_id = $1 AND status = 'active'
     GROUP BY vt.id
     ORDER BY sort_order, term`,
    [id]
  );
  
  return successResponse({
    id: term.id,
    term: term.term,
    description: term.description,
    parentId: term.parent_id,
    parentTerm: term.parent_term,
    level: term.level,
    sortOrder: term.sort_order,
    childrenCount: parseInt(term.children_count),
    assetsCount: parseInt(term.assets_count),
    children: childrenResult.rows.map((child: any) => ({
      id: child.id,
      term: child.term,
      description: child.description,
      level: child.level,
      sortOrder: child.sort_order,
      assetsCount: parseInt(child.assets_count),
    })),
    createdAt: term.created_at,
    updatedAt: term.updated_at,
  });
}

// PUT /api/vocabulary/[id] - Update vocabulary term
async function updateVocabularyTermHandler(request: NextRequest, { params }: RouteParams) {
  const user = await getUserFromRequest(request);
  if (!user) {
    throw new AuthenticationError();
  }
  
  if (!hasPermission(user, 'write', 'vocabulary')) {
    throw new AuthorizationError('Insufficient permissions to update vocabulary terms');
  }
  
  const { id } = params;
  const body = await request.json();
  
  // Check if term exists
  const existingTerm = await query(
    'SELECT id, term, parent_id FROM vocabulary_terms WHERE id = $1 AND status = $2',
    [id, 'active']
  );
  
  if (existingTerm.rows.length === 0) {
    return notFoundResponse('Vocabulary term not found');
  }
  
  const validation = validateBody(createVocabularySchema.partial(), body);
  if (!validation.success) {
    throw new ValidationError('Invalid input', validation.errors);
  }
  
  const { term, parentId, description, sortOrder } = validation.data;
  
  // If updating term name, check for duplicates
  if (term && term !== existingTerm.rows[0].term) {
    const duplicateCheck = await query(
      `SELECT id FROM vocabulary_terms 
       WHERE term = $1 AND COALESCE(parent_id, '') = COALESCE($2, '') AND status = 'active' AND id != $3`,
      [term, parentId || existingTerm.rows[0].parent_id, id]
    );
    
    if (duplicateCheck.rows.length > 0) {
      throw new ValidationError('Term already exists at this level');
    }
  }
  
  // If changing parent, validate it and update level
  let calculatedLevel;
  if (parentId !== undefined) {
    if (parentId) {
      const parentResult = await query(
        'SELECT level FROM vocabulary_terms WHERE id = $1 AND status = $2',
        [parentId, 'active']
      );
      
      if (parentResult.rows.length === 0) {
        throw new ValidationError('Parent term not found');
      }
      
      calculatedLevel = parentResult.rows[0].level + 1;
    } else {
      calculatedLevel = 0;
    }
  }
  
  // Build update query
  const updateFields = [];
  const updateParams = [];
  let paramIndex = 1;
  
  if (term !== undefined) {
    updateFields.push(`term = $${paramIndex++}`);
    updateParams.push(term);
  }
  
  if (description !== undefined) {
    updateFields.push(`description = $${paramIndex++}`);
    updateParams.push(description);
  }
  
  if (parentId !== undefined) {
    updateFields.push(`parent_id = $${paramIndex++}`);
    updateParams.push(parentId);
  }
  
  if (calculatedLevel !== undefined) {
    updateFields.push(`level = $${paramIndex++}`);
    updateParams.push(calculatedLevel);
  }
  
  if (sortOrder !== undefined) {
    updateFields.push(`sort_order = $${paramIndex++}`);
    updateParams.push(sortOrder);
  }
  
  updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
  updateParams.push(id);
  
  const result = await query(
    `UPDATE vocabulary_terms 
     SET ${updateFields.join(', ')}
     WHERE id = $${paramIndex} AND status = 'active'
     RETURNING id, term, description, parent_id, level, sort_order, updated_at`,
    updateParams
  );
  
  // Log vocabulary term update
  await query(
    `INSERT INTO transaction_logs (user_id, organization_id, action_type, target_type, target_id, status, ip_address)
     VALUES ($1, $2, 'update', 'vocabulary_term', $3, 'success', $4)`,
    [
      user.id,
      user.organizationId,
      id,
      request.headers.get('x-forwarded-for') || 'unknown'
    ]
  );
  
  const updatedTerm = result.rows[0];
  
  return successResponse({
    id: updatedTerm.id,
    term: updatedTerm.term,
    description: updatedTerm.description,
    parentId: updatedTerm.parent_id,
    level: updatedTerm.level,
    sortOrder: updatedTerm.sort_order,
    updatedAt: updatedTerm.updated_at,
  });
}

// DELETE /api/vocabulary/[id] - Delete vocabulary term
async function deleteVocabularyTermHandler(request: NextRequest, { params }: RouteParams) {
  const user = await getUserFromRequest(request);
  if (!user) {
    throw new AuthenticationError();
  }
  
  if (!hasPermission(user, 'delete', 'vocabulary')) {
    throw new AuthorizationError('Insufficient permissions to delete vocabulary terms');
  }
  
  const { id } = params;
  
  // Check if term exists
  const existingTerm = await query(
    'SELECT id FROM vocabulary_terms WHERE id = $1 AND status = $2',
    [id, 'active']
  );
  
  if (existingTerm.rows.length === 0) {
    return notFoundResponse('Vocabulary term not found');
  }
  
  // Check if term has children
  const childrenCount = await query(
    'SELECT COUNT(*) as count FROM vocabulary_terms WHERE parent_id = $1 AND status = $2',
    [id, 'active']
  );
  
  if (parseInt(childrenCount.rows[0].count) > 0) {
    throw new ValidationError('Cannot delete term with child terms. Delete children first.');
  }
  
  // Check if term is used by assets
  const assetsCount = await query(
    'SELECT COUNT(*) as count FROM asset_vocabulary WHERE vocabulary_id = $1',
    [id]
  );
  
  if (parseInt(assetsCount.rows[0].count) > 0) {
    throw new ValidationError('Cannot delete term that is used by assets');
  }
  
  // Soft delete the term
  await query(
    `UPDATE vocabulary_terms 
     SET status = 'deleted', updated_at = CURRENT_TIMESTAMP
     WHERE id = $1`,
    [id]
  );
  
  // Log vocabulary term deletion
  await query(
    `INSERT INTO transaction_logs (user_id, organization_id, action_type, target_type, target_id, status, ip_address)
     VALUES ($1, $2, 'delete', 'vocabulary_term', $3, 'success', $4)`,
    [
      user.id,
      user.organizationId,
      id,
      request.headers.get('x-forwarded-for') || 'unknown'
    ]
  );
  
  return successResponse({ message: 'Vocabulary term deleted successfully' });
}

export const GET = asyncHandler(getVocabularyTermHandler);
export const PUT = asyncHandler(updateVocabularyTermHandler);
export const DELETE = asyncHandler(deleteVocabularyTermHandler);