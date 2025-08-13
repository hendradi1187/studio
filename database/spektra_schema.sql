-- SPEKTRA Data Exchange Database Schema
-- PostgreSQL Database Schema for Oil & Gas Data Exchange Platform

-- Create database (run this separately as a superuser)
-- CREATE DATABASE spektra_db WITH ENCODING 'UTF8' LC_COLLATE='en_US.UTF-8' LC_CTYPE='en_US.UTF-8';

-- Connect to spektra_db before running the rest
-- \c spektra_db;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE organization_type AS ENUM ('regulator', 'kkks', 'contractor', 'vendor', 'auditor');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'pending');
CREATE TYPE access_status AS ENUM ('open', 'restricted', 'by_request', 'private');
CREATE TYPE asset_status AS ENUM ('active', 'archived', 'deleted');
CREATE TYPE policy_type AS ENUM ('access', 'contract', 'usage');
CREATE TYPE policy_status AS ENUM ('active', 'inactive', 'draft');
CREATE TYPE offer_status AS ENUM ('active', 'inactive', 'expired');
CREATE TYPE contract_status AS ENUM ('draft', 'pending', 'active', 'terminated', 'expired');
CREATE TYPE transfer_type AS ENUM ('download', 'stream', 'api_access');
CREATE TYPE transfer_state AS ENUM ('initiated', 'in_progress', 'completed', 'failed', 'cancelled');
CREATE TYPE connection_type AS ENUM ('api', 'ftp', 'sftp', 'database', 'web_service');
CREATE TYPE connection_status AS ENUM ('active', 'inactive', 'error', 'maintenance');
CREATE TYPE action_type AS ENUM ('login', 'logout', 'search', 'view', 'download', 'request_access', 'approve_access', 'deny_access', 'create_offer', 'sign_contract', 'sync_metadata');
CREATE TYPE target_type AS ENUM ('asset', 'offer', 'contract', 'user', 'organization', 'system');
CREATE TYPE log_status AS ENUM ('success', 'failed', 'pending');
CREATE TYPE notification_type AS ENUM ('access_granted', 'access_denied', 'new_dataset', 'sync_failure', 'contract_signed', 'transfer_complete', 'system_alert');
CREATE TYPE related_type AS ENUM ('asset', 'offer', 'contract', 'transfer', 'system');
CREATE TYPE subscription_type AS ENUM ('vocabulary_term', 'organization', 'asset_type', 'all_new_assets');
CREATE TYPE notification_frequency AS ENUM ('immediate', 'daily', 'weekly', 'monthly');
CREATE TYPE request_status AS ENUM ('pending', 'approved', 'denied', 'withdrawn');
CREATE TYPE setting_type AS ENUM ('string', 'number', 'boolean', 'json');

-- Organizations table
CREATE TABLE organizations (
    id VARCHAR(50) PRIMARY KEY DEFAULT ('org_' || substr(gen_random_uuid()::text, 1, 8)),
    name VARCHAR(255) NOT NULL,
    type organization_type NOT NULL,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    address TEXT,
    status user_status DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User roles table
CREATE TABLE user_roles (
    id VARCHAR(50) PRIMARY KEY DEFAULT ('role_' || substr(gen_random_uuid()::text, 1, 8)),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    permissions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY DEFAULT ('usr_' || substr(gen_random_uuid()::text, 1, 8)),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),
    organization_id VARCHAR(50),
    role_id VARCHAR(50),
    status user_status DEFAULT 'pending',
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL,
    FOREIGN KEY (role_id) REFERENCES user_roles(id) ON DELETE SET NULL
);

-- Create indexes for users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_users_status ON users(status);

-- Data categories/vocabulary table
CREATE TABLE vocabulary_terms (
    id VARCHAR(50) PRIMARY KEY DEFAULT ('vocab_' || substr(gen_random_uuid()::text, 1, 8)),
    term VARCHAR(255) NOT NULL,
    parent_id VARCHAR(50),
    description TEXT,
    level INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    status user_status DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES vocabulary_terms(id) ON DELETE CASCADE
);

