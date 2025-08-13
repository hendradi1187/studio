
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { getUserFromRequest } from '@/lib/auth';
import { asyncHandler, AuthenticationError, ValidationError, successResponse } from '@/lib/errors';
import { createDataOfferSchema } from '@/lib/validation';

// GET /api/data-offers - Get all data offers with pagination
async function getDataOffersHandler(request: NextRequest) {
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

  const offset = (page - 1) * limit;

  // Build WHERE clause
  let whereConditions = ['1=1'];
  const queryParams: any[] = [];
  let paramIndex = 1;

  if (search) {
    whereConditions.push(`(a.title ILIKE $${paramIndex} OR do.description ILIKE $${paramIndex})`);
    queryParams.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = whereConditions.join(' AND ');

  // Get total count
  const countResult = await query(
    `SELECT COUNT(*) as total FROM data_offers do
     LEFT JOIN assets a ON do.asset_id = a.id
     WHERE ${whereClause}`,
    queryParams
  );

  // Get data offers with pagination
  const offersResult = await query(
    `SELECT 
       do.id, do.asset_id, do.access_policy_id, do.contract_policy_id,
       do.price, do.currency, do.valid_until, do.status, do.description,
       do.created_at, do.updated_at,
       a.title as asset_title, a.description as asset_description,
       ap.name as access_policy_name, cp.name as contract_policy_name,
       u.name as created_by_name, org.name as provider_organization
     FROM data_offers do
     LEFT JOIN assets a ON do.asset_id = a.id
     LEFT JOIN policies ap ON do.access_policy_id = ap.id
     LEFT JOIN policies cp ON do.contract_policy_id = cp.id
     LEFT JOIN users u ON do.created_by = u.id
     LEFT JOIN organizations org ON do.provider_organization_id = org.id
     WHERE ${whereClause}
     ORDER BY do.${sortBy} ${sortOrder.toUpperCase()}
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...queryParams, limit, offset]
  );

  const total = parseInt(countResult.rows[0].total);
  const totalPages = Math.ceil(total / limit);

  return successResponse({
    dataOffers: offersResult.rows.map(row => ({
      id: row.id,
      assetId: row.asset_id,
      assetTitle: row.asset_title,
      assetDescription: row.asset_description,
      accessPolicyId: row.access_policy_id,
      accessPolicyName: row.access_policy_name,
      contractPolicyId: row.contract_policy_id,
      contractPolicyName: row.contract_policy_name,
      price: row.price,
      currency: row.currency,
      validUntil: row.valid_until,
      status: row.status,
      description: row.description,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      createdBy: row.created_by_name,
      providerOrganization: row.provider_organization
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages
    }
  });
}

// POST /api/data-offers - Create new data offer
async function createDataOfferHandler(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    throw new AuthenticationError();
  }

  const body = await request.json();
  
  // Validate input
  const validationResult = createDataOfferSchema.safeParse(body);
  if (!validationResult.success) {
    throw new ValidationError('Invalid data offer data', validationResult.error.errors);
  }

  const { assetId, accessPolicyId, contractPolicyId, price, currency, validUntil, description } = validationResult.data;

  // Verify asset exists
  const assetCheck = await query('SELECT id FROM assets WHERE id = $1', [assetId]);
  if (assetCheck.rows.length === 0) {
    throw new ValidationError('Asset not found');
  }

  // Verify policies exist if provided
  if (accessPolicyId) {
    const policyCheck = await query('SELECT id FROM policies WHERE id = $1', [accessPolicyId]);
    if (policyCheck.rows.length === 0) {
      throw new ValidationError('Access policy not found');
    }
  }

  if (contractPolicyId) {
    const policyCheck = await query('SELECT id FROM policies WHERE id = $1', [contractPolicyId]);
    if (policyCheck.rows.length === 0) {
      throw new ValidationError('Contract policy not found');
    }
  }

  // Insert new data offer
  const result = await query(
    `INSERT INTO data_offers 
     (asset_id, access_policy_id, contract_policy_id, price, currency, valid_until, 
      description, status, created_by, provider_organization_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING id, asset_id, access_policy_id, contract_policy_id, price, currency, 
               valid_until, description, status, created_at, updated_at`,
    [
      assetId,
      accessPolicyId,
      contractPolicyId,
      price,
      currency || 'USD',
      validUntil,
      description,
      'draft',
      user.id,
      user.organizationId
    ]
  );

  const newOffer = result.rows[0];

  // Log data offer creation
  await query(
    `INSERT INTO transaction_logs 
     (user_id, organization_id, action_type, target_type, target_id, status, ip_address, user_agent)
     VALUES ($1, $2, 'create', 'data_offer', $3, 'success', $4, $5)`,
    [user.id, user.organizationId, newOffer.id, request.ip || 'unknown', request.headers.get('user-agent') || 'unknown']
  );

  return successResponse({
    message: 'Data offer created successfully',
    dataOffer: {
      id: newOffer.id,
      assetId: newOffer.asset_id,
      accessPolicyId: newOffer.access_policy_id,
      contractPolicyId: newOffer.contract_policy_id,
      price: newOffer.price,
      currency: newOffer.currency,
      validUntil: newOffer.valid_until,
      description: newOffer.description,
      status: newOffer.status,
      createdAt: newOffer.created_at,
      updatedAt: newOffer.updated_at
    }
  });
}

export const GET = asyncHandler(getDataOffersHandler);
export const POST = asyncHandler(createDataOfferHandler);
