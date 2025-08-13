import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import { withAuth } from '@/lib/auth';
import { z } from 'zod';

const updateTransferSchema = z.object({
    transferState: z.enum(['initiated', 'in_progress', 'completed', 'failed', 'cancelled']).optional(),
    bytesTransferred: z.number().optional(),
    errorMessage: z.string().optional(),
    metadata: z.object({}).optional()
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
                    dt.*,
                    c.id as contract_id,
                    c.status as contract_status,
                    c.signed_at as contract_signed_at,
                    a.id as asset_id,
                    a.title as asset_title,
                    a.description as asset_description,
                    a.data_format,
                    a.file_size as asset_file_size,
                    a.keywords,
                    p.name as provider_name,
                    p.contact_email as provider_email,
                    cons.name as consumer_name,
                    cons.contact_email as consumer_email,
                    do.price,
                    do.currency,
                    do.valid_from,
                    do.valid_until
                FROM data_transfers dt
                LEFT JOIN contracts c ON dt.contract_id = c.id
                LEFT JOIN data_offers do ON c.data_offer_id = do.id
                LEFT JOIN assets a ON do.asset_id = a.id
                LEFT JOIN organizations p ON c.provider_id = p.id
                LEFT JOIN organizations cons ON c.consumer_id = cons.id
                WHERE dt.id = $1
            `;
            
            const result = await db.query(query, [id]);
            
            if (result.rows.length === 0) {
                return NextResponse.json(
                    { error: 'Transfer not found' },
                    { status: 404 }
                );
            }
            
            const row = result.rows[0];
            
            // Check if user has access to this transfer
            if (user.organizationId && 
                user.organizationId !== row.provider_id && 
                user.organizationId !== row.consumer_id) {
                return NextResponse.json(
                    { error: 'Access denied' },
                    { status: 403 }
                );
            }
            
            const transfer = {
                id: row.id,
                contractId: row.contract_id,
                transferType: row.transfer_type,
                transferState: row.transfer_state,
                filePath: row.file_path,
                fileSize: row.file_size,
                bytesTransferred: row.bytes_transferred,
                transferStart: row.transfer_start,
                transferEnd: row.transfer_end,
                errorMessage: row.error_message,
                metadata: row.metadata,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
                contract: {
                    id: row.contract_id,
                    status: row.contract_status,
                    signedAt: row.contract_signed_at
                },
                asset: {
                    id: row.asset_id,
                    title: row.asset_title,
                    description: row.asset_description,
                    dataFormat: row.data_format,
                    fileSize: row.asset_file_size,
                    keywords: row.keywords
                },
                provider: {
                    name: row.provider_name,
                    contactEmail: row.provider_email
                },
                consumer: {
                    name: row.consumer_name,
                    contactEmail: row.consumer_email
                },
                offer: {
                    price: row.price,
                    currency: row.currency,
                    validFrom: row.valid_from,
                    validUntil: row.valid_until
                }
            };
            
            return NextResponse.json(transfer);
            
        } catch (error) {
            console.error('Error fetching transfer:', error);
            return NextResponse.json(
                { error: 'Failed to fetch transfer' },
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
            const validatedData = updateTransferSchema.parse(body);
            
            const db = await getDatabase();
            
            // First, check if transfer exists and user has access
            const checkQuery = `
                SELECT dt.*, c.provider_id, c.consumer_id
                FROM data_transfers dt
                LEFT JOIN contracts c ON dt.contract_id = c.id
                WHERE dt.id = $1
            `;
            
            const checkResult = await db.query(checkQuery, [id]);
            
            if (checkResult.rows.length === 0) {
                return NextResponse.json(
                    { error: 'Transfer not found' },
                    { status: 404 }
                );
            }
            
            const existingTransfer = checkResult.rows[0];
            
            // Check if user has access to modify this transfer
            if (user.organizationId && 
                user.organizationId !== existingTransfer.provider_id && 
                user.organizationId !== existingTransfer.consumer_id) {
                return NextResponse.json(
                    { error: 'Access denied' },
                    { status: 403 }
                );
            }
            
            // Build dynamic update query
            const updateFields = [];
            const updateValues = [];
            let paramIndex = 1;
            
            if (validatedData.transferState) {
                updateFields.push(`transfer_state = $${paramIndex}`);
                updateValues.push(validatedData.transferState);
                paramIndex++;
                
                // Set transfer_end if completing
                if (validatedData.transferState === 'completed' || validatedData.transferState === 'failed') {
                    updateFields.push(`transfer_end = $${paramIndex}`);
                    updateValues.push(new Date());
                    paramIndex++;
                }
            }
            
            if (validatedData.bytesTransferred !== undefined) {
                updateFields.push(`bytes_transferred = $${paramIndex}`);
                updateValues.push(validatedData.bytesTransferred);
                paramIndex++;
            }
            
            if (validatedData.errorMessage !== undefined) {
                updateFields.push(`error_message = $${paramIndex}`);
                updateValues.push(validatedData.errorMessage);
                paramIndex++;
            }
            
            if (validatedData.metadata) {
                updateFields.push(`metadata = $${paramIndex}`);
                updateValues.push(JSON.stringify(validatedData.metadata));
                paramIndex++;
            }
            
            if (updateFields.length === 0) {
                return NextResponse.json(
                    { error: 'No fields to update' },
                    { status: 400 }
                );
            }
            
            updateValues.push(id);
            
            const updateQuery = `
                UPDATE data_transfers 
                SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
                WHERE id = $${paramIndex}
                RETURNING *
            `;
            
            const result = await db.query(updateQuery, updateValues);
            const updatedTransfer = result.rows[0];
            
            console.log('Transfer updated successfully:', updatedTransfer.id);
            
            return NextResponse.json({
                id: updatedTransfer.id,
                contractId: updatedTransfer.contract_id,
                transferType: updatedTransfer.transfer_type,
                transferState: updatedTransfer.transfer_state,
                filePath: updatedTransfer.file_path,
                fileSize: updatedTransfer.file_size,
                bytesTransferred: updatedTransfer.bytes_transferred,
                transferStart: updatedTransfer.transfer_start,
                transferEnd: updatedTransfer.transfer_end,
                errorMessage: updatedTransfer.error_message,
                metadata: updatedTransfer.metadata,
                createdAt: updatedTransfer.created_at,
                updatedAt: updatedTransfer.updated_at
            });
            
        } catch (error) {
            if (error instanceof z.ZodError) {
                return NextResponse.json(
                    { error: 'Validation failed', details: error.errors },
                    { status: 400 }
                );
            }
            
            console.error('Error updating transfer:', error);
            return NextResponse.json(
                { error: 'Failed to update transfer' },
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
            
            // First, check if transfer exists and user has access
            const checkQuery = `
                SELECT dt.*, c.provider_id, c.consumer_id
                FROM data_transfers dt
                LEFT JOIN contracts c ON dt.contract_id = c.id
                WHERE dt.id = $1
            `;
            
            const checkResult = await db.query(checkQuery, [id]);
            
            if (checkResult.rows.length === 0) {
                return NextResponse.json(
                    { error: 'Transfer not found' },
                    { status: 404 }
                );
            }
            
            const transfer = checkResult.rows[0];
            
            // Check if user has access to delete this transfer
            if (user.organizationId && 
                user.organizationId !== transfer.provider_id && 
                user.organizationId !== transfer.consumer_id) {
                return NextResponse.json(
                    { error: 'Access denied' },
                    { status: 403 }
                );
            }
            
            // Only allow deletion of failed or cancelled transfers
            if (transfer.transfer_state !== 'failed' && transfer.transfer_state !== 'cancelled') {
                return NextResponse.json(
                    { error: 'Can only delete failed or cancelled transfers' },
                    { status: 400 }
                );
            }
            
            // Delete the transfer
            const deleteQuery = 'DELETE FROM data_transfers WHERE id = $1';
            await db.query(deleteQuery, [id]);
            
            console.log('Transfer deleted successfully:', id);
            
            return NextResponse.json({ success: true });
            
        } catch (error) {
            console.error('Error deleting transfer:', error);
            return NextResponse.json(
                { error: 'Failed to delete transfer' },
                { status: 500 }
            );
        }
    }, request);
}