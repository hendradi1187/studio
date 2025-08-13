import { Pool, PoolClient } from 'pg';

// Database configuration
const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'spektra_db',
  password: process.env.DB_PASSWORD || 'password',
  port: parseInt(process.env.DB_PORT || '5432'),
  max: 20, // maximum number of clients in the pool
  idleTimeoutMillis: 30000, // close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // return an error after 2 seconds if connection could not be established
};

// Create connection pool
let pool: Pool;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool(dbConfig);
    
    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      process.exit(-1);
    });
  }
  return pool;
}

// Get a client from the pool
export async function getClient(): Promise<PoolClient> {
  const pool = getPool();
  return await pool.connect();
}

// Mock mode for development without database
const MOCK_MODE = process.env.NODE_ENV === 'development' && process.env.ENABLE_MOCK_DB === 'true';

// Execute a query with automatic client management
export async function query(text: string, params?: any[]): Promise<any> {
  if (MOCK_MODE) {
    console.log('🔄 MOCK DB Query:', text, params);
    
    // Mock responses for testing
    
    // Login query
    if (text.includes('SELECT') && text.includes('users') && text.includes('email') && text.includes('password_hash')) {
      return {
        rows: [
          {
            id: 'usr01',
            email: 'admin@spektra.com',
            name: 'Admin User',
            password_hash: '$2b$12$DBtSj3sm.ozvvqpWJ7ggYe96QxG/YE8tLDHKilngsfr.TyaFp.lMq', // 'password123'
            organization_id: 'org_skkmigas',
            role_id: 'role_regulator',
            status: 'active',
            organization_name: 'SKK Migas',
            role_name: 'Regulator (SKK Migas)',
            profile_photo: null
          }
        ]
      };
    }
    
    // /api/auth/me query
    if (text.includes('LEFT JOIN organizations') && text.includes('LEFT JOIN user_roles') && text.includes('profile_photo')) {
      return {
        rows: [
          {
            id: 'usr01',
            email: 'admin@spektra.com',
            name: 'Admin User',
            organization_id: 'org_skkmigas',
            role_id: 'role_regulator',
            status: 'active',
            last_login: new Date().toISOString(),
            profile_photo: null,
            organization_name: 'SKK Migas',
            organization_type: 'regulator',
            role_name: 'Regulator (SKK Migas)',
            permissions: ['read', 'write', 'admin']
          }
        ]
      };
    }
    
    if (text.includes('UPDATE users SET last_login')) {
      return { rows: [], rowCount: 1 };
    }
    
    if (text.includes('UPDATE users SET profile_photo')) {
      return { 
        rows: [{ 
          id: 'usr01', 
          profile_photo: params?.[0] || null 
        }], 
        rowCount: 1 
      };
    }
    
    if (text.includes('INSERT INTO transaction_logs')) {
      return { rows: [], rowCount: 1 };
    }

    // Mock vocabulary terms queries
    if (text.includes('SELECT') && text.includes('FROM vocabulary_terms vt') && text.includes('COUNT(*) as total')) {
      return { rows: [{ total: 15 }] };
    }

    if (text.includes('SELECT') && text.includes('FROM vocabulary_terms vt') && text.includes('LEFT JOIN vocabulary_terms parent')) {
      // Mock vocabulary terms data
      const mockVocabularyTerms = [
        // Root level terms (Level 0)
        {
          id: 'vocab_001',
          term: 'Seismic',
          description: 'Seismic data and related terminology',
          parent_id: null,
          parent_term: null,
          level: 0,
          sort_order: 1,
          children_count: '3',
          assets_count: '5',
          created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
          updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        },
        {
          id: 'vocab_002',
          term: 'Well (Sumur)',
          description: 'Well-related data and measurements',
          parent_id: null,
          parent_term: null,
          level: 0,
          sort_order: 2,
          children_count: '3',
          assets_count: '8',
          created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
          updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        },
        {
          id: 'vocab_003',
          term: 'Production',
          description: 'Production data and measurements',
          parent_id: null,
          parent_term: null,
          level: 0,
          sort_order: 3,
          children_count: '0',
          assets_count: '3',
          created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
          updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        },
        {
          id: 'vocab_004',
          term: 'Reservoir',
          description: 'Reservoir characterization and properties',
          parent_id: null,
          parent_term: null,
          level: 0,
          sort_order: 4,
          children_count: '0',
          assets_count: '2',
          created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
          updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        },
        
        // Level 1 - Seismic children
        {
          id: 'vocab_101',
          term: '2D Seismic',
          description: 'Two-dimensional seismic survey data',
          parent_id: 'vocab_001',
          parent_term: 'Seismic',
          level: 1,
          sort_order: 1,
          children_count: '0',
          assets_count: '2',
          created_at: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000),
          updated_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
        },
        {
          id: 'vocab_102',
          term: '3D Seismic',
          description: 'Three-dimensional seismic survey data',
          parent_id: 'vocab_001',
          parent_term: 'Seismic',
          level: 1,
          sort_order: 2,
          children_count: '0',
          assets_count: '4',
          created_at: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000),
          updated_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
        },
        {
          id: 'vocab_103',
          term: '4D Seismic',
          description: 'Time-lapse seismic monitoring data',
          parent_id: 'vocab_001',
          parent_term: 'Seismic',
          level: 1,
          sort_order: 3,
          children_count: '0',
          assets_count: '1',
          created_at: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000),
          updated_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
        },

        // Level 1 - Well children
        {
          id: 'vocab_201',
          term: 'Well Log',
          description: 'Wireline logging data and measurements',
          parent_id: 'vocab_002',
          parent_term: 'Well (Sumur)',
          level: 1,
          sort_order: 1,
          children_count: '4',
          assets_count: '6',
          created_at: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000),
          updated_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
        },
        {
          id: 'vocab_202',
          term: 'Drill Cuttings',
          description: 'Rock samples from drilling operations',
          parent_id: 'vocab_002',
          parent_term: 'Well (Sumur)',
          level: 1,
          sort_order: 2,
          children_count: '0',
          assets_count: '3',
          created_at: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000),
          updated_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
        },
        {
          id: 'vocab_203',
          term: 'Core Data',
          description: 'Core samples and analysis data',
          parent_id: 'vocab_002',
          parent_term: 'Well (Sumur)',
          level: 1,
          sort_order: 3,
          children_count: '0',
          assets_count: '2',
          created_at: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000),
          updated_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
        },

        // Level 2 - Well Log children
        {
          id: 'vocab_301',
          term: 'Gamma Ray',
          description: 'Natural gamma radiation measurements',
          parent_id: 'vocab_201',
          parent_term: 'Well Log',
          level: 2,
          sort_order: 1,
          children_count: '0',
          assets_count: '4',
          created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
          updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
        },
        {
          id: 'vocab_302',
          term: 'Resistivity',
          description: 'Formation resistivity measurements',
          parent_id: 'vocab_201',
          parent_term: 'Well Log',
          level: 2,
          sort_order: 2,
          children_count: '0',
          assets_count: '3',
          created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
          updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
        },
        {
          id: 'vocab_303',
          term: 'Neutron Porosity',
          description: 'Neutron-derived porosity measurements',
          parent_id: 'vocab_201',
          parent_term: 'Well Log',
          level: 2,
          sort_order: 3,
          children_count: '0',
          assets_count: '2',
          created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
          updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
        },
        {
          id: 'vocab_304',
          term: 'Bulk Density',
          description: 'Formation bulk density measurements',
          parent_id: 'vocab_201',
          parent_term: 'Well Log',
          level: 2,
          sort_order: 4,
          children_count: '0',
          assets_count: '1',
          created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
          updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
        }
      ];

      return { rows: mockVocabularyTerms };
    }

    // Mock single vocabulary term query
    if (text.includes('SELECT') && text.includes('FROM vocabulary_terms vt') && text.includes('WHERE vt.id = $1')) {
      const termId = params?.[0];
      const mockTerm = {
        id: termId || 'vocab_001',
        term: 'Seismic',
        description: 'Seismic data and related terminology',
        parent_id: null,
        parent_term: null,
        level: 0,
        sort_order: 1,
        children_count: '3',
        assets_count: '5',
        created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      };
      return { rows: [mockTerm] };
    }

    // Mock vocabulary term children query
    if (text.includes('SELECT') && text.includes('FROM vocabulary_terms vt') && text.includes('WHERE parent_id = $1')) {
      return { rows: [] }; // Return empty children for mock
    }

    // Mock vocabulary term creation
    if (text.includes('INSERT INTO vocabulary_terms')) {
      return {
        rows: [{
          id: 'vocab_' + Math.random().toString(36).substr(2, 8),
          term: params?.[0] || 'New Term',
          description: params?.[2] || null,
          parent_id: params?.[1] || null,
          level: params?.[3] || 0,
          sort_order: params?.[4] || 0,
          created_at: new Date()
        }]
      };
    }

    // Mock vocabulary term update
    if (text.includes('UPDATE vocabulary_terms')) {
      return {
        rows: [{
          id: params?.[params.length - 1] || 'vocab_001',
          term: params?.[0] || 'Updated Term',
          description: params?.[1] || null,
          parent_id: params?.[2] || null,
          level: params?.[3] || 0,
          sort_order: params?.[4] || 0,
          updated_at: new Date()
        }]
      };
    }

    // Mock vocabulary term existence check
    if (text.includes('SELECT id FROM vocabulary_terms') && text.includes('WHERE term = $1')) {
      return { rows: [] }; // No duplicates in mock
    }
    
    // Mock responses for users list
    if (text.includes('SELECT COUNT(*) as total') && text.includes('users')) {
      return { rows: [{ total: 5 }] };
    }
    
    if (text.includes('SELECT u.id, u.email, u.name') && text.includes('LIMIT')) {
      return {
        rows: [
          {
            id: 'usr01',
            email: 'admin@spektra.com',
            name: 'Admin User',
            status: 'active',
            last_login: new Date(),
            created_at: new Date(),
            organization_id: 'org_skkmigas',
            organization_name: 'SKK Migas',
            organization_type: 'regulator',
            role_id: 'role_regulator',
            role_name: 'Regulator (SKK Migas)'
          },
          {
            id: 'usr02',
            email: 'user@phe.co.id',
            name: 'PHE User',
            status: 'active',
            last_login: new Date(),
            created_at: new Date(),
            organization_id: 'org_phe',
            organization_name: 'PHE',
            organization_type: 'kkks',
            role_id: 'role_kkks_admin',
            role_name: 'KKKS Admin'
          }
        ]
      };
    }
    
    // Mock LDAP operations
    if (text.includes('INSERT INTO ldap_configurations')) {
      return { rows: [{ id: 'ldap_' + Math.random().toString(36).substr(2, 8) }] };
    }
    
    if (text.includes('SELECT') && text.includes('ldap_configurations')) {
      return {
        rows: [
          {
            id: 'ldap_001',
            name: 'Main LDAP Server',
            server_url: 'ldap://spektra.com:389',
            bind_dn: 'cn=admin,dc=spektra,dc=com',
            base_dn: 'ou=users,dc=spektra,dc=com',
            enabled: true,
            ssl_enabled: false,
            port: 389,
            timeout: 5000
          }
        ]
      };
    }
    
    if (text.includes('INSERT INTO users') && text.includes('ldap')) {
      return { 
        rows: [{ 
          id: 'usr_ldap_' + Math.random().toString(36).substr(2, 8),
          email: 'ldapuser@spektra.com',
          name: 'LDAP User'
        }] 
      };
    }

    // Mock responses for assets
    if (text.includes('COUNT(*) as total') && text.includes('assets')) {
      return { rows: [{ total: '3' }] };
    }
    
    if (text.includes('SELECT a.id, a.title') && text.includes('assets')) {
      return {
        rows: [
          {
            id: 'ds001',
            title: 'Seismic Survey Block A-1',
            description: 'Comprehensive 3D seismic survey data',
            abstract: 'Comprehensive 3D seismic survey data for exploration block A-1, covering an area of 500 sq km.',
            access_status: 'restricted',
            data_format: '.sgy, .txt, .json',
            file_size: 52428800000,
            keywords: 'seismic, 3D, exploration',
            geographic_area: 'East Java Basin',
            time_period_start: '2023-01-01',
            time_period_end: '2023-12-31',
            version: '1.0',
            created_at: new Date(),
            updated_at: new Date(),
            owner_organization_name: 'PHE',
            owner_organization_type: 'kkks',
            vocabulary_count: 2
          },
          {
            id: 'ds002',
            title: 'Well Log Data - Well X-7',
            description: 'Complete suite of wireline logs',
            abstract: 'Complete suite of wireline logs from the exploratory well X-7.',
            access_status: 'open',
            data_format: '.las, .pdf',
            file_size: 104857600,
            keywords: 'well log, wireline, gamma ray',
            geographic_area: 'Natuna Sea',
            time_period_start: '2023-09-01',
            time_period_end: '2023-09-30',
            version: '1.0',
            created_at: new Date(),
            updated_at: new Date(),
            owner_organization_name: 'MEDCO',
            owner_organization_type: 'kkks',
            vocabulary_count: 1
          }
        ]
      };
    }
    
    // Mock vocabulary for assets
    if (text.includes('SELECT vt.id, vt.term, vt.level') && text.includes('asset_vocabulary')) {
      return {
        rows: [
          { id: 'vocab_seismic_3d', term: '3D Seismic Data', level: 1 },
          { id: 'vocab_working_area', term: 'Working Area', level: 0 }
        ]
      };
    }
    
    // Mock responses for policies
    if (text.includes('COUNT(*) as total') && text.includes('policies')) {
      return { rows: [{ total: '4' }] };
    }
    
    if (text.includes('SELECT') && text.includes('policies') && text.includes('LEFT JOIN users')) {
      return {
        rows: [
          {
            id: 'pol_001',
            name: 'Public Read Access Policy',
            description: 'Allows public access to non-sensitive datasets',
            policy_type: 'access',
            policy_rules: JSON.stringify({
              permissions: [
                { id: 'p1', action: 'read', resource: 'dataset', description: 'Allow reading dataset content' },
                { id: 'p2', action: 'download', resource: 'metadata', description: 'Allow downloading metadata' }
              ],
              prohibitions: [
                { id: 'pr1', action: 'modify', resource: 'dataset', description: 'Prohibit any modifications' }
              ],
              obligations: [
                { id: 'o1', action: 'log', resource: 'access', description: 'Log all access attempts' }
              ]
            }),
            permissions_count: 2,
            prohibitions_count: 1,
            obligations_count: 1,
            status: 'active',
            created_at: new Date(),
            updated_at: new Date(),
            created_by_name: 'Admin User'
          },
          {
            id: 'pol_002', 
            name: 'Internal Access Control',
            description: 'Role-based access for internal users',
            policy_type: 'access',
            policy_rules: JSON.stringify({
              permissions: [
                { id: 'p1', action: 'read', resource: 'dataset', description: 'Read access for authorized roles' }
              ],
              prohibitions: [
                { id: 'pr1', action: 'access', resource: 'dataset', description: 'Block after-hours access' }
              ],
              obligations: [
                { id: 'o1', action: 'notify', resource: 'admin', description: 'Notify admin of access' }
              ]
            }),
            permissions_count: 1,
            prohibitions_count: 1,
            obligations_count: 1,
            status: 'active',
            created_at: new Date(),
            updated_at: new Date(),
            created_by_name: 'Admin User'
          },
          {
            id: 'pol_003',
            name: 'Commercial Data License',
            description: 'Commercial licensing with payment terms',
            policy_type: 'contract',
            policy_rules: JSON.stringify({
              permissions: [
                { id: 'p1', action: 'use', resource: 'dataset', description: 'Allow commercial use with payment' }
              ],
              prohibitions: [
                { id: 'pr1', action: 'resell', resource: 'raw_dataset', description: 'Prohibit reselling raw data' }
              ],
              obligations: [
                { id: 'o1', action: 'pay', resource: 'license_fee', description: 'Pay quarterly fees' }
              ]
            }),
            permissions_count: 1,
            prohibitions_count: 1,
            obligations_count: 1,
            status: 'draft',
            created_at: new Date(),
            updated_at: new Date(),
            created_by_name: 'Admin User'
          },
          {
            id: 'pol_004',
            name: 'Rate Limited API Access',
            description: 'Controls API request frequency and volume',
            policy_type: 'usage',
            policy_rules: JSON.stringify({
              permissions: [
                { id: 'p1', action: 'query', resource: 'api', description: 'Allow up to 100 requests per minute' }
              ],
              prohibitions: [
                { id: 'pr1', action: 'bulk_download', resource: 'dataset', description: 'Prohibit bulk downloads' }
              ],
              obligations: [
                { id: 'o1', action: 'throttle', resource: 'requests', description: 'Apply throttling when exceeded' }
              ]
            }),
            permissions_count: 1,
            prohibitions_count: 1,
            obligations_count: 1,
            status: 'active',
            created_at: new Date(),
            updated_at: new Date(),
            created_by_name: 'Admin User'
          }
        ]
      };
    }
    
    // Mock single policy by ID
    if (text.includes('SELECT') && text.includes('policies p') && text.includes('WHERE p.id = $1')) {
      const policyId = params?.[0];
      const mockPolicies = [
        {
          id: 'pol_001',
          name: 'Public Read Access Policy',
          description: 'Allows public access to non-sensitive datasets',
          policy_type: 'access',
          policy_rules: {
            permissions: [
              { id: 'p1', action: 'read', resource: 'dataset', description: 'Allow reading dataset content' },
              { id: 'p2', action: 'download', resource: 'metadata', description: 'Allow downloading metadata' }
            ],
            prohibitions: [
              { id: 'pr1', action: 'modify', resource: 'dataset', description: 'Prohibit any modifications' }
            ],
            obligations: [
              { id: 'o1', action: 'log', resource: 'access', description: 'Log all access attempts' }
            ]
          },
          permissions_count: 2,
          prohibitions_count: 1,
          obligations_count: 1,
          status: 'active',
          created_at: new Date(),
          updated_at: new Date(),
          created_by_id: 'usr01',
          created_by_name: 'Admin User'
        }
      ];
      
      const policy = mockPolicies.find(p => p.id === policyId) || mockPolicies[0];
      return { rows: [policy] };
    }
    
    // Mock policy creation
    if (text.includes('INSERT INTO policies')) {
      return {
        rows: [{
          id: 'pol_' + Math.random().toString(36).substr(2, 3),
          name: params?.[0] || 'New Policy',
          description: params?.[1] || '',
          policy_type: params?.[2] || 'access',
          policy_rules: params?.[3] || '{}',
          permissions_count: params?.[4] || 0,
          prohibitions_count: params?.[5] || 0,
          obligations_count: params?.[6] || 0,
          status: params?.[7] || 'draft',
          created_at: new Date(),
          updated_at: new Date()
        }]
      };
    }
    
    // Mock policy update
    if (text.includes('UPDATE policies') && text.includes('SET') && text.includes('WHERE id =')) {
      return {
        rows: [{
          id: params?.[params.length - 1] || 'pol_001',
          name: 'Updated Policy',
          description: 'Updated description',
          policy_type: 'access',
          policy_rules: {},
          permissions_count: 1,
          prohibitions_count: 0,
          obligations_count: 0,
          status: 'draft',
          created_at: new Date(),
          updated_at: new Date()
        }]
      };
    }
    
    // Mock policy deletion
    if (text.includes('DELETE FROM policies WHERE id =')) {
      return { rows: [], rowCount: 1 };
    }
    
    // Mock policy usage check
    if (text.includes('SELECT COUNT(*) as count FROM data_offers WHERE access_policy_id')) {
      return { rows: [{ count: 0 }] };
    }
    
    // Mock responses for data offers
    if (text.includes('COUNT(*) as total') && text.includes('data_offers')) {
      return { rows: [{ total: '3' }] };
    }
    
    if (text.includes('SELECT') && text.includes('data_offers do') && text.includes('LEFT JOIN assets a')) {
      return {
        rows: [
          {
            id: 'offer_001',
            asset_id: 'ds001',
            access_policy_id: 'pol_001',
            contract_policy_id: 'pol_003',
            price: 50000,
            currency: 'USD',
            valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
            status: 'active',
            description: 'Premium seismic data package with full analysis rights',
            created_at: new Date(),
            updated_at: new Date(),
            asset_title: 'Seismic Survey Block A-1',
            asset_description: 'Comprehensive 3D seismic survey data',
            access_policy_name: 'Public Read Access Policy',
            contract_policy_name: 'Commercial Data License',
            created_by_name: 'Admin User',
            provider_organization: 'PHE'
          },
          {
            id: 'offer_002',
            asset_id: 'ds002',
            access_policy_id: 'pol_002',
            contract_policy_id: null,
            price: 25000,
            currency: 'USD',
            valid_until: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
            status: 'active',
            description: 'Well log data with detailed analysis reports',
            created_at: new Date(),
            updated_at: new Date(),
            asset_title: 'Well Log Data - Well X-7',
            asset_description: 'Complete suite of wireline logs',
            access_policy_name: 'Internal Access Control',
            contract_policy_name: null,
            created_by_name: 'Admin User',
            provider_organization: 'MEDCO'
          },
          {
            id: 'offer_003',
            asset_id: 'ds001',
            access_policy_id: 'pol_004',
            contract_policy_id: 'pol_003',
            price: 75000,
            currency: 'USD',
            valid_until: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
            status: 'draft',
            description: 'Exclusive access to latest seismic interpretation',
            created_at: new Date(),
            updated_at: new Date(),
            asset_title: 'Seismic Survey Block A-1',
            asset_description: 'Comprehensive 3D seismic survey data',
            access_policy_name: 'Rate Limited API Access',
            contract_policy_name: 'Commercial Data License',
            created_by_name: 'Admin User',
            provider_organization: 'PHE'
          }
        ]
      };
    }
    
    // Mock single data offer by ID
    if (text.includes('SELECT') && text.includes('data_offers do') && text.includes('WHERE do.id = $1')) {
      const offerId = params?.[0];
      const mockOffers = [
        {
          id: 'offer_001',
          asset_id: 'ds001',
          access_policy_id: 'pol_001',
          contract_policy_id: 'pol_003',
          price: 50000,
          currency: 'USD',
          valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          description: 'Premium seismic data package with full analysis rights',
          created_at: new Date(),
          updated_at: new Date(),
          asset_title: 'Seismic Survey Block A-1',
          asset_description: 'Comprehensive 3D seismic survey data',
          access_policy_name: 'Public Read Access Policy',
          contract_policy_name: 'Commercial Data License',
          created_by_name: 'Admin User',
          provider_organization: 'PHE'
        }
      ];
      
      const offer = mockOffers.find(o => o.id === offerId) || mockOffers[0];
      return { rows: [offer] };
    }
    
    // Mock data offer creation
    if (text.includes('INSERT INTO data_offers')) {
      return {
        rows: [{
          id: 'offer_' + Math.random().toString(36).substr(2, 3),
          asset_id: params?.[0] || 'ds001',
          access_policy_id: params?.[1] || null,
          contract_policy_id: params?.[2] || null,
          price: params?.[3] || 0,
          currency: params?.[4] || 'USD',
          valid_until: params?.[5] || null,
          description: params?.[6] || '',
          status: params?.[7] || 'draft',
          created_at: new Date(),
          updated_at: new Date()
        }]
      };
    }
    
    // Mock data offer update
    if (text.includes('UPDATE data_offers') && text.includes('SET') && text.includes('WHERE id =')) {
      return {
        rows: [{
          id: params?.[params.length - 1] || 'offer_001',
          asset_id: 'ds001',
          access_policy_id: 'pol_001',
          contract_policy_id: 'pol_003',
          price: 50000,
          currency: 'USD',
          valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Updated offer description',
          status: 'active',
          created_at: new Date(),
          updated_at: new Date()
        }]
      };
    }
    
    // Mock data offer deletion
    if (text.includes('DELETE FROM data_offers WHERE id =')) {
      return { rows: [], rowCount: 1 };
    }
    
    // Mock contract usage check
    if (text.includes('SELECT COUNT(*) as count FROM contracts WHERE data_offer_id')) {
      return { rows: [{ count: 0 }] };
    }
    
    // Mock contracts list query
    if (text.includes('SELECT') && text.includes('FROM contracts c') && text.includes('LEFT JOIN data_offers do')) {
      const mockContracts = [
        {
          id: 'contract_demo_1',
          data_offer_id: 'offer_well_log_2024',
          provider_id: 'org_medco',
          consumer_id: 'org_phe',
          contract_terms: { term: "12 months", access_level: "full", attribution: "required" },
          signed_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          terminated_at: null,
          status: 'active',
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          asset_id: 'ds002',
          asset_title: 'Well Log Data - Well X-7',
          asset_description: 'Complete suite of wireline logs from exploratory well X-7',
          asset_keywords: 'well log, wireline, gamma ray, resistivity',
          data_format: '.las, .pdf',
          file_size: 104857600,
          provider_name: 'MEDCO',
          provider_email: 'info@medcoenergi.com',
          consumer_name: 'PHE',
          consumer_email: 'contact@phe.co.id',
          price: 0,
          currency: 'USD',
          valid_from: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          valid_until: new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000),
          access_policy_name: 'Unrestricted Policy',
          contract_policy_name: 'Standard Contract',
          transfer_count: 1
        },
        {
          id: 'contract_seismic_q1_5',
          data_offer_id: 'offer_seismic_q1',
          provider_id: 'org_phe',
          consumer_id: 'org_inpex',
          contract_terms: { term: "6 months", access_level: "restricted", usage: "internal_only" },
          signed_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          terminated_at: null,
          status: 'active',
          created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          updated_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          asset_id: 'ds001',
          asset_title: 'Seismic Survey Block A-1',
          asset_description: 'Comprehensive 3D seismic survey data for exploration block A-1',
          asset_keywords: 'seismic, 3D, exploration, survey',
          data_format: '.sgy, .txt, .json',
          file_size: 52428800000,
          provider_name: 'PHE',
          provider_email: 'contact@phe.co.id',
          consumer_name: 'INPEX',
          consumer_email: 'contact@inpex.co.jp',
          price: 25000,
          currency: 'USD',
          valid_from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          valid_until: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000),
          access_policy_name: 'Trusted Partner Policy',
          contract_policy_name: 'Standard Contract',
          transfer_count: 1
        },
        {
          id: 'contract_draft_1',
          data_offer_id: 'offer_production_z',
          provider_id: 'org_inpex',
          consumer_id: 'org_bp',
          contract_terms: { term: "24 months", access_level: "full", usage: "commercial" },
          signed_at: null,
          terminated_at: null,
          status: 'draft',
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          asset_id: 'ds003',
          asset_title: 'Production Data - Field Z',
          asset_description: 'Monthly production data for oil, gas, and water from Field Z',
          asset_keywords: 'production, oil, gas, water, time-series',
          data_format: '.csv, .xlsx',
          file_size: 20971520,
          provider_name: 'INPEX',
          provider_email: 'contact@inpex.co.jp',
          consumer_name: 'BP',
          consumer_email: 'indonesia@bp.com',
          price: 15000,
          currency: 'USD',
          valid_from: new Date(),
          valid_until: new Date(Date.now() + 3 * 30 * 24 * 60 * 60 * 1000),
          access_policy_name: 'KKKS Internal Use',
          contract_policy_name: 'Standard Contract',
          transfer_count: 0
        }
      ];
      
      // If this is a count query
      if (text.includes('COUNT(*) as total')) {
        return { rows: [{ total: mockContracts.length }] };
      }
      
      return { rows: mockContracts };
    }
    
    // Mock single contract query
    if (text.includes('SELECT') && text.includes('FROM contracts c') && text.includes('WHERE c.id = $1')) {
      const contractId = params?.[0];
      const mockContract = {
        id: contractId || 'contract_demo_1',
        data_offer_id: 'offer_well_log_2024',
        provider_id: 'org_medco',
        consumer_id: 'org_phe',
        contract_terms: { term: "12 months", access_level: "full", attribution: "required" },
        signed_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        terminated_at: null,
        status: 'active',
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        asset_id: 'ds002',
        asset_title: 'Well Log Data - Well X-7',
        asset_description: 'Complete suite of wireline logs from exploratory well X-7',
        asset_keywords: 'well log, wireline, gamma ray, resistivity',
        data_format: '.las, .pdf',
        file_size: 104857600,
        provider_name: 'MEDCO',
        provider_email: 'info@medcoenergi.com',
        consumer_name: 'PHE',
        consumer_email: 'contact@phe.co.id',
        price: 0,
        currency: 'USD',
        valid_from: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        valid_until: new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000),
        access_policy_name: 'Unrestricted Policy',
        contract_policy_name: 'Standard Contract',
        transfer_count: 1
      };
      
      return { rows: [mockContract] };
    }
    
    // Mock contract creation
    if (text.includes('INSERT INTO contracts')) {
      return {
        rows: [{
          id: 'contract_' + Math.random().toString(36).substr(2, 9),
          data_offer_id: params?.[1] || 'offer_001',
          provider_id: params?.[2] || 'org_phe',
          consumer_id: params?.[3] || 'org_medco',
          contract_terms: JSON.parse(params?.[4] || '{}'),
          signed_at: params?.[5] || new Date(),
          status: params?.[6] || 'active',
          created_at: new Date(),
          updated_at: new Date()
        }]
      };
    }
    
    // Mock contract update
    if (text.includes('UPDATE contracts') && text.includes('SET') && text.includes('WHERE id =')) {
      return {
        rows: [{
          id: params?.[params.length - 1] || 'contract_demo_1',
          data_offer_id: 'offer_well_log_2024',
          provider_id: 'org_medco',
          consumer_id: 'org_phe',
          contract_terms: JSON.parse(params?.[0] || '{}'),
          signed_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          terminated_at: params?.[1] === 'terminated' ? new Date() : null,
          status: params?.[1] || 'active',
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          updated_at: new Date()
        }]
      };
    }
    
    // Mock contract deletion
    if (text.includes('DELETE FROM contracts WHERE id =')) {
      return { rows: [], rowCount: 1 };
    }
    
    // Mock data transfers list query
    if (text.includes('SELECT') && text.includes('FROM data_transfers dt') && text.includes('LEFT JOIN contracts c')) {
      const mockTransfers = [
        {
          id: 'transfer_123',
          contract_id: 'contract_demo_1',
          transfer_type: 'download',
          transfer_state: 'completed',
          file_path: '/data/well_logs/well_x7.las',
          file_size: 104857600,
          bytes_transferred: 104857600,
          transfer_start: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
          transfer_end: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
          error_message: null,
          metadata: { compression: 'gzip', checksum: 'md5:abc123' },
          created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
          updated_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
          contract_status: 'active',
          contract_signed_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          asset_id: 'ds002',
          asset_title: 'Well Log Data - Well X-7',
          asset_description: 'Complete suite of wireline logs from exploratory well X-7',
          data_format: '.las, .pdf',
          asset_file_size: 104857600,
          keywords: 'well log, wireline, gamma ray, resistivity',
          provider_name: 'MEDCO',
          provider_email: 'info@medcoenergi.com',
          consumer_name: 'PHE',
          consumer_email: 'contact@phe.co.id',
          price: 0,
          currency: 'USD',
          valid_from: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          valid_until: new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000)
        },
        {
          id: 'transfer_456',
          contract_id: 'contract_seismic_q1_5',
          transfer_type: 'stream',
          transfer_state: 'in_progress',
          file_path: '/data/seismic/block_a1_3d.sgy',
          file_size: 52428800000,
          bytes_transferred: 26214400000,
          transfer_start: new Date(Date.now() - 2 * 60 * 60 * 1000),
          transfer_end: null,
          error_message: null,
          metadata: { stream_url: 'https://transfer.phe.co.id/stream/abc', progress: 50 },
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
          updated_at: new Date(Date.now() - 30 * 60 * 1000),
          contract_status: 'active',
          contract_signed_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          asset_id: 'ds001',
          asset_title: 'Seismic Survey Block A-1',
          asset_description: 'Comprehensive 3D seismic survey data for exploration block A-1',
          data_format: '.sgy, .txt, .json',
          asset_file_size: 52428800000,
          keywords: 'seismic, 3D, exploration, survey',
          provider_name: 'PHE',
          provider_email: 'contact@phe.co.id',
          consumer_name: 'INPEX',
          consumer_email: 'contact@inpex.co.jp',
          price: 25000,
          currency: 'USD',
          valid_from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          valid_until: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000)
        },
        {
          id: 'transfer_789',
          contract_id: 'contract_demo_1',
          transfer_type: 'api_access',
          transfer_state: 'failed',
          file_path: null,
          file_size: null,
          bytes_transferred: 0,
          transfer_start: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          transfer_end: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000),
          error_message: 'Connection timeout: Unable to establish API connection',
          metadata: { retry_count: 3, last_error: 'TIMEOUT' },
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000),
          contract_status: 'active',
          contract_signed_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          asset_id: 'ds002',
          asset_title: 'Well Log Data - Well X-7',
          asset_description: 'Complete suite of wireline logs from exploratory well X-7',
          data_format: '.las, .pdf',
          asset_file_size: 104857600,
          keywords: 'well log, wireline, gamma ray, resistivity',
          provider_name: 'MEDCO',
          provider_email: 'info@medcoenergi.com',
          consumer_name: 'PHE',
          consumer_email: 'contact@phe.co.id',
          price: 0,
          currency: 'USD',
          valid_from: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          valid_until: new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000)
        }
      ];
      
      // If this is a count query
      if (text.includes('COUNT(*) as total')) {
        return { rows: [{ total: mockTransfers.length }] };
      }
      
      return { rows: mockTransfers };
    }
    
    // Mock single transfer query
    if (text.includes('SELECT') && text.includes('FROM data_transfers dt') && text.includes('WHERE dt.id = $1')) {
      const transferId = params?.[0];
      const mockTransfer = {
        id: transferId || 'transfer_123',
        contract_id: 'contract_demo_1',
        transfer_type: 'download',
        transfer_state: 'completed',
        file_path: '/data/well_logs/well_x7.las',
        file_size: 104857600,
        bytes_transferred: 104857600,
        transfer_start: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        transfer_end: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        error_message: null,
        metadata: { compression: 'gzip', checksum: 'md5:abc123' },
        created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        contract_status: 'active',
        contract_signed_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        asset_id: 'ds002',
        asset_title: 'Well Log Data - Well X-7',
        asset_description: 'Complete suite of wireline logs from exploratory well X-7',
        data_format: '.las, .pdf',
        asset_file_size: 104857600,
        keywords: 'well log, wireline, gamma ray, resistivity',
        provider_name: 'MEDCO',
        provider_email: 'info@medcoenergi.com',
        consumer_name: 'PHE',
        consumer_email: 'contact@phe.co.id',
        price: 0,
        currency: 'USD',
        valid_from: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        valid_until: new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000)
      };
      
      return { rows: [mockTransfer] };
    }
    
    // Mock transfer creation
    if (text.includes('INSERT INTO data_transfers')) {
      return {
        rows: [{
          id: 'transfer_' + Math.random().toString(36).substr(2, 9),
          contract_id: params?.[1] || 'contract_demo_1',
          transfer_type: params?.[2] || 'download',
          transfer_state: params?.[3] || 'initiated',
          file_path: params?.[4] || null,
          file_size: params?.[5] || null,
          bytes_transferred: params?.[6] || 0,
          transfer_start: params?.[7] || new Date(),
          metadata: JSON.parse(params?.[8] || '{}'),
          created_at: new Date(),
          updated_at: new Date()
        }]
      };
    }
    
    // Mock transfer update
    if (text.includes('UPDATE data_transfers') && text.includes('SET') && text.includes('WHERE id =')) {
      return {
        rows: [{
          id: params?.[params.length - 1] || 'transfer_123',
          contract_id: 'contract_demo_1',
          transfer_type: 'download',
          transfer_state: params?.[0] || 'completed',
          file_path: '/data/well_logs/well_x7.las',
          file_size: 104857600,
          bytes_transferred: params?.[1] || 104857600,
          transfer_start: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
          transfer_end: new Date(),
          error_message: params?.[2] || null,
          metadata: JSON.parse(params?.[3] || '{}'),
          created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
          updated_at: new Date()
        }]
      };
    }
    
    // Mock transfer deletion
    if (text.includes('DELETE FROM data_transfers WHERE id =')) {
      return { rows: [], rowCount: 1 };
    }
    
    // Default mock response
    return { rows: [], rowCount: 0 };
  }
  
  const pool = getPool();
  const start = Date.now();
  
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Executed query', { text, duration, rows: res.rowCount });
    }
    
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Transaction wrapper
export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  if (MOCK_MODE) {
    console.log('🔄 MOCK Transaction');
    // In mock mode, just execute the callback without transaction
    return await callback({} as PoolClient);
  }
  
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Test database connection
export async function testConnection(): Promise<boolean> {
  if (MOCK_MODE) {
    console.log('🔄 MOCK DB Connection - OK');
    return true;
  }
  
  try {
    const result = await query('SELECT NOW() as current_time');
    console.log('Database connected successfully:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Close all connections (for graceful shutdown)
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    console.log('Database pool closed');
  }
}