
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import { withAuth } from '@/lib/auth';
import { z } from 'zod';

const createTransferSchema = z.object({
    contractId: z.string().min(1, 'Contract ID is required'),
    transferType: z.enum(['download', 'stream', 'api_access']).default('download'),
    filePath: z.string().optional(),
    fileSize: z.number().optional(),
    metadata: z.object({}).optional()
});

export async function GET(request: NextRequest) {
    return withAuth(async (user) => {
        try {
            const { searchParams } = new URL(request.url);
            const page = parseInt(searchParams.get('page') || '1');
            const limit = parseInt(searchParams.get('limit') || '10');
            const search = searchParams.get('search') || '';
            const status = searchParams.get('status') || '';
            const contractId = searchParams.get('contractId') || '';
            const sortBy = searchParams.get('sortBy') || 'created_at';
            const sortOrder = searchParams.get('sortOrder') || 'desc';
            const offset = (page - 1) * limit;

            const db = await getDatabase();
            
            // Build the WHERE clause
            let whereConditions = [];
            let queryParams = [];
            let paramIndex = 1;

            // Add search filter
            if (search) {
                whereConditions.push(`(
                    dt.id ILIKE $${paramIndex} OR 
                    a.title ILIKE $${paramIndex} OR 
                    p.name ILIKE $${paramIndex} OR 
                    cons.name ILIKE $${paramIndex}
                )`);
                queryParams.push(`%${search}%`);
                paramIndex++;
            }

            // Add status filter
            if (status && status !== 'all') {
                whereConditions.push(`dt.transfer_state = $${paramIndex}`);
                queryParams.push(status);
                paramIndex++;
            }

            // Add contract filter
            if (contractId) {
                whereConditions.push(`dt.contract_id = $${paramIndex}`);
                queryParams.push(contractId);
                paramIndex++;
            }

            // Add user organization filter (users can only see transfers their org is involved in)
            if (user.organizationId) {
                whereConditions.push(`(c.provider_id = $${paramIndex} OR c.consumer_id = $${paramIndex})`);
                queryParams.push(user.organizationId);
                paramIndex++;
            }

            const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

            // Get total count
            const countQuery = `
                SELECT COUNT(*) as total
                FROM data_transfers dt
                LEFT JOIN contracts c ON dt.contract_id = c.id
                LEFT JOIN data_offers do ON c.data_offer_id = do.id
                LEFT JOIN assets a ON do.asset_id = a.id
                LEFT JOIN organizations p ON c.provider_id = p.id
                LEFT JOIN organizations cons ON c.consumer_id = cons.id
                ${whereClause}
            `;
            
            const countResult = await db.query(countQuery, queryParams);
            const total = parseInt(countResult.rows[0].total);

            // Get transfers with pagination
            const transfersQuery = `
                SELECT 
                    dt.*,
                    c.id as contract_id,
                    c.status as contract_status,
                    a.id as asset_id,
                    a.title as asset_title,
                    a.description as asset_description,
                    a.data_format,
                    p.name as provider_name,
                    cons.name as consumer_name,
                    do.price,
                    do.currency
                FROM data_transfers dt
                LEFT JOIN contracts c ON dt.contract_id = c.id
                LEFT JOIN data_offers do ON c.data_offer_id = do.id
                LEFT JOIN assets a ON do.asset_id = a.id
                LEFT JOIN organizations p ON c.provider_id = p.id
                LEFT JOIN organizations cons ON c.consumer_id = cons.id
                ${whereClause}
                ORDER BY dt.${sortBy} ${sortOrder.toUpperCase()}
                LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
            `;
            
            queryParams.push(limit, offset);
            const transfersResult = await db.query(transfersQuery, queryParams);
            
            const transfers = transfersResult.rows.map(row => ({
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
                    status: row.contract_status
                },
                asset: {
                    id: row.asset_id,
                    title: row.asset_title,
                    description: row.asset_description,
                    dataFormat: row.data_format
                },
                provider: {
                    name: row.provider_name
                },
                consumer: {
                    name: row.consumer_name
                },
                offer: {
                    price: row.price,
                    currency: row.currency
                }
            }));

            const totalPages = Math.ceil(total / limit);

            return NextResponse.json({
                transfers,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages
                }
            });
            
        } catch (error) {
            console.error('Error fetching transfers:', error);
            return NextResponse.json(
                { error: 'Failed to fetch transfers' },
                { status: 500 }
            );
        }
    }, request);
}

export async function POST(request: NextRequest) {
    return withAuth(async (user) => {
        try {
            const body = await request.json();
            const validatedData = createTransferSchema.parse(body);
            
            const db = await getDatabase();
            
            // Verify the contract exists and user has access
            const contractQuery = `
                SELECT c.*, a.title as asset_title
                FROM contracts c
                LEFT JOIN data_offers do ON c.data_offer_id = do.id
                LEFT JOIN assets a ON do.asset_id = a.id
                WHERE c.id = $1 AND c.status = $2
            `;
            const contractResult = await db.query(contractQuery, [validatedData.contractId, 'active']);
            
            if (contractResult.rows.length === 0) {
                return NextResponse.json(
                    { error: 'Contract not found or not active' },
                    { status: 404 }
                );
            }
            
            const contract = contractResult.rows[0];
            
            // Check if user has access to initiate this transfer
            if (user.organizationId && 
                user.organizationId !== contract.provider_id && 
                user.organizationId !== contract.consumer_id) {
                return NextResponse.json(
                    { error: 'Access denied' },
                    { status: 403 }
                );
            }
            
            // Create transfer
            const transferId = 'transfer_' + Math.random().toString(36).substr(2, 9);
            
            const insertQuery = `
                INSERT INTO data_transfers (
                    id, contract_id, transfer_type, transfer_state, 
                    file_path, file_size, bytes_transferred,
                    transfer_start, metadata
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING *
            `;
            
            const transferResult = await db.query(insertQuery, [
                transferId,
                validatedData.contractId,
                validatedData.transferType,
                'initiated',
                validatedData.filePath || null,
                validatedData.fileSize || null,
                0,
                new Date(),
                JSON.stringify(validatedData.metadata || {})
            ]);
            
            const transfer = transferResult.rows[0];
            
            console.log('Transfer initiated successfully:', transfer.id);
            
            return NextResponse.json({
                id: transfer.id,
                contractId: transfer.contract_id,
                transferType: transfer.transfer_type,
                transferState: transfer.transfer_state,
                filePath: transfer.file_path,
                fileSize: transfer.file_size,
                bytesTransferred: transfer.bytes_transferred,
                transferStart: transfer.transfer_start,
                createdAt: transfer.created_at
            }, { status: 201 });
            
        } catch (error) {
            if (error instanceof z.ZodError) {
                return NextResponse.json(
                    { error: 'Validation failed', details: error.errors },
                    { status: 400 }
                );
            }
            
            console.error('Error creating transfer:', error);
            return NextResponse.json(
                { error: 'Failed to create transfer' },
                { status: 500 }
            );
        }
    }, request);
}
