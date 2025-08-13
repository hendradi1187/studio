
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { getUserFromRequest } from '@/lib/auth';
import { asyncHandler, AuthenticationError, ValidationError, NotFoundError, successResponse } from '@/lib/errors';
import { updateDataOfferSchema } from '@/lib/validation';

// GET /api/data-offers/[id] - Get data offer by ID
async function getDataOfferHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromRequest(request);
  if (!user) {
    throw new AuthenticationError();
  }

  const { id: offerId } = await params;

  const result = await query(
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
     WHERE do.id = $1`,
    [offerId]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError('Data offer not found');
  }

  const offer = result.rows[0];

  return successResponse({
    dataOffer: {
      id: offer.id,
      assetId: offer.asset_id,
      assetTitle: offer.asset_title,
      assetDescription: offer.asset_description,
      accessPolicyId: offer.access_policy_id,
      accessPolicyName: offer.access_policy_name,
      contractPolicyId: offer.contract_policy_id,
      contractPolicyName: offer.contract_policy_name,
      price: offer.price,
      currency: offer.currency,
      validUntil: offer.valid_until,
      status: offer.status,
      description: offer.description,
      createdAt: offer.created_at,
      updatedAt: offer.updated_at,
      createdBy: offer.created_by_name,
      providerOrganization: offer.provider_organization
    }
  });
}

// PUT /api/data-offers/[id] - Update data offer
async function updateDataOfferHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromRequest(request);
  if (!user) {
    throw new AuthenticationError();
  }

  const { id: offerId } = await params;
  const body = await request.json();

  // Validate input
  const validationResult = updateDataOfferSchema.safeParse(body);
  if (!validationResult.success) {
    throw new ValidationError('Invalid data offer data', validationResult.error.errors);
  }

  // Check if data offer exists
  const existingOffer = await query(
    'SELECT id FROM data_offers WHERE id = $1',
    [offerId]
  );

  if (existingOffer.rows.length === 0) {
    throw new NotFoundError('Data offer not found');
  }

  const updateData = validationResult.data;
  const updateFields: string[] = [];
  const updateValues: any[] = [];
  let paramIndex = 1;

  // Build dynamic update query
  if (updateData.assetId !== undefined) {
    // Verify asset exists
    const assetCheck = await query('SELECT id FROM assets WHERE id = $1', [updateData.assetId]);
    if (assetCheck.rows.length === 0) {
      throw new ValidationError('Asset not found');
    }
    updateFields.push(`asset_id = $${paramIndex}`);
    updateValues.push(updateData.assetId);
    paramIndex++;
  }

  if (updateData.accessPolicyId !== undefined) {
    if (updateData.accessPolicyId) {
      const policyCheck = await query('SELECT id FROM policies WHERE id = $1', [updateData.accessPolicyId]);
      if (policyCheck.rows.length === 0) {
        throw new ValidationError('Access policy not found');
      }
    }
    updateFields.push(`access_policy_id = $${paramIndex}`);
    updateValues.push(updateData.accessPolicyId);
    paramIndex++;
  }

  if (updateData.contractPolicyId !== undefined) {
    if (updateData.contractPolicyId) {
      const policyCheck = await query('SELECT id FROM policies WHERE id = $1', [updateData.contractPolicyId]);
      if (policyCheck.rows.length === 0) {
        throw new ValidationError('Contract policy not found');
      }
    }
    updateFields.push(`contract_policy_id = $${paramIndex}`);
    updateValues.push(updateData.contractPolicyId);
    paramIndex++;
  }

  if (updateData.price !== undefined) {
    updateFields.push(`price = $${paramIndex}`);
    updateValues.push(updateData.price);
    paramIndex++;
  }

  if (updateData.currency !== undefined) {
    updateFields.push(`currency = $${paramIndex}`);
    updateValues.push(updateData.currency);
    paramIndex++;
  }

  if (updateData.validUntil !== undefined) {
    updateFields.push(`valid_until = $${paramIndex}`);
    updateValues.push(updateData.validUntil);
    paramIndex++;
  }

  if (updateData.description !== undefined) {
    updateFields.push(`description = $${paramIndex}`);
    updateValues.push(updateData.description);
    paramIndex++;
  }

  // Always update the updated_at timestamp
  updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

  // Add offer ID for WHERE clause
  updateValues.push(offerId);

  const result = await query(
    `UPDATE data_offers 
     SET ${updateFields.join(', ')}
     WHERE id = $${paramIndex}
     RETURNING id, asset_id, access_policy_id, contract_policy_id, price, currency, 
               valid_until, description, status, created_at, updated_at`,
    updateValues
  );

  const updatedOffer = result.rows[0];

  // Log data offer update
  await query(
    `INSERT INTO transaction_logs 
     (user_id, organization_id, action_type, target_type, target_id, status, ip_address, user_agent)
     VALUES ($1, $2, 'update', 'data_offer', $3, 'success', $4, $5)`,
    [user.id, user.organizationId, offerId, request.ip || 'unknown', request.headers.get('user-agent') || 'unknown']
  );

  return successResponse({
    message: 'Data offer updated successfully',
    dataOffer: {
      id: updatedOffer.id,
      assetId: updatedOffer.asset_id,
      accessPolicyId: updatedOffer.access_policy_id,
      contractPolicyId: updatedOffer.contract_policy_id,
      price: updatedOffer.price,
      currency: updatedOffer.currency,
      validUntil: updatedOffer.valid_until,
      description: updatedOffer.description,
      status: updatedOffer.status,
      createdAt: updatedOffer.created_at,
      updatedAt: updatedOffer.updated_at
    }
  });
}

// DELETE /api/data-offers/[id] - Delete data offer
async function deleteDataOfferHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromRequest(request);
  if (!user) {
    throw new AuthenticationError();
  }

  const { id: offerId } = await params;

  // Check if data offer exists
  const existingOffer = await query(
    'SELECT id, description FROM data_offers WHERE id = $1',
    [offerId]
  );

  if (existingOffer.rows.length === 0) {
    throw new NotFoundError('Data offer not found');
  }

  // Check if data offer is being used by any contracts (business rule)
  const usageCheck = await query(
    'SELECT COUNT(*) as count FROM contracts WHERE data_offer_id = $1',
    [offerId]
  );

  if (parseInt(usageCheck.rows[0].count) > 0) {
    throw new ValidationError('Cannot delete data offer that has active contracts');
  }

  // Delete the data offer
  await query('DELETE FROM data_offers WHERE id = $1', [offerId]);

  // Log data offer deletion
  await query(
    `INSERT INTO transaction_logs 
     (user_id, organization_id, action_type, target_type, target_id, status, ip_address, user_agent)
     VALUES ($1, $2, 'delete', 'data_offer', $3, 'success', $4, $5)`,
    [user.id, user.organizationId, offerId, request.ip || 'unknown', request.headers.get('user-agent') || 'unknown']
  );

  return successResponse({
    message: `Data offer deleted successfully`
  });
}

export const GET = asyncHandler(getDataOfferHandler);
export const PUT = asyncHandler(updateDataOfferHandler);
export const DELETE = asyncHandler(deleteDataOfferHandler);
