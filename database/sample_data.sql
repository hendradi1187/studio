-- SPEKTRA Data Exchange - Sample Data
-- PostgreSQL Sample Data for Oil & Gas Data Exchange Platform

-- Insert Organizations
INSERT INTO organizations (id, name, type, contact_email, contact_phone, address, status) VALUES
('org_skkmigas', 'SKK Migas', 'regulator', 'info@skkmigas.go.id', '+62-21-3813771', 'Jl. TB Simatupang No. 1K, Jakarta Selatan', 'active'),
('org_phe', 'PHE', 'kkks', 'contact@phe.co.id', '+62-21-2350109', 'Graha PHE, Jl. TB Simatupang, Jakarta', 'active'),
('org_medco', 'MEDCO', 'kkks', 'info@medcoenergi.com', '+62-21-2995777', 'Wisma Mulia Lt. 40, Jakarta', 'active'),
('org_inpex', 'INPEX', 'kkks', 'contact@inpex.co.jp', '+62-21-5795123', 'Menara Sudirman Lt. 15, Jakarta', 'active'),
('org_bp', 'BP', 'kkks', 'indonesia@bp.com', '+62-21-2358899', 'Wisma 46 Kota BNI Lt. 43, Jakarta', 'active'),
('org_emp', 'EMP', 'kkks', 'contact@emp.id', '+62-21-5711234', 'Energy Building Lt. 20, Jakarta', 'active'),
('org_vendor_a', 'Vendor A', 'vendor', 'sales@vendora.com', '+62-21-5555678', 'Jl. Sudirman No. 123, Jakarta', 'active'),
('org_audit', 'Internal Audit', 'auditor', 'audit@spektor.com', '+62-21-9876543', 'Spektra Building, Jakarta', 'active');

-- Insert User Roles
INSERT INTO user_roles (id, name, description, permissions) VALUES
('role_regulator', 'Regulator (SKK Migas)', 'Full regulatory oversight access', '{"read": ["*"], "write": ["policies", "approvals"], "admin": ["user_management"]}'),
('role_kkks_admin', 'KKKS Admin', 'Administrative access for KKKS companies', '{"read": ["assets", "contracts", "offers"], "write": ["assets", "offers"], "approve": ["access_requests"]}'),
('role_data_custodian', 'Data Custodian', 'Manages and maintains data assets', '{"read": ["assets", "metadata"], "write": ["assets", "metadata"], "upload": ["datasets"]}'),
('role_technical_analyst', 'Technical Analyst', 'Technical analysis and data access', '{"read": ["assets", "analysis"], "download": ["permitted_data"], "analyze": ["datasets"]}'),
('role_compliance_officer', 'Compliance Officer', 'Ensures regulatory compliance', '{"read": ["logs", "audits", "compliance"], "audit": ["activities"], "report": ["violations"]}'),
('role_integration_engineer', 'Integration Engineer', 'System integration and maintenance', '{"read": ["systems", "apis"], "configure": ["integrations"], "monitor": ["connections"]}'),
('role_external_partner', 'External Partner', 'Limited partner access', '{"read": ["public_data"], "request": ["access"]}'),
('role_auditor', 'Auditor', 'Audit and compliance verification', '{"read": ["*"], "audit": ["*"], "report": ["findings"]}');

-- Insert Users
INSERT INTO users (id, email, name, organization_id, role_id, status, last_login) VALUES
('usr01', 'adi.prasetyo@skkmigas.go.id', 'Adi Prasetyo', 'org_skkmigas', 'role_regulator', 'active', NOW() - INTERVAL '2 hours'),
('usr02', 'budi.santoso@phe.co.id', 'Budi Santoso', 'org_phe', 'role_kkks_admin', 'active', NOW() - INTERVAL '1 day'),
('usr03', 'citra.dewi@medcoenergi.com', 'Citra Dewi', 'org_medco', 'role_data_custodian', 'active', NOW() - INTERVAL '5 hours'),
('usr04', 'dian.lestari@inpex.co.jp', 'Dian Lestari', 'org_inpex', 'role_technical_analyst', 'active', NOW() - INTERVAL '30 minutes'),
('usr05', 'eko.nugroho@bp.com', 'Eko Nugroho', 'org_bp', 'role_compliance_officer', 'active', NOW() - INTERVAL '3 days'),
('usr06', 'fitriani@emp.id', 'Fitriani', 'org_emp', 'role_integration_engineer', 'active', NOW() - INTERVAL '1 week'),
('usr07', 'gilang.p@externalvendor.com', 'Gilang Pratama', 'org_vendor_a', 'role_external_partner', 'active', NOW() - INTERVAL '4 hours'),
('usr08', 'hadi.wijaya@auditor.net', 'Hadi Wijaya', 'org_audit', 'role_auditor', 'active', NOW() - INTERVAL '2 days');

