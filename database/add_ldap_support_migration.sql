-- Migration: Add LDAP configuration support
-- Run this migration to add LDAP functionality

-- Create LDAP configuration table
CREATE TABLE IF NOT EXISTS ldap_configurations (
    id VARCHAR(50) PRIMARY KEY DEFAULT ('ldap_' || substr(gen_random_uuid()::text, 1, 8)),
    name VARCHAR(255) NOT NULL,
    server_url VARCHAR(500) NOT NULL,
    bind_dn VARCHAR(500) NOT NULL,
    bind_password VARCHAR(500) NOT NULL,
    base_dn VARCHAR(500) NOT NULL,
    user_search_filter VARCHAR(500) DEFAULT '(&(objectClass=user)(sAMAccountName={username}))',
    email_attribute VARCHAR(100) DEFAULT 'mail',
    name_attribute VARCHAR(100) DEFAULT 'displayName',
    enabled BOOLEAN DEFAULT true,
    ssl_enabled BOOLEAN DEFAULT false,
    port INTEGER DEFAULT 389,
    timeout INTEGER DEFAULT 5000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Add LDAP source tracking to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS ldap_dn VARCHAR(500);
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_source VARCHAR(50) DEFAULT 'local';

-- Create index for LDAP users
CREATE INDEX IF NOT EXISTS idx_users_ldap_dn ON users(ldap_dn) WHERE ldap_dn IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_auth_source ON users(auth_source);

-- Add comments
COMMENT ON TABLE ldap_configurations IS 'LDAP server configurations for user authentication and sync';
COMMENT ON COLUMN users.ldap_dn IS 'LDAP Distinguished Name for users imported from LDAP';
COMMENT ON COLUMN users.auth_source IS 'Authentication source: local, ldap, or sso';

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_ldap_configurations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ldap_configurations_updated_at
    BEFORE UPDATE ON ldap_configurations
    FOR EACH ROW
    EXECUTE FUNCTION update_ldap_configurations_updated_at();