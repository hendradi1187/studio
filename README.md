# SPEKTOR SDSC

SPEKTOR SDSC adalah platform pertukaran data modern untuk industri oil & gas yang dibangun dengan Next.js 15, PostgreSQL, dan teknologi web terkini.

## 🚀 Quick Start

### Development Mode
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser
http://localhost:9002
```

### Demo Credentials
```
Email: admin@spektra.com
Password: password123
```

## 📋 Features

### ✅ Implemented Features

#### 🔐 Authentication & User Management
- **JWT Authentication** dengan access & refresh tokens
- **Role-Based Access Control (RBAC)** dengan 8 user roles
- **Profile Management** dengan upload foto profil
- **Password Visibility Toggle** di login form
- **LDAP Integration** untuk enterprise authentication

#### 📊 Data Management
- **Asset Management** dengan search dan pagination
- **Policy Management** untuk data governance
- **Data Offers** dan contract management
- **Transfer History** tracking
- **Vocabulary Management** untuk data categories

#### 🔄 System Integration
- **Broker/Connector Management** untuk external systems
- **Catalog Browser** untuk data discovery
- **Real-time Notifications** sistem
- **Audit Logging** untuk compliance

#### 🎨 User Interface
- **Modern Design** dengan Tailwind CSS dan shadcn/ui
- **Dark/Light Theme** toggle
- **Responsive Design** untuk mobile & desktop
- **Professional Color Scheme** dengan gradient effects
- **File Upload** dengan drag & drop support

## 🗄️ Database Architecture

SPEKTOR SDSC menggunakan **satu database PostgreSQL** yang terstruktur modern dan profesional untuk semua operasi aplikasi.

### 📊 Database Overview
- **Database Name**: `spektra_db`
- **Type**: PostgreSQL dengan UUID extension
- **Total Tables**: 15 tables utama dengan proper relationships
- **Custom Types**: 14 enum types untuk data consistency
- **Indexes**: 50+ indexes untuk performance optimal
- **Triggers**: Auto-update timestamps pada semua tables

### 🏗️ Database Structure

#### **Core Entities**
```sql
📋 organizations       # Organisasi (SKK Migas, PHE, MEDCO, dll)
👥 users               # User management dengan RBAC
🔐 user_roles          # Role definitions dengan permissions
📚 vocabulary_terms    # Taxonomy/kategori data oil & gas
```

#### **Data Management**
```sql
📁 assets              # Data assets (seismic, well logs, interpretations)
📊 asset_vocabulary    # Mapping assets ke categories
🛡️ policies           # Access, contract, usage policies
💰 data_offers         # Commercial data offerings
```

#### **Business Operations**
```sql
📋 contracts           # Legal agreements & terms
📤 data_transfers      # Transfer tracking & progress logs
🔌 broker_connections  # External system integrations
📨 access_requests     # Data access approval workflow
```

#### **System & Audit**
```sql
📝 transaction_logs    # Comprehensive audit trail
🔔 notifications       # User notification system
⚙️ system_settings     # Application configuration
🔑 api_keys           # API access management
👤 user_subscriptions # Notification preferences
```

### 🚀 Database Setup

#### **Option 1: Quick Setup (Recommended)**
```bash
# 1. Create database
createdb spektra_db

# 2. Run all setup scripts in order
psql -d spektra_db -f database/spektra_schema.sql
psql -d spektra_db -f database/add_profile_photo_migration.sql
psql -d spektra_db -f database/add_ldap_support_migration.sql
psql -d spektra_db -f database/sample_data.sql
```

#### **Option 2: Using NPM Scripts**
```bash
# Create database manually first
createdb spektra_db