-- Insert Vocabulary Terms
INSERT INTO vocabulary_terms (id, term, parent_id, description, level, sort_order) VALUES
('vocab_working_area', 'Working Area', NULL, 'Designated exploration or production areas', 0, 1),
('vocab_seismic', 'Seismic', NULL, 'Seismic survey data and analysis', 0, 2),
('vocab_seismic_2d', '2D Seismic Data', 'vocab_seismic', 'Two-dimensional seismic survey data', 1, 1),
('vocab_seismic_3d', '3D Seismic Data', 'vocab_seismic', 'Three-dimensional seismic survey data', 1, 2),
('vocab_seismic_attr', 'Seismic Attributes', 'vocab_seismic', 'Processed seismic attribute data', 1, 3),
('vocab_well', 'Well (Sumur)', NULL, 'Well-related data and information', 0, 3),
('vocab_well_log', 'Well Log', 'vocab_well', 'Wireline logging data', 1, 1),
('vocab_well_core', 'Well Core', 'vocab_well', 'Core sample data and analysis', 1, 2),
('vocab_well_test', 'Well Test Data', 'vocab_well', 'Well testing and production data', 1, 3),
('vocab_drilling', 'Drilling Report', 'vocab_well', 'Drilling operations and reports', 1, 4),
('vocab_field', 'Field (Lapangan)', NULL, 'Field development and production', 0, 4),
('vocab_production', 'Production Data', 'vocab_field', 'Oil and gas production statistics', 1, 1),
('vocab_reservoir', 'Reservoir Model', 'vocab_field', 'Reservoir modeling and simulation', 1, 2),
('vocab_pvt', 'PVT Analysis', 'vocab_field', 'Pressure-Volume-Temperature analysis', 1, 3),
('vocab_facilities', 'Facilities', NULL, 'Infrastructure and facilities data', 0, 5),
('vocab_pipeline', 'Pipeline Data', 'vocab_facilities', 'Pipeline specifications and monitoring', 1, 1),
('vocab_platform', 'Platform Information', 'vocab_facilities', 'Offshore platform data', 1, 2),
('vocab_processing', 'Processing Plant Specs', 'vocab_facilities', 'Processing facility specifications', 1, 3);

-- Insert Assets/Datasets
INSERT INTO assets (id, title, description, owner_organization_id, access_status, data_format, file_size, data_structure, abstract, keywords, geographic_area, time_period_start, time_period_end, version) VALUES
('ds001', 'Seismic Survey Block A-1', 'Comprehensive 3D seismic survey data for exploration block A-1', 'org_phe', 'restricted', '.sgy, .txt, .json', 52428800000, 'SEG-Y, Navigation Data, Velocity Models', 'Comprehensive 3D seismic survey data for exploration block A-1, covering an area of 500 sq km.', 'seismic, 3D, exploration, survey', 'East Java Basin', '2023-01-01', '2023-12-31', '1.0'),
('ds002', 'Well Log Data - Well X-7', 'Complete suite of wireline logs from exploratory well X-7', 'org_medco', 'open', '.las, .pdf', 104857600, 'LAS files for each log run, summary report', 'Complete suite of wireline logs from the exploratory well X-7, including gamma ray, resistivity, and sonic logs.', 'well log, wireline, gamma ray, resistivity', 'Natuna Sea', '2023-09-01', '2023-09-30', '1.0'),
('ds003', 'Production Data - Field Z', 'Monthly production data for oil, gas, and water from Field Z', 'org_inpex', 'by_request', '.csv, .xlsx', 20971520, 'Time-series data, well-level aggregation', 'Monthly production data for oil, gas, and water from all wells in Field Z for the last 5 years.', 'production, oil, gas, water, time-series', 'Sumatra Basin', '2019-01-01', '2024-01-01', '2.0'),
('ds004', 'Geochemical Analysis Report', 'Regional geochemical analysis of source rocks', 'org_skkmigas', 'open', '.pdf, .xls', 31457280, 'TOC, Rock-Eval pyrolysis, vitrinite reflectance data', 'Regional geochemical analysis of source rocks in the East Java basin.', 'geochemical, source rock, TOC, pyrolysis', 'East Java Basin', '2023-01-01', '2023-12-31', '1.0'),
('ds005', 'Gravity & Magnetic Survey - Basin Y', 'High-resolution airborne gravity and magnetic survey data', 'org_bp', 'restricted', '.grd, .gdb, .png', 41943040000, 'Gridded data, processed maps', 'High-resolution airborne gravity and magnetic survey data covering the entire Y basin.', 'gravity, magnetic, airborne, survey', 'Kalimantan Basin', '2022-01-01', '2022-12-31', '1.0');