-- Create indexes for vocabulary_terms table
CREATE INDEX idx_vocabulary_parent ON vocabulary_terms(parent_id);
CREATE INDEX idx_vocabulary_term ON vocabulary_terms(term);
CREATE INDEX idx_vocabulary_status ON vocabulary_terms(status);

-- Assets/Datasets table
CREATE TABLE assets (
    id VARCHAR(50) PRIMARY KEY DEFAULT ('asset_' || substr(gen_random_uuid()::text, 1, 8)),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    owner_organization_id VARCHAR(50) NOT NULL,
    access_status access_status DEFAULT 'private',
    data_format VARCHAR(255),
    file_size BIGINT,
    data_structure TEXT,
    abstract TEXT,
    keywords TEXT,
    geographic_area VARCHAR(255),
    time_period_start DATE,
    time_period_end DATE,
    version VARCHAR(50) DEFAULT '1.0',
    status asset_status DEFAULT 'active',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_organization_id) REFERENCES organizations(id) ON DELETE RESTRICT
);

-- Create indexes for assets table
CREATE INDEX idx_assets_owner ON assets(owner_organization_id);
CREATE INDEX idx_assets_access_status ON assets(access_status);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_title ON assets(title);
CREATE INDEX idx_assets_created ON assets(created_at);
-- Full-text search index
CREATE INDEX idx_assets_search ON assets USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || COALESCE(abstract, '') || ' ' || COALESCE(keywords, '')));

-- Asset vocabulary mapping (many-to-many)
CREATE TABLE asset_vocabulary (
    asset_id VARCHAR(50),
    vocabulary_id VARCHAR(50),
    PRIMARY KEY (asset_id, vocabulary_id),
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    FOREIGN KEY (vocabulary_id) REFERENCES vocabulary_terms(id) ON DELETE CASCADE
);

