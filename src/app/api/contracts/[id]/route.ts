
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import { withAuth } from '@/lib/auth';
import { z } from 'zod';

const updateContractSchema = z.object({
    contractTerms: z.object({
        term: z.string().optional(),
        accessLevel: z.string().optional(),
        usage: z.string().optional(),
        attribution: z.string().optional(),
        liability: z.string().optional(),
        termination: z.string().optional()
    }).optional(),
    status: z.enum(['draft', 'pending', 'active', 'terminated', 'expired']).optional(),
    terminatedAt: z.string().optional()
});

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return withAuth(async (user) => {
        try {
            const { id } = await params;
            const db = await getDatabase();
            
            const query = `
                SELECT 
                    c.*,
                    a.id as asset_id,
                    a.title as asset_title,
                    a.description as asset_description,
                    a.keywords as asset_keywords,
                    a.data_format,
                    a.file_size,
                    p.name as provider_name,
                    p.contact_email as provider_email,
                    cons.name as consumer_name,
                    cons.contact_email as consumer_email,
                    do.price,
                    do.currency,
                    do.valid_from,
                    do.valid_until,
                    ap.name as access_policy_name,
                    cp.name as contract_policy_name,
                    COUNT(dt.id) as transfer_count
                FROM contracts c
                LEFT JOIN data_offers do ON c.data_offer_id = do.id
                LEFT JOIN assets a ON do.asset_id = a.id
                LEFT JOIN organizations p ON c.provider_id = p.id
                LEFT JOIN organizations cons ON c.consumer_id = cons.id
                LEFT JOIN policies ap ON do.access_policy_id = ap.id
                LEFT JOIN policies cp ON do.contract_policy_id = cp.id
                LEFT JOIN data_transfers dt ON c.id = dt.contract_id
                WHERE c.id = $1
                GROUP BY c.id, a.id, p.id, cons.id, do.id, ap.id, cp.id
            `;
            
            const result = await db.query(query, [id]);
            
            if (result.rows.length === 0) {
                return NextResponse.json(
                    { error: 'Contract not found' },
                    { status: 404 }
                );
            }
            
            const row = result.rows[0];
            
            // Check if user has access to this contract
            if (user.organizationId && 
                user.organizationId !== row.provider_id && 
                user.organizationId !== row.consumer_id) {
                return NextResponse.json(
                    { error: 'Access denied' },
                    { status: 403 }
                );
            }
            
            const contract = {
                id: row.id,
                dataOfferId: row.data_offer_id,
                providerId: row.provider_id,
                consumerId: row.consumer_id,
                contractTerms: row.contract_terms,
                signedAt: row.signed_at,
                terminatedAt: row.terminated_at,
                status: row.status,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
                asset: {
                    id: row.asset_id,
                    title: row.asset_title,
                    description: row.asset_description,
                    keywords: row.asset_keywords,
                    dataFormat: row.data_format,
                    fileSize: row.file_size
                },
                provider: {
                    id: row.provider_id,
                    name: row.provider_name,
                    contactEmail: row.provider_email
                },
                consumer: {
                    id: row.consumer_id,
                    name: row.consumer_name,
                    contactEmail: row.consumer_email
                },
                offer: {
                    price: row.price,
                    currency: row.currency,
                    validFrom: row.valid_from,
                    validUntil: row.valid_until
                },
                policies: {
                    access: row.access_policy_name,
                    contract: row.contract_policy_name
                },
                transferCount: parseInt(row.transfer_count) || 0
            };
            
            return NextResponse.json(contract);
            
        } catch (error) {
            console.error('Error fetching contract:', error);
            return NextResponse.json(
                { error: 'Failed to fetch contract' },
                { status: 500 }
            );
        }
    }, request);
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return withAuth(async (user) => {
        try {
            const { id } = await params;
            const body = await request.json();
            const validatedData = updateContractSchema.parse(body);
            
            const db = await getDatabase();
            
            // First, check if contract exists and user has access
            const checkQuery = `
                SELECT c.*, p.name as provider_name, cons.name as consumer_name
                FROM contracts c
                LEFT JOIN organizations p ON c.provider_id = p.id
                LEFT JOIN organizations cons ON c.consumer_id = cons.id
                WHERE c.id = $1
            `;
            
            const checkResult = await db.query(checkQuery, [id]);
            
            if (checkResult.rows.length === 0) {
                return NextResponse.json(
                    { error: 'Contract not found' },
                    { status: 404 }
                );
            }
            
            const existingContract = checkResult.rows[0];
            
            // Check if user has access to modify this contract
            if (user.organizationId && 
                user.organizationId !== existingContract.provider_id && 
                user.organizationId !== existingContract.consumer_id) {
                return NextResponse.json(
                    { error: 'Access denied' },
                    { status: 403 }
                );
            }
            
            // Build dynamic update query
            const updateFields = [];
            const updateValues = [];
            let paramIndex = 1;
            
            if (validatedData.contractTerms) {
                updateFields.push(`contract_terms = $${paramIndex}`);
                updateValues.push(JSON.stringify(validatedData.contractTerms));
                paramIndex++;
            }
            
            if (validatedData.status) {
                updateFields.push(`status = $${paramIndex}`);
                updateValues.push(validatedData.status);
                paramIndex++;
                
                // If terminating contract, set terminated_at
                if (validatedData.status === 'terminated') {
                    updateFields.push(`terminated_at = $${paramIndex}`);
                    updateValues.push(validatedData.terminatedAt ? new Date(validatedData.terminatedAt) : new Date());
                    paramIndex++;
                }
            }
            
            if (updateFields.length === 0) {
                return NextResponse.json(
                    { error: 'No fields to update' },
                    { status: 400 }
                );
            }
            
            updateValues.push(id);
            
            const updateQuery = `
                UPDATE contracts 
                SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
                WHERE id = $${paramIndex}
                RETURNING *
            `;
            
            const result = await db.query(updateQuery, updateValues);
            const updatedContract = result.rows[0];
            
            console.log('Contract updated successfully:', updatedContract.id);
            
            return NextResponse.json({
                id: updatedContract.id,
                dataOfferId: updatedContract.data_offer_id,
                providerId: updatedContract.provider_id,
                consumerId: updatedContract.consumer_id,
                contractTerms: updatedContract.contract_terms,
                signedAt: updatedContract.signed_at,
                terminatedAt: updatedContract.terminated_at,
                status: updatedContract.status,
                createdAt: updatedContract.created_at,
                updatedAt: updatedContract.updated_at
            });
            
        } catch (error) {
            if (error instanceof z.ZodError) {
                return NextResponse.json(
                    { error: 'Validation failed', details: error.errors },
                    { status: 400 }
                );
            }
            
            console.error('Error updating contract:', error);
            return NextResponse.json(
                { error: 'Failed to update contract' },
                { status: 500 }
            );
        }
    }, request);
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return withAuth(async (user) => {
        try {
            const { id } = await params;
            const db = await getDatabase();
            
            // First, check if contract exists and user has access
            const checkQuery = `
                SELECT c.*, COUNT(dt.id) as transfer_count
                FROM contracts c
                LEFT JOIN data_transfers dt ON c.id = dt.contract_id
                WHERE c.id = $1
                GROUP BY c.id
            `;
            
            const checkResult = await db.query(checkQuery, [id]);
            
            if (checkResult.rows.length === 0) {
                return NextResponse.json(
                    { error: 'Contract not found' },
                    { status: 404 }
                );
            }
            
            const contract = checkResult.rows[0];
            
            // Check if user has access to delete this contract
            if (user.organizationId && 
                user.organizationId !== contract.provider_id && 
                user.organizationId !== contract.consumer_id) {
                return NextResponse.json(
                    { error: 'Access denied' },
                    { status: 403 }
                );
            }
            
            // Check if contract has transfers (prevent deletion if active)
            if (parseInt(contract.transfer_count) > 0) {
                return NextResponse.json(
                    { error: 'Cannot delete contract with existing transfers. Terminate the contract instead.' },
                    { status: 400 }
                );
            }
            
            // Delete the contract
            const deleteQuery = 'DELETE FROM contracts WHERE id = $1';
            await db.query(deleteQuery, [id]);
            
            console.log('Contract deleted successfully:', id);
            
            return NextResponse.json({ success: true });
            
        } catch (error) {
            console.error('Error deleting contract:', error);
            return NextResponse.json(
                { error: 'Failed to delete contract' },
                { status: 500 }
            );
        }
    }, request);
}
