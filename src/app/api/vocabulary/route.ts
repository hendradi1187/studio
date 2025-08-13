
import { NextRequest } from 'next/server';
import { query } from '@/lib/database';
import { getUserFromRequest, hasPermission } from '@/lib/auth';
import { validateBody, validateQuery, createVocabularySchema, paginationSchema } from '@/lib/validation';
import {
  asyncHandler,
  successResponse,
  createdResponse,
  AuthenticationError,
  AuthorizationError,
  ValidationError
} from '@/lib/errors';

// GET /api/vocabulary - Get all vocabulary terms with pagination and filtering
async function getVocabularyTermsHandler(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    throw new AuthenticationError();
  }
  
  const url = new URL(request.url);
  const queryValidation = validateQuery(paginationSchema, url.searchParams);
  if (!queryValidation.success) {
    throw new ValidationError('Invalid query parameters', queryValidation.errors);
  }
  
  const { page, limit, search, sortBy = 'term', sortOrder } = queryValidation.data;
  const offset = (page - 1) * limit;
  const parentId = url.searchParams.get('parentId');
  const level = url.searchParams.get('level');
  
  // Build WHERE clause for search and filtering
  let whereClause = 'WHERE vt.status = $1';
  const queryParams: any[] = ['active'];
  
  // Filter by parent (for hierarchical view)
  if (parentId) {
    whereClause += ` AND vt.parent_id = $${queryParams.length + 1}`;
    queryParams.push(parentId);
  } else if (parentId === null || url.searchParams.get('rootOnly') === 'true') {
    whereClause += ` AND vt.parent_id IS NULL`;
  }
  
  // Filter by level
  if (level) {
    whereClause += ` AND vt.level = $${queryParams.length + 1}`;
    queryParams.push(parseInt(level));
  }
  
  // Search functionality
  if (search) {
    whereClause += ` AND (
      to_tsvector('english', vt.term || ' ' || COALESCE(vt.description, ''))
      @@ plainto_tsquery('english', $${queryParams.length + 1})
    )`;
    queryParams.push(search);
  }
  
  // Get total count
  const countResult = await query(
    `SELECT COUNT(*) as total
     FROM vocabulary_terms vt
     ${whereClause}`,
    queryParams
  );
  
  const total = parseInt(countResult.rows[0].total);
  
  // Get vocabulary terms with pagination
  const termsResult = await query(
    `SELECT vt.id, vt.term, vt.description, vt.parent_id, vt.level, vt.sort_order,
            vt.created_at, vt.updated_at,
            parent.term as parent_term,
            COUNT(children.id) as children_count,
            COUNT(av.asset_id) as assets_count
     FROM vocabulary_terms vt
     LEFT JOIN vocabulary_terms parent ON vt.parent_id = parent.id
     LEFT JOIN vocabulary_terms children ON vt.id = children.parent_id AND children.status = 'active'
     LEFT JOIN asset_vocabulary av ON vt.id = av.vocabulary_id
     ${whereClause}
     GROUP BY vt.id, parent.term
     ORDER BY vt.${sortBy} ${sortOrder}, vt.sort_order ASC
     LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`,
    [...queryParams, limit, offset]
  );
  
  const terms = termsResult.rows.map((row: any) => ({
    id: row.id,
    term: row.term,
    description: row.description,
    parentId: row.parent_id,
    parentTerm: row.parent_term,
    level: row.level,
    sortOrder: row.sort_order,
    childrenCount: parseInt(row.children_count),
    assetsCount: parseInt(row.assets_count),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
  
  return successResponse({
    terms,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

// POST /api/vocabulary - Create new vocabulary term
async function createVocabularyTermHandler(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    throw new AuthenticationError();
  }
  
  if (!hasPermission(user, 'write', 'vocabulary')) {
    throw new AuthorizationError('Insufficient permissions to create vocabulary terms');
  }
  
  const body = await request.json();
  const validation = validateBody(createVocabularySchema, body);
  if (!validation.success) {
    throw new ValidationError('Invalid input', validation.errors);
  }
  
  const { term, parentId, description, level, sortOrder } = validation.data;
  
  // Check if term already exists at the same level
  const existingTerm = await query(
    `SELECT id FROM vocabulary_terms 
     WHERE term = $1 AND COALESCE(parent_id, '') = COALESCE($2, '') AND status = 'active'`,
    [term, parentId || null]
  );
  
  if (existingTerm.rows.length > 0) {
    throw new ValidationError('Term already exists at this level');
  }
  
  // If parentId is provided, validate it exists and calculate level
  let calculatedLevel = level || 0;
  if (parentId) {
    const parentResult = await query(
      'SELECT level FROM vocabulary_terms WHERE id = $1 AND status = $2',
      [parentId, 'active']
    );
    
    if (parentResult.rows.length === 0) {
      throw new ValidationError('Parent term not found');
    }
    
    calculatedLevel = parentResult.rows[0].level + 1;
  }
  
  // Create vocabulary term
  const result = await query(
    `INSERT INTO vocabulary_terms (term, parent_id, description, level, sort_order)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, term, description, parent_id, level, sort_order, created_at`,
    [term, parentId || null, description, calculatedLevel, sortOrder || 0]
  );
  
  const newTerm = result.rows[0];
  
  // Log vocabulary term creation
  await query(
    `INSERT INTO transaction_logs (user_id, organization_id, action_type, target_type, target_id, status, ip_address)
     VALUES ($1, $2, 'create', 'vocabulary_term', $3, 'success', $4)`,
    [
      user.id,
      user.organizationId,
      newTerm.id,
      request.headers.get('x-forwarded-for') || 'unknown'
    ]
  );
  
  return createdResponse({
    id: newTerm.id,
    term: newTerm.term,
    description: newTerm.description,
    parentId: newTerm.parent_id,
    level: newTerm.level,
    sortOrder: newTerm.sort_order,
    createdAt: newTerm.created_at,
  });
}

export const GET = asyncHandler(getVocabularyTermsHandler);
export const POST = asyncHandler(createVocabularyTermHandler);
