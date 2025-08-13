import { query } from './database';

// LDAP Configuration interface
export interface LDAPConfig {
  id?: string;
  name: string;
  serverUrl: string;
  bindDn: string;
  bindPassword: string;
  baseDn: string;
  userSearchFilter?: string;
  emailAttribute?: string;
  nameAttribute?: string;
  enabled?: boolean;
  sslEnabled?: boolean;
  port?: number;
  timeout?: number;
}

// LDAP User interface
export interface LDAPUser {
  dn: string;
  email: string;
  name: string;
  attributes: Record<string, any>;
}

// Mock LDAP client for development
class MockLDAPClient {
  private config: LDAPConfig;

  constructor(config: LDAPConfig) {
    this.config = config;
  }

  async authenticate(username: string, password: string): Promise<LDAPUser | null> {
    console.log(`🔐 MOCK LDAP Auth: ${username} on ${this.config.serverUrl}`);
    
    // Mock LDAP authentication
    if (username === 'admin' && password === 'password123') {
      return {
        dn: `cn=${username},${this.config.baseDn}`,
        email: `${username}@spektra.com`,
        name: `LDAP ${username}`,
        attributes: {
          displayName: `LDAP ${username}`,
          mail: `${username}@spektra.com`,
          sAMAccountName: username,
          memberOf: ['CN=Administrators,DC=spektra,DC=com']
        }
      };
    }
    
    return null;
  }

  async testConnection(): Promise<boolean> {
    console.log(`🔗 MOCK LDAP Connection Test: ${this.config.serverUrl}`);
    // Simulate connection test
    return this.config.serverUrl.includes('spektra.com');
  }

  async searchUsers(searchFilter?: string): Promise<LDAPUser[]> {
    console.log(`🔍 MOCK LDAP Search: ${searchFilter || 'all users'}`);
    
    // Mock user search results
    return [
      {
        dn: `cn=admin,${this.config.baseDn}`,
        email: 'admin@spektra.com',
        name: 'LDAP Admin',
        attributes: {
          displayName: 'LDAP Admin',
          mail: 'admin@spektra.com',
          sAMAccountName: 'admin'
        }
      },
      {
        dn: `cn=user1,${this.config.baseDn}`,
        email: 'user1@spektra.com',
        name: 'LDAP User 1',
        attributes: {
          displayName: 'LDAP User 1',
          mail: 'user1@spektra.com',
          sAMAccountName: 'user1'
        }
      }
    ];
  }
}

// Real LDAP client (for production)
class RealLDAPClient {
  private config: LDAPConfig;

  constructor(config: LDAPConfig) {
    this.config = config;
  }

  async authenticate(username: string, password: string): Promise<LDAPUser | null> {
    try {
      // For production, use ldapjs or similar library
      // const ldap = require('ldapjs');
      // const client = ldap.createClient({ url: this.config.serverUrl });
      // Implementation would go here
      console.log('Real LDAP authentication would happen here');
      return null;
    } catch (error) {
      console.error('LDAP authentication error:', error);
      throw new Error('LDAP authentication failed');
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      // Real connection test implementation
      console.log('Real LDAP connection test would happen here');
      return false;
    } catch (error) {
      console.error('LDAP connection test error:', error);
      return false;
    }
  }

  async searchUsers(searchFilter?: string): Promise<LDAPUser[]> {
    try {
      // Real user search implementation
      console.log('Real LDAP user search would happen here');
      return [];
    } catch (error) {
      console.error('LDAP search error:', error);
      throw new Error('LDAP search failed');
    }
  }
}

// LDAP service factory
export function createLDAPClient(config: LDAPConfig): MockLDAPClient | RealLDAPClient {
  const useMock = process.env.NODE_ENV === 'development' || process.env.LDAP_MOCK === 'true';
  
  if (useMock) {
    return new MockLDAPClient(config);
  } else {
    return new RealLDAPClient(config);
  }
}