# Then use npm scripts
npm run db:schema    # Install main schema
npm run db:migrate   # Run all migrations  
npm run db:sample    # Load sample data
npm run db:reset     # Reset everything (dangerous!)
```

### 📁 Database Files Explained

#### **1. `spektra_schema.sql`** - Main Database Schema
- ✅ Creates all 15 tables with proper relationships
- ✅ Defines 14 custom ENUM types for oil & gas industry
- ✅ Sets up 50+ performance indexes
- ✅ Configures foreign key constraints
- ✅ Installs auto-update timestamp triggers

#### **2. `add_profile_photo_migration.sql`** - Profile Photo Feature
- ✅ Adds `profile_photo` column to users table
- ✅ Creates performance index for photo queries
- ✅ Supports /images/profiles/ folder structure

#### **3. `add_ldap_support_migration.sql`** - Enterprise Authentication
- ✅ Creates `ldap_configurations` table
- ✅ Adds LDAP tracking columns to users table
- ✅ Supports multiple LDAP servers
- ✅ Enables hybrid local + LDAP authentication

#### **4. `sample_data.sql`** - Development Data
- ✅ Indonesian oil & gas organizations (SKK Migas, PHE, MEDCO, etc)
- ✅ Realistic user roles and permissions
- ✅ Sample seismic and well log datasets
- ✅ Professional vocabulary terms for industry

### 🔧 Database Features

#### **Professional Features**
- ✅ **Data Integrity**: Proper foreign key constraints
- ✅ **Performance**: Strategic indexes on all search fields
- ✅ **Audit Trail**: Complete transaction logging
- ✅ **Scalability**: Supports millions of records
- ✅ **Security**: RBAC with granular permissions

#### **Modern PostgreSQL Features**
- ✅ **JSONB**: Flexible metadata storage
- ✅ **UUID**: Collision-resistant primary keys  
- ✅ **INET**: IP address tracking
- ✅ **Full-text Search**: Advanced asset discovery
- ✅ **Custom Types**: Industry-specific ENUMs

#### **Oil & Gas Industry Specific**
- ✅ **Seismic Data**: 3D/2D survey attributes
- ✅ **Well Logs**: Wireline data specifications
- ✅ **Geographic**: Area and coordinate tracking
- ✅ **Temporal**: Time period ranges for data
- ✅ **File Handling**: Large dataset size tracking

## 🔐 LDAP Integration

### ✅ Fitur LDAP Lengkap

#### **Hybrid Authentication**
- Support local + LDAP authentication
- Auto user creation dari LDAP saat login pertama
- Fallback authentication jika LDAP gagal
- Username extraction otomatis dari email

#### **LDAP Configuration Management**
- Multiple LDAP servers support
- Secure password storage dengan encryption
- Configuration validation sebelum save
- Enable/disable per configuration

#### **User Synchronization**
- Bulk sync semua user dari LDAP server
- Auto organization assignment
- Conflict resolution untuk user existing
- Real-time progress feedback

#### **Connection Testing**
- Test koneksi sebelum save configuration
- Real-time feedback dengan toast notifications
- Detail error messages untuk debugging
- Mock mode untuk development testing

### 🔧 LDAP Setup

#### **1. Konfigurasi LDAP**
1. Login sebagai admin
2. Navigate ke **User Management**
3. Klik **"Connect LDAP"** button
4. Isi form configuration:
   - **Configuration Name**: `Main LDAP Server`
   - **Server URL**: `ldap://spektra.com:389`
   - **Port**: `389` (default)
   - **Bind DN**: `cn=admin,dc=spektra,dc=com`
   - **Bind Password**: `[LDAP admin password]`
   - **Base DN**: `ou=users,dc=spektra,dc=com`

#### **2. Test & Save**
1. Klik **"Test Connection"** untuk verify
2. Klik **"Save & Sync"** untuk simpan dan sync users
3. Konfirmasi untuk import users dari LDAP

#### **3. LDAP Login**
- Format: `username@spektra.com`
- Password: LDAP password user
- User otomatis dibuat jika belum ada

### 📊 LDAP API Endpoints
```typescript
POST /api/ldap/config      // Save LDAP configuration  
GET  /api/ldap/config      // Get LDAP configurations
POST /api/ldap/test        // Test LDAP connection
POST /api/ldap/sync        // Sync users from LDAP
```

## 📁 Project Structure

```
spektor-sdsc/
├── src/
│   ├── app/                    # Next.js 15 App Router
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (dashboard)/       # Dashboard pages
│   │   └── api/               # API endpoints
│   ├── components/            # Reusable UI components
│   │   └── ui/               # shadcn/ui components
│   ├── lib/                  # Utility libraries
│   │   ├── auth.ts           # JWT authentication
│   │   ├── database.ts       # PostgreSQL connection
│   │   ├── ldap.ts           # LDAP integration
│   │   └── validation.ts     # Zod schemas
│   └── hooks/                # Custom React hooks
├── database/                 # Database schemas & migrations
├── public/                   # Static assets
│   └── images/              # Organized image structure
│       ├── profiles/        # User profile photos
│       ├── assets/          # Asset images
│       ├── logos/           # Organization logos
│       └── icons/           # App icons
└── docs/                    # Documentation
```

## 🎨 File Upload & Images

### Professional Image Structure
```
public/images/
├── profiles/     # User profile photos (user_[id].[ext])
├── assets/       # Data asset images  
├── logos/        # Organization logos
└── icons/        # Application icons
```

### Upload Features
- **Profile Photo Upload** dengan validasi format & size
- **Drag & Drop Support** untuk user experience
- **Real-time Preview** dan cropping suggestions
- **Auto-naming Convention** untuk konsistensi
- **CDN Ready** untuk production optimization

## 🔧 Development

### Mock Mode
```env
# .env.local
NODE_ENV=development
ENABLE_MOCK_DB=true
LDAP_MOCK=true
```