-- Insert Asset Vocabulary mappings
INSERT INTO asset_vocabulary (asset_id, vocabulary_id) VALUES
('ds001', 'vocab_seismic_3d'),
('ds001', 'vocab_working_area'),
('ds002', 'vocab_well_log'),
('ds002', 'vocab_well'),
('ds003', 'vocab_production'),
('ds003', 'vocab_field'),
('ds004', 'vocab_well'),
('ds005', 'vocab_seismic');

-- Insert Policies
INSERT INTO policies (id, name, description, policy_type, policy_rules, permissions_count, prohibitions_count, obligations_count, status, created_by) VALUES
('pol_unrestricted', 'Unrestricted Policy', 'Open access with minimal restrictions', 'access', '{"access": "public", "attribution": "required"}', 1, 0, 1, 'active', 'usr01'),
('pol_standard_contract', 'Standard Contract', 'Standard contractual terms for data sharing', 'contract', '{"term": "12 months", "liability": "limited", "termination": "30 days notice"}', 5, 2, 3, 'active', 'usr01'),
('pol_trusted_partner', 'Trusted Partner Policy', 'Enhanced access for trusted partners', 'access', '{"access": "restricted", "verification": "required", "audit": "enabled"}', 2, 0, 1, 'active', 'usr01'),
('pol_kkks_internal', 'KKKS Internal Use', 'Internal use policy for KKKS companies', 'usage', '{"use": "internal_only", "sharing": "prohibited", "retention": "5 years"}', 3, 1, 2, 'active', 'usr02');

-- Insert Data Offers
INSERT INTO data_offers (id, asset_id, provider_id, access_policy_id, contract_policy_id, price, currency, valid_from, valid_until, status) VALUES
('offer_seismic_q1', 'ds001', 'org_phe', 'pol_trusted_partner', 'pol_standard_contract', 25000.00, 'USD', NOW(), NOW() + INTERVAL '6 months', 'active'),
('offer_well_log_2024', 'ds002', 'org_medco', 'pol_unrestricted', 'pol_standard_contract', 0.00, 'USD', NOW(), NOW() + INTERVAL '1 year', 'active'),
('offer_production_z', 'ds003', 'org_inpex', 'pol_kkks_internal', 'pol_standard_contract', 15000.00, 'USD', NOW(), NOW() + INTERVAL '3 months', 'active');

-- Insert Contracts
INSERT INTO contracts (id, data_offer_id, provider_id, consumer_id, contract_terms, signed_at, status) VALUES
('contract_demo_1', 'offer_well_log_2024', 'org_medco', 'org_phe', '{"term": "12 months", "access_level": "full", "attribution": "required"}', NOW() - INTERVAL '30 days', 'active'),
('contract_seismic_q1_5', 'offer_seismic_q1', 'org_phe', 'org_inpex', '{"term": "6 months", "access_level": "restricted", "usage": "internal_only"}', NOW() - INTERVAL '15 days', 'active');