// LDAP configuration management
export async function saveLDAPConfig(config: LDAPConfig, userId: string): Promise<string> {
  const result = await query(
    `INSERT INTO ldap_configurations 
     (name, server_url, bind_dn, bind_password, base_dn, user_search_filter, 
      email_attribute, name_attribute, enabled, ssl_enabled, port, timeout, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     RETURNING id`,
    [
      config.name,
      config.serverUrl,
      config.bindDn,
      config.bindPassword,
      config.baseDn,
      config.userSearchFilter || '(&(objectClass=user)(sAMAccountName={username}))',
      config.emailAttribute || 'mail',
      config.nameAttribute || 'displayName',
      config.enabled !== false,
      config.sslEnabled || false,
      config.port || 389,
      config.timeout || 5000,
      userId
    ]
  );

  return result.rows[0].id;
}

export async function getLDAPConfigs(): Promise<LDAPConfig[]> {
  const result = await query(`
    SELECT id, name, server_url, bind_dn, base_dn, user_search_filter,
           email_attribute, name_attribute, enabled, ssl_enabled, port, timeout
    FROM ldap_configurations 
    WHERE enabled = true
    ORDER BY name
  `);

  return result.rows.map(row => ({
    id: row.id,
    name: row.name,
    serverUrl: row.server_url,
    bindDn: row.bind_dn,
    bindPassword: '', // Don't return password
    baseDn: row.base_dn,
    userSearchFilter: row.user_search_filter,
    emailAttribute: row.email_attribute,
    nameAttribute: row.name_attribute,
    enabled: row.enabled,
    sslEnabled: row.ssl_enabled,
    port: row.port,
    timeout: row.timeout
  }));
}

export async function getLDAPConfig(id: string): Promise<LDAPConfig | null> {
  const result = await query(`
    SELECT id, name, server_url, bind_dn, bind_password, base_dn, user_search_filter,
           email_attribute, name_attribute, enabled, ssl_enabled, port, timeout
    FROM ldap_configurations 
    WHERE id = $1
  `, [id]);

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
    serverUrl: row.server_url,
    bindDn: row.bind_dn,
    bindPassword: row.bind_password,
    baseDn: row.base_dn,
    userSearchFilter: row.user_search_filter,
    emailAttribute: row.email_attribute,
    nameAttribute: row.name_attribute,
    enabled: row.enabled,
    sslEnabled: row.ssl_enabled,
    port: row.port,
    timeout: row.timeout
  };
}

// LDAP authentication function
export async function authenticateWithLDAP(username: string, password: string): Promise<LDAPUser | null> {
  const configs = await getLDAPConfigs();
  
  for (const config of configs) {
    if (!config.enabled) continue;
    
    try {
      const client = createLDAPClient(config);
      const user = await client.authenticate(username, password);
      
      if (user) {
        return user;
      }
    } catch (error) {
      console.error(`LDAP auth failed for config ${config.name}:`, error);
      // Continue to next config
    }
  }
  
  return null;
}

// Test LDAP connection
export async function testLDAPConnection(config: LDAPConfig): Promise<boolean> {
  try {
    const client = createLDAPClient(config);
    return await client.testConnection();
  } catch (error) {
    console.error('LDAP connection test failed:', error);
    return false;
  }
}

// Sync users from LDAP
export async function syncUsersFromLDAP(configId: string): Promise<{ success: number; errors: string[] }> {
  const config = await getLDAPConfig(configId);
  if (!config) {
    throw new Error('LDAP configuration not found');
  }

  const client = createLDAPClient(config);
  const ldapUsers = await client.searchUsers();
  
  let success = 0;
  const errors: string[] = [];

  for (const ldapUser of ldapUsers) {
    try {
      // Check if user already exists
      const existingUser = await query(
        'SELECT id FROM users WHERE email = $1 OR ldap_dn = $2',
        [ldapUser.email, ldapUser.dn]
      );

      if (existingUser.rows.length === 0) {
        // Create new user
        await query(
          `INSERT INTO users (email, name, ldap_dn, auth_source, status, organization_id, role_id)
           VALUES ($1, $2, $3, 'ldap', 'active', 'org_skkmigas', 'role_regulator')`,
          [ldapUser.email, ldapUser.name, ldapUser.dn]
        );
        success++;
      } else {
        // Update existing user
        await query(
          'UPDATE users SET name = $1, ldap_dn = $2, auth_source = $3 WHERE email = $4',
          [ldapUser.name, ldapUser.dn, 'ldap', ldapUser.email]
        );
        success++;
      }
    } catch (error) {
      errors.push(`Failed to sync user ${ldapUser.email}: ${error}`);
    }
  }

  return { success, errors };
}