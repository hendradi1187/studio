import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, type DbClient } from '@/lib/database';
import { withAuth } from '@/lib/auth';
import { z } from 'zod';

const createContractSchema = z.object({
    dataOfferId: z.string().min(1, 'Data offer ID is required'),
    consumerId: z.string().min(1, 'Consumer organization ID is required'),
    contractTerms: z.object({
        term: z.string().optional(),
        accessLevel: z.string().optional(),
        usage: z.string().optional(),
        attribution: z.string().optional(),
        liability: z.string().optional(),
        termination: z.string().optional()
    }).optional(),
    signedAt: z.string().optional()
});

export async function GET(request: NextRequest) {
    return withAuth(async (user) => {
        try {
            const { searchParams } = new URL(request.url);
            const page = parseInt(searchParams.get('page') || '1');
            const limit = parseInt(searchParams.get('limit') || '10');
            const search = searchParams.get('search') || '';
            const status = searchParams.get('status') || '';
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
                    c.id ILIKE $${paramIndex} OR 
                    a.title ILIKE $${paramIndex} OR 
                    p.name ILIKE $${paramIndex} OR 
                    cons.name ILIKE $${paramIndex}
                )`);
                queryParams.push(`%${search}%`);
                paramIndex++;
            }

            // Add status filter
            if (status && status !== 'all') {
                whereConditions.push(`c.status = $${paramIndex}`);
                queryParams.push(status);
                paramIndex++;
            }

            // Add user organization filter (users can only see contracts their org is involved in)
            if (user.organizationId) {
                whereConditions.push(`(c.provider_id = $${paramIndex} OR c.consumer_id = $${paramIndex})`);
                queryParams.push(user.organizationId);
                paramIndex++;
            }

            const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

            // Get total count
            const countQuery = `
                SELECT COUNT(*) as total
                FROM contracts c
                LEFT JOIN data_offers do ON c.data_offer_id = do.id
                LEFT JOIN assets a ON do.asset_id = a.id
                LEFT JOIN organizations p ON c.provider_id = p.id
                LEFT JOIN organizations cons ON c.consumer_id = cons.id
                ${whereClause}
            `;
            
            const countResult = await db.query(countQuery, queryParams);
            const total = parseInt(countResult.rows[0].total);

            // Get contracts with pagination
            const contractsQuery = `
                SELECT 
                    c.id,
                    c.data_offer_id,
                    c.provider_id,
                    c.consumer_id,
                    c.contract_terms,
                    c.signed_at,
                    c.terminated_at,
                    c.status,
                    c.created_at,
                    c.updated_at,
                    a.id as asset_id,
                    a.title as asset_title,
                    a.description as asset_description,
                    p.name as provider_name,
                    cons.name as consumer_name,
                    do.price,
                    do.currency,
                    COUNT(dt.id) as transfer_count
                FROM contracts c
                LEFT JOIN data_offers do ON c.data_offer_id = do.id
                LEFT JOIN assets a ON do.asset_id = a.id
                LEFT JOIN organizations p ON c.provider_id = p.id
                LEFT JOIN organizations cons ON c.consumer_id = cons.id
                LEFT JOIN data_transfers dt ON c.id = dt.contract_id
                ${whereClause}
                GROUP BY c.id, a.id, a.title, a.description, p.name, cons.name, do.price, do.currency
                ORDER BY c.${sortBy} ${sortOrder.toUpperCase()}
                LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
            `;
            
            queryParams.push(limit, offset);
            const contractsResult = await db.query(contractsQuery, queryParams);
            
            const contracts = contractsResult.rows.map(row => ({
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
                    description: row.asset_description
                },
                provider: {
                    id: row.provider_id,
                    name: row.provider_name
                },
                consumer: {
                    id: row.consumer_id,
                    name: row.consumer_name
                },
                price: row.price,
                currency: row.currency,
                transferCount: parseInt(row.transfer_count) || 0
            }));

            const totalPages = Math.ceil(total / limit);

            return NextResponse.json({
                contracts,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages
                }
            });
            
        } catch (error) {
            console.error('Error fetching contracts:', error);
            return NextResponse.json(
                { error: 'Failed to fetch contracts' },
                { status: 500 }
            );
        }
    }, request);
}

export async function POST(request: NextRequest) {
    return withAuth(async (user) => {
        try {
            const body = await request.json();
            const validatedData = createContractSchema.parse(body);
            
            const db = await getDatabase();
            
            // Verify the data offer exists
            const offerQuery = 'SELECT * FROM data_offers WHERE id = $1 AND status = $2';
            const offerResult = await db.query(offerQuery, [validatedData.dataOfferId, 'active']);
            
            if (offerResult.rows.length === 0) {
                return NextResponse.json(
                    { error: 'Data offer not found or not active' },
                    { status: 404 }
                );
            }
            
            const offer = offerResult.rows[0];
            
            // Verify consumer organization exists
            const consumerQuery = 'SELECT * FROM organizations WHERE id = $1 AND status = $2';
            const consumerResult = await db.query(consumerQuery, [validatedData.consumerId, 'active']);
            
            if (consumerResult.rows.length === 0) {
                return NextResponse.json(
                    { error: 'Consumer organization not found or not active' },
                    { status: 404 }
                );
            }
            
            // Create contract
            const contractId = 'contract_' + Math.random().toString(36).substr(2, 9);
            const signedAt = validatedData.signedAt ? new Date(validatedData.signedAt) : new Date();
            
            const insertQuery = `
                INSERT INTO contracts (
                    id, data_offer_id, provider_id, consumer_id, 
                    contract_terms, signed_at, status
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *
            `;
            
            const contractResult = await db.query(insertQuery, [
                contractId,
                validatedData.dataOfferId,
                offer.provider_id,
                validatedData.consumerId,
                JSON.stringify(validatedData.contractTerms || {}),
                signedAt,
                'active'
            ]);
            
            const contract = contractResult.rows[0];
            
            console.log('Contract created successfully:', contract.id);
            
            return NextResponse.json({
                id: contract.id,
                dataOfferId: contract.data_offer_id,
                providerId: contract.provider_id,
                consumerId: contract.consumer_id,
                contractTerms: contract.contract_terms,
                signedAt: contract.signed_at,
                status: contract.status,
                createdAt: contract.created_at
            }, { status: 201 });
            
        } catch (error) {
            if (error instanceof z.ZodError) {
                return NextResponse.json(
                    { error: 'Validation failed', details: error.errors },
                    { status: 400 }
                );
            }
            
            console.error('Error creating contract:', error);
            return NextResponse.json(
                { error: 'Failed to create contract' },
                { status: 500 }
            );
        }
    }, request);
}