-- Insert Data Transfers
INSERT INTO data_transfers (id, contract_id, transfer_type, transfer_state, file_size, bytes_transferred, transfer_start, transfer_end) VALUES
('transfer_123', 'contract_demo_1', 'download', 'completed', 104857600, 104857600, NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days' + INTERVAL '2 hours'),
('transfer_456', 'contract_seismic_q1_5', 'stream', 'in_progress', 52428800000, 26214400000, NOW() - INTERVAL '2 hours', NULL);

-- Insert Broker Connections
INSERT INTO broker_connections (id, name, organization_id, connection_type, endpoint_url, sync_frequency, last_sync, status) VALUES
('broker_phe', 'PHE Data Connector', 'org_phe', 'api', 'https://api.phe.co.id/data', 'daily', NOW() - INTERVAL '30 minutes', 'active'),
('broker_medco', 'MEDCO Integration', 'org_medco', 'api', 'https://data.medcoenergi.com/api/v1', 'daily', NOW() - INTERVAL '25 minutes', 'active'),
('broker_inpex', 'INPEX Data Bridge', 'org_inpex', 'sftp', 'sftp://data.inpex.co.jp', 'daily', NOW() - INTERVAL '14 hours', 'inactive'),
('broker_bp', 'BP Data Gateway', 'org_bp', 'api', 'https://api.bp.com/indonesia', 'daily', NOW() - INTERVAL '65 minutes', 'active'),
('broker_emp', 'EMP Connector', 'org_emp', 'ftp', 'ftp://data.emp.id', 'daily', NOW() - INTERVAL '2 days', 'error');

-- Insert Transaction Logs
INSERT INTO transaction_logs (id, user_id, organization_id, action_type, target_type, target_id, status, ip_address, created_at) VALUES
('log01', 'usr04', 'org_inpex', 'download', 'asset', 'ds002', 'success', '192.168.1.100', NOW() - INTERVAL '6 hours'),
('log02', 'usr03', 'org_medco', 'request_access', 'asset', 'ds001', 'pending', '192.168.1.101', NOW() - INTERVAL '1 day'),
('log03', 'usr01', 'org_skkmigas', 'approve_access', 'user', 'usr03', 'success', '192.168.1.102', NOW() - INTERVAL '20 hours'),
('log04', 'usr02', 'org_phe', 'search', 'system', NULL, 'success', '192.168.1.103', NOW() - INTERVAL '12 hours'),
('log05', NULL, NULL, 'sync_metadata', 'organization', 'org_emp', 'failed', '10.0.0.1', NOW() - INTERVAL '2 days');

-- Insert Notifications
INSERT INTO notifications (id, user_id, title, message, notification_type, related_type, related_id, read_at) VALUES
('notif_1', 'usr03', 'Access Granted', 'Your request to access "Seismic Survey Block A-1" has been approved.', 'access_granted', 'asset', 'ds001', NULL),
('notif_2', 'usr02', 'New Dataset', 'A new dataset "Well Log Data - Well Y-12" from Beta Petroleum is now available.', 'new_dataset', 'asset', 'ds002', NULL),
('notif_3', 'usr06', 'Sync Failure', 'Metadata synchronization with Gamma Energy failed. Please check connection status.', 'sync_failure', 'system', 'broker_emp', NOW() - INTERVAL '1 hour');

-- Insert User Subscriptions
INSERT INTO user_subscriptions (id, user_id, subscription_type, subscription_value, notification_frequency, is_active) VALUES
('sub_1', 'usr02', 'vocabulary_term', 'vocab_seismic', 'immediate', TRUE),
('sub_2', 'usr03', 'organization', 'org_phe', 'daily', TRUE),
('sub_3', 'usr04', 'asset_type', 'seismic', 'weekly', TRUE),
('sub_4', 'usr01', 'all_new_assets', NULL, 'immediate', TRUE);

-- Insert Access Requests
INSERT INTO access_requests (id, asset_id, requester_id, requester_organization_id, request_reason, intended_use, request_status, reviewed_by, reviewed_at) VALUES
('req_1', 'ds001', 'usr03', 'org_medco', 'Required for regional geological study', 'Academic research and basin analysis', 'approved', 'usr01', NOW() - INTERVAL '12 hours'),
('req_2', 'ds003', 'usr07', 'org_vendor_a', 'Benchmarking analysis for client proposal', 'Commercial analysis', 'pending', NULL, NULL),
('req_3', 'ds005', 'usr04', 'org_inpex', 'Integration with existing gravity data', 'Exploration planning', 'approved', 'usr05', NOW() - INTERVAL '2 days');

-- Insert System Settings
INSERT INTO system_settings (id, setting_key, setting_value, setting_type, description, is_public, updated_by) VALUES
('set_1', 'max_file_size', '53687091200', 'number', 'Maximum file size for uploads in bytes (50GB)', FALSE, 'usr01'),
('set_2', 'default_access_policy', 'pol_unrestricted', 'string', 'Default access policy for new assets', FALSE, 'usr01'),
('set_3', 'enable_notifications', 'true', 'boolean', 'Enable system notifications', TRUE, 'usr01'),
('set_4', 'supported_formats', '["sgy", "las", "csv", "xlsx", "pdf", "png", "jpg", "grd", "gdb"]', 'json', 'Supported file formats', TRUE, 'usr01');

-- Insert API Keys
INSERT INTO api_keys (id, organization_id, key_name, api_key_hash, permissions, rate_limit_per_hour, expires_at, is_active, created_by) VALUES
('key_1', 'org_phe', 'PHE Production API', 'sha256:abcd1234...', '{"read": ["assets", "offers"], "write": ["assets"]}', 5000, NOW() + INTERVAL '1 year', TRUE, 'usr02'),
('key_2', 'org_medco', 'MEDCO Integration Key', 'sha256:efgh5678...', '{"read": ["assets"], "sync": ["metadata"]}', 2000, NOW() + INTERVAL '6 months', TRUE, 'usr03'),
('key_3', 'org_vendor_a', 'External Partner Access', 'sha256:ijkl9012...', '{"read": ["public_assets"]}', 100, NOW() + INTERVAL '3 months', TRUE, 'usr07');

-- Update sequences to avoid conflicts (PostgreSQL specific)
-- Note: This ensures auto-generated IDs don't conflict with manual insertions
SELECT setval(pg_get_serial_sequence('organizations', 'id'), (SELECT COUNT(*) FROM organizations));
SELECT setval(pg_get_serial_sequence('users', 'id'), (SELECT COUNT(*) FROM users));
SELECT setval(pg_get_serial_sequence('assets', 'id'), (SELECT COUNT(*) FROM assets));