- **Mock Database**: Development tanpa PostgreSQL
- **Mock LDAP**: Testing LDAP tanpa server real
- **Sample Data**: Pre-loaded demo data

### Scripts
```bash
npm run dev          # Development server dengan hot reload
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint checking
npm run typecheck    # TypeScript type checking
```

### Testing
```bash
# API Integration Test
node test-api-integration.js

# Test all endpoints
npm run test:api
```

## 🚀 Production Deployment

### Environment Variables
```env
# Database
DB_HOST=localhost
DB_NAME=spektra_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_PORT=5432

# JWT
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret

# LDAP (Production)
LDAP_MOCK=false
```

### Database Setup
1. Install PostgreSQL
2. Run migration scripts
3. Configure connection pooling
4. Setup backup strategy

### LDAP Production
1. Install LDAP library: `npm install ldapjs`
2. Configure real LDAP client
3. Update connection settings
4. Test with actual LDAP server

## 🎯 Key Features Demo

### 1. Authentication Flow
- Modern login form dengan gradient design
- Password visibility toggle
- JWT dengan automatic refresh
- Role-based dashboard access

### 2. Profile Management
- Upload profile photo (JPG/PNG/WebP, max 2MB)
- Real-time avatar updates across app
- Professional form design
- Secure file handling

### 3. LDAP Integration
- Enterprise-ready authentication
- User synchronization from directory
- Hybrid local + LDAP support
- Admin configuration interface

### 4. Data Management
- Asset catalog dengan search
- Policy dan contract management
- Transfer history tracking
- Vocabulary organization

## 📡 API Documentation

### 🔐 Authentication

All API endpoints (except authentication) require Bearer token authentication.

#### Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Authentication Endpoints

**POST /api/auth/sign-in** - Login with email and password
```json
{
  "email": "admin@spektra.com",
  "password": "password123"
}
```

**POST /api/auth/refresh** - Refresh access token
**GET /api/auth/me** - Get current user information

### 👥 User Management

**GET /api/users** - Get users with pagination
- Query: `page`, `limit`, `search`, `sortBy`, `sortOrder`

**POST /api/users** - Create new user
**GET /api/users/[id]** - Get user details
**PUT /api/users/[id]** - Update user
**DELETE /api/users/[id]** - Delete user

### 📊 Asset Management

**GET /api/assets** - Get assets with search & filtering
**POST /api/assets** - Create new asset
**GET /api/assets/[id]** - Get asset details
**PUT /api/assets/[id]** - Update asset
**DELETE /api/assets/[id]** - Delete asset

### 🔐 LDAP Endpoints

**POST /api/ldap/config** - Save LDAP configuration
**GET /api/ldap/config** - Get LDAP configurations
**POST /api/ldap/test** - Test LDAP connection
**POST /api/ldap/sync** - Sync users from LDAP

### 📤 File Upload

**POST /api/upload/profile-photo** - Upload profile photo
- Supports: JPG, PNG, WebP (max 2MB)
- Auto-naming: `user_[id].[ext]`

### Error Responses
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": ["Validation details"]
}
```

## 🗄️ Database Migrations

### Profile Photo Migration
```bash
# Add profile photo support
psql -d spektra_db -f database/add_profile_photo_migration.sql

# Verify migration
psql -d spektra_db -c "\d users"
```

### LDAP Integration Migration
```bash
# Add LDAP support
psql -d spektra_db -f database/add_ldap_support_migration.sql
```

### Database Maintenance
```bash
# Full backup
pg_dump -U spektra_user spektra_db > backup_$(date +%Y%m%d).sql

# Restore backup
psql -U spektra_user spektra_db < backup_20241201.sql

# Performance monitoring
psql -d spektra_db -c "SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size FROM pg_tables WHERE schemaname = 'public' ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"
```

## 🎨 Design System

### Core Features
- **User Dashboard**: Dataset listings dengan search dan filtering
- **User Management**: Role-Based Access Control (RBAC)
- **Vocabulary Provider**: AI-assisted controlled vocabulary
- **Metadata Broker**: Simulasi koneksi ke sumber data eksternal
- **Transaction Logs**: Log aktivitas user lengkap
- **Notification Manager**: Subscribe dan notify untuk dataset baru

### Style Guidelines
- **Primary Color**: Deep sky blue (#3498db) untuk modern feel
- **Background**: Light grayish-blue (#ecf0f1) untuk soft background
- **Accent Color**: Orange (#e67e22) untuk CTA dan notifications
- **Typography**: 'Inter' untuk body/headlines, 'Source Code Pro' untuk code
- **Layout**: Grid-based untuk organized navigation
- **Animations**: Subtle transitions untuk smooth UX

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push ke branch
5. Create Pull Request

## 📄 License

MIT License - see LICENSE file for details.

---

**SPEKTOR SDSC** - Modern Data Exchange Platform for Oil & Gas Industry
