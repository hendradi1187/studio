
import { NextRequest } from 'next/server';
import { query } from '@/lib/database';
import { getUserFromRequest, hasPermission } from '@/lib/auth';
import { validateBody, validateQuery, createAssetSchema, paginationSchema } from '@/lib/validation';
import {
  asyncHandler,
  successResponse,
  createdResponse,
  AuthenticationError,
  AuthorizationError,
  ValidationError
} from '@/lib/errors';

// GET /api/assets - Get all assets with pagination and filtering
async function getAssetsHandler(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    throw new AuthenticationError();
  }
  
  const url = new URL(request.url);
  const queryValidation = validateQuery(paginationSchema, url.searchParams);
  if (!queryValidation.success) {
    throw new ValidationError('Invalid query parameters', queryValidation.errors);
  }
  
  const { page, limit, search, sortBy = 'created_at', sortOrder } = queryValidation.data;
  const offset = (page - 1) * limit;
  
  // Build WHERE clause for search and access control
  let whereClause = 'WHERE a.status = $1';
  const queryParams: any[] = ['active'];
  
  // Full-text search across title, description, abstract, and keywords
  if (search) {
    whereClause += ` AND (
      to_tsvector('english', a.title || ' ' || COALESCE(a.description, '') || ' ' || COALESCE(a.abstract, '') || ' ' || COALESCE(a.keywords, ''))
      @@ plainto_tsquery('english', $${queryParams.length + 1})
    )`;
    queryParams.push(search);
  }
  
  // Access control: filter based on user permissions and asset access status
  if (!hasPermission(user, '*')) {
    whereClause += ` AND (
      a.access_status = 'open' OR 
      a.owner_organization_id = $${queryParams.length + 1} OR
      EXISTS (
        SELECT 1 FROM access_requests ar 
        WHERE ar.asset_id = a.id 
        AND ar.requester_organization_id = $${queryParams.length + 1}
        AND ar.request_status = 'approved'
      )
    )`;
    queryParams.push(user.organizationId);
  }
  
  // Get total count
  const countResult = await query(
    `SELECT COUNT(*) as total
     FROM assets a
     LEFT JOIN organizations o ON a.owner_organization_id = o.id
     ${whereClause}`,
    queryParams
  );
  
  const total = parseInt(countResult.rows[0].total);
  
  // Get assets with pagination
  const assetsResult = await query(
    `SELECT a.id, a.title, a.description, a.abstract, a.access_status, a.data_format, 
            a.file_size, a.keywords, a.geographic_area, a.time_period_start, a.time_period_end,
            a.version, a.created_at, a.updated_at,
            o.name as owner_organization_name, o.type as owner_organization_type,
            COUNT(DISTINCT av.vocabulary_id) as vocabulary_count
     FROM assets a
     LEFT JOIN organizations o ON a.owner_organization_id = o.id
     LEFT JOIN asset_vocabulary av ON a.id = av.asset_id
     ${whereClause}
     GROUP BY a.id, o.name, o.type
     ORDER BY a.${sortBy} ${sortOrder}
     LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`,
    [...queryParams, limit, offset]
  );
  
  // Get vocabulary terms for each asset
  const assets = await Promise.all(
    assetsResult.rows.map(async (row: any) => {
      const vocabularyResult = await query(
        `SELECT vt.id, vt.term, vt.level
         FROM asset_vocabulary av
         JOIN vocabulary_terms vt ON av.vocabulary_id = vt.id
         WHERE av.asset_id = $1
         ORDER BY vt.level, vt.sort_order`,
        [row.id]
      );
      
      return {
        id: row.id,
        title: row.title,
        description: row.description,
        abstract: row.abstract,
        accessStatus: row.access_status,
        dataFormat: row.data_format,
        fileSize: row.file_size,
        keywords: row.keywords,
        geographicArea: row.geographic_area,
        timePeriod: {
          start: row.time_period_start,
          end: row.time_period_end,
        },
        version: row.version,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        owner: {
          name: row.owner_organization_name,
          type: row.owner_organization_type,
        },
        vocabulary: vocabularyResult.rows,
      };
    })
  );
  
  return successResponse({
    assets,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

// POST /api/assets - Create new asset
async function createAssetHandler(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    throw new AuthenticationError();
  }
  
  if (!hasPermission(user, 'write', 'assets')) {
    throw new AuthorizationError('Insufficient permissions to create assets');
  }
  
  const body = await request.json();
  const validation = validateBody(createAssetSchema, body);
  if (!validation.success) {
    throw new ValidationError('Invalid input', validation.errors);
  }
  
  const {
    title,
    description,
    accessStatus,
    dataFormat,
    dataStructure,
    abstract,
    keywords,
    geographicArea,
    timePeriodStart,
    timePeriodEnd,
    version,
    fileSize,
    filePath,
  } = validation.data;
  
  // Create asset
  const result = await query(
    `INSERT INTO assets (
      title, description, owner_organization_id, access_status, data_format,
      data_structure, abstract, keywords, geographic_area, time_period_start,
      time_period_end, version, file_size, metadata
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING id, title, description, access_status, data_format, version, file_size, created_at`,
    [
      title,
      description,
      user.organizationId,
      accessStatus,
      dataFormat,
      dataStructure,
      abstract,
      keywords,
      geographicArea,
      timePeriodStart ? new Date(timePeriodStart) : null,
      timePeriodEnd ? new Date(timePeriodEnd) : null,
      version,
      fileSize || null,
      JSON.stringify({ filePath: filePath || null, uploadedBy: user.id })
    ]
  );
  
  const newAsset = result.rows[0];
  
  // If vocabulary terms are provided, add them
  if (body.vocabularyIds && Array.isArray(body.vocabularyIds)) {
    for (const vocabularyId of body.vocabularyIds) {
      await query(
        'INSERT INTO asset_vocabulary (asset_id, vocabulary_id) VALUES ($1, $2)',
        [newAsset.id, vocabularyId]
      );
    }
  }
  
  // Log asset creation
  await query(
    `INSERT INTO transaction_logs (user_id, organization_id, action_type, target_type, target_id, status, ip_address)
     VALUES ($1, $2, 'create', 'asset', $3, 'success', $4)`,
    [
      user.id,
      user.organizationId,
      newAsset.id,
      request.headers.get('x-forwarded-for') || 'unknown'
    ]
  );
  
  return createdResponse({
    id: newAsset.id,
    title: newAsset.title,
    description: newAsset.description,
    accessStatus: newAsset.access_status,
    dataFormat: newAsset.data_format,
    version: newAsset.version,
    createdAt: newAsset.created_at,
  });
}

export const GET = asyncHandler(getAssetsHandler);
export const POST = asyncHandler(createAssetHandler);