-- Policies table
CREATE TABLE policies (
    id VARCHAR(50) PRIMARY KEY DEFAULT ('policy_' || substr(gen_random_uuid()::text, 1, 8)),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    policy_type policy_type NOT NULL,
    policy_rules JSONB,
    permissions_count INTEGER DEFAULT 0,
    prohibitions_count INTEGER DEFAULT 0,
    obligations_count INTEGER DEFAULT 0,
    status policy_status DEFAULT 'draft',
    created_by VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for policies table
CREATE INDEX idx_policies_type ON policies(policy_type);
CREATE INDEX idx_policies_status ON policies(status);
CREATE INDEX idx_policies_created_by ON policies(created_by);

-- Data offers table
CREATE TABLE data_offers (
    id VARCHAR(50) PRIMARY KEY DEFAULT ('offer_' || substr(gen_random_uuid()::text, 1, 8)),
    asset_id VARCHAR(50) NOT NULL,
    provider_id VARCHAR(50) NOT NULL,
    access_policy_id VARCHAR(50),
    contract_policy_id VARCHAR(50),
    price DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'USD',
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP WITH TIME ZONE,
    status offer_status DEFAULT 'active',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (access_policy_id) REFERENCES policies(id) ON DELETE SET NULL,
    FOREIGN KEY (contract_policy_id) REFERENCES policies(id) ON DELETE SET NULL
);

-- Create indexes for data_offers table
CREATE INDEX idx_offers_asset ON data_offers(asset_id);
CREATE INDEX idx_offers_provider ON data_offers(provider_id);
CREATE INDEX idx_offers_status ON data_offers(status);
CREATE INDEX idx_offers_valid ON data_offers(valid_from, valid_until);

-- Contracts table
CREATE TABLE contracts (
    id VARCHAR(50) PRIMARY KEY DEFAULT ('contract_' || substr(gen_random_uuid()::text, 1, 8)),
    data_offer_id VARCHAR(50) NOT NULL,
    provider_id VARCHAR(50) NOT NULL,
    consumer_id VARCHAR(50) NOT NULL,
    contract_terms JSONB,
    signed_at TIMESTAMP WITH TIME ZONE,
    terminated_at TIMESTAMP WITH TIME ZONE,
    status contract_status DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (data_offer_id) REFERENCES data_offers(id) ON DELETE RESTRICT,
    FOREIGN KEY (provider_id) REFERENCES organizations(id) ON DELETE RESTRICT,
    FOREIGN KEY (consumer_id) REFERENCES organizations(id) ON DELETE RESTRICT
);

-- Create indexes for contracts table
CREATE INDEX idx_contracts_offer ON contracts(data_offer_id);
CREATE INDEX idx_contracts_provider ON contracts(provider_id);
CREATE INDEX idx_contracts_consumer ON contracts(consumer_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_signed ON contracts(signed_at);

-- Data transfers table
CREATE TABLE data_transfers (
    id VARCHAR(50) PRIMARY KEY DEFAULT ('transfer_' || substr(gen_random_uuid()::text, 1, 8)),
    contract_id VARCHAR(50) NOT NULL,
    transfer_type transfer_type DEFAULT 'download',
    transfer_state transfer_state DEFAULT 'initiated',
    file_path VARCHAR(1000),
    file_size BIGINT,
    bytes_transferred BIGINT DEFAULT 0,
    transfer_start TIMESTAMP WITH TIME ZONE,
    transfer_end TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE
);

-- Create indexes for data_transfers table
CREATE INDEX idx_transfers_contract ON data_transfers(contract_id);
CREATE INDEX idx_transfers_state ON data_transfers(transfer_state);
CREATE INDEX idx_transfers_created ON data_transfers(created_at);
CREATE INDEX idx_transfers_type ON data_transfers(transfer_type);

-- Broker connections table
CREATE TABLE broker_connections (
    id VARCHAR(50) PRIMARY KEY DEFAULT ('broker_' || substr(gen_random_uuid()::text, 1, 8)),
    name VARCHAR(255) NOT NULL,
    organization_id VARCHAR(50),
    connection_type connection_type NOT NULL,
    endpoint_url VARCHAR(500),
    authentication JSONB,
    sync_frequency VARCHAR(50) DEFAULT 'daily',
    last_sync TIMESTAMP WITH TIME ZONE,
    next_sync TIMESTAMP WITH TIME ZONE,
    status connection_status DEFAULT 'inactive',
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL
);

-- Create indexes for broker_connections table
CREATE INDEX idx_connections_organization ON broker_connections(organization_id);
CREATE INDEX idx_connections_status ON broker_connections(status);
CREATE INDEX idx_connections_sync ON broker_connections(last_sync);
CREATE INDEX idx_connections_type ON broker_connections(connection_type);

-- Transaction logs table
CREATE TABLE transaction_logs (
    id VARCHAR(50) PRIMARY KEY DEFAULT ('log_' || substr(gen_random_uuid()::text, 1, 8)),
    user_id VARCHAR(50),
    organization_id VARCHAR(50),
    action_type action_type NOT NULL,
    target_type target_type NOT NULL,
    target_id VARCHAR(50),
    action_details JSONB,
    ip_address INET,
    user_agent TEXT,
    status log_status NOT NULL,
    error_message TEXT,
    session_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL
);

-- Create indexes for transaction_logs table
CREATE INDEX idx_logs_user ON transaction_logs(user_id);
CREATE INDEX idx_logs_organization ON transaction_logs(organization_id);
CREATE INDEX idx_logs_action ON transaction_logs(action_type);
CREATE INDEX idx_logs_target ON transaction_logs(target_type, target_id);
CREATE INDEX idx_logs_created ON transaction_logs(created_at);
CREATE INDEX idx_logs_status ON transaction_logs(status);
CREATE INDEX idx_logs_session ON transaction_logs(session_id);

-- Notifications table
CREATE TABLE notifications (
    id VARCHAR(50) PRIMARY KEY DEFAULT ('notif_' || substr(gen_random_uuid()::text, 1, 8)),
    user_id VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type notification_type NOT NULL,
    related_type related_type,
    related_id VARCHAR(50),
    read_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for notifications table
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(notification_type);
CREATE INDEX idx_notifications_read ON notifications(read_at);
CREATE INDEX idx_notifications_created ON notifications(created_at);
CREATE INDEX idx_notifications_related ON notifications(related_type, related_id);

-- User subscriptions table (for notification preferences)
CREATE TABLE user_subscriptions (
    id VARCHAR(50) PRIMARY KEY DEFAULT ('sub_' || substr(gen_random_uuid()::text, 1, 8)),
    user_id VARCHAR(50) NOT NULL,
    subscription_type subscription_type NOT NULL,
    subscription_value VARCHAR(255),
    notification_frequency notification_frequency DEFAULT 'immediate',
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for user_subscriptions table
CREATE INDEX idx_subscriptions_user ON user_subscriptions(user_id);
CREATE INDEX idx_subscriptions_type ON user_subscriptions(subscription_type);
CREATE INDEX idx_subscriptions_active ON user_subscriptions(is_active);

-- Access requests table
CREATE TABLE access_requests (
    id VARCHAR(50) PRIMARY KEY DEFAULT ('req_' || substr(gen_random_uuid()::text, 1, 8)),
    asset_id VARCHAR(50) NOT NULL,
    requester_id VARCHAR(50) NOT NULL,
    requester_organization_id VARCHAR(50) NOT NULL,
    request_reason TEXT,
    intended_use TEXT,
    request_status request_status DEFAULT 'pending',
    reviewed_by VARCHAR(50),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (requester_organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for access_requests table
CREATE INDEX idx_requests_asset ON access_requests(asset_id);
CREATE INDEX idx_requests_requester ON access_requests(requester_id);
CREATE INDEX idx_requests_organization ON access_requests(requester_organization_id);
CREATE INDEX idx_requests_status ON access_requests(request_status);
CREATE INDEX idx_requests_created ON access_requests(created_at);
CREATE INDEX idx_requests_reviewed ON access_requests(reviewed_by, reviewed_at);

-- System settings table
CREATE TABLE system_settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT ('setting_' || substr(gen_random_uuid()::text, 1, 8)),
    setting_key VARCHAR(255) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_type setting_type DEFAULT 'string',
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    updated_by VARCHAR(50),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for system_settings table
CREATE INDEX idx_settings_key ON system_settings(setting_key);
CREATE INDEX idx_settings_public ON system_settings(is_public);

-- API keys table for external integrations
CREATE TABLE api_keys (
    id VARCHAR(50) PRIMARY KEY DEFAULT ('key_' || substr(gen_random_uuid()::text, 1, 8)),
    organization_id VARCHAR(50) NOT NULL,
    key_name VARCHAR(255) NOT NULL,
    api_key_hash VARCHAR(255) NOT NULL,
    permissions JSONB,
    rate_limit_per_hour INTEGER DEFAULT 1000,
    last_used TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT uk_org_name UNIQUE (organization_id, key_name)
);

-- Create indexes for api_keys table
CREATE INDEX idx_api_keys_organization ON api_keys(organization_id);
CREATE INDEX idx_api_keys_active ON api_keys(is_active);
CREATE INDEX idx_api_keys_expires ON api_keys(expires_at);
CREATE INDEX idx_api_keys_last_used ON api_keys(last_used);

-- Create function to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON user_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vocabulary_terms_updated_at BEFORE UPDATE ON vocabulary_terms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_policies_updated_at BEFORE UPDATE ON policies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_data_offers_updated_at BEFORE UPDATE ON data_offers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_data_transfers_updated_at BEFORE UPDATE ON data_transfers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_broker_connections_updated_at BEFORE UPDATE ON broker_connections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_access_requests_updated_at BEFORE UPDATE ON access_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();