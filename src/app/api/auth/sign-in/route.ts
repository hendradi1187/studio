import { NextRequest } from 'next/server';
import { query } from '@/lib/database';
import { verifyPassword, generateAccessToken, generateRefreshToken } from '@/lib/auth';
import { validateBody, signInSchema } from '@/lib/validation';
import { asyncHandler, errorResponse, successResponse, AuthenticationError, ValidationError } from '@/lib/errors';
import { authenticateWithLDAP } from '@/lib/ldap';

async function signInHandler(request: NextRequest) {
  const body = await request.json();
  
  // Validate request body
  const validation = validateBody(signInSchema, body);
  if (!validation.success) {
    return errorResponse(new ValidationError('Invalid input', validation.errors));
  }
  
  const { email, password } = validation.data;
  
  // Get user from database
  const userResult = await query(
    `SELECT u.id, u.email, u.name, u.password_hash, u.organization_id, u.role_id, u.status,
            o.name as organization_name, r.name as role_name
     FROM users u
     LEFT JOIN organizations o ON u.organization_id = o.id
     LEFT JOIN user_roles r ON u.role_id = r.id
     WHERE u.email = $1`,
    [email]
  );
  
  let user = null;
  let isLDAPUser = false;

  if (userResult.rows.length === 0) {
    // User not found in local database, try LDAP authentication
    console.log(`🔍 User ${email} not found locally, trying LDAP authentication...`);
    
    try {
      // Extract username from email (assuming format: username@domain.com)
      const username = email.split('@')[0];
      const ldapUser = await authenticateWithLDAP(username, password);
      
      if (ldapUser) {
        console.log(`✅ LDAP authentication successful for ${username}`);
        
        // Create user account from LDAP
        const newUserResult = await query(
          `INSERT INTO users (email, name, ldap_dn, auth_source, status, organization_id, role_id)
           VALUES ($1, $2, $3, 'ldap', 'active', 'org_skkmigas', 'role_regulator')
           RETURNING id, email, name, organization_id, role_id, status`,
          [ldapUser.email, ldapUser.name, ldapUser.dn]
        );
        
        // Get full user data with organization and role
        const fullUserResult = await query(
          `SELECT u.id, u.email, u.name, u.organization_id, u.role_id, u.status,
                  o.name as organization_name, r.name as role_name
           FROM users u
           LEFT JOIN organizations o ON u.organization_id = o.id
           LEFT JOIN user_roles r ON u.role_id = r.id
           WHERE u.id = $1`,
          [newUserResult.rows[0].id]
        );
        
        user = fullUserResult.rows[0];
        isLDAPUser = true;
      } else {
        throw new AuthenticationError('Invalid email or password');
      }
    } catch (error) {
      console.error('LDAP authentication error:', error);
      throw new AuthenticationError('Invalid email or password');
    }
  } else {
    user = userResult.rows[0];
    
    // Check if user is active
    if (user.status !== 'active') {
      throw new AuthenticationError('Account is not active');
    }
    
    // If user has LDAP DN, try LDAP authentication first
    if (user.ldap_dn && user.auth_source === 'ldap') {
      console.log(`🔍 User ${email} is LDAP user, trying LDAP authentication...`);
      
      try {
        const username = email.split('@')[0];
        const ldapUser = await authenticateWithLDAP(username, password);
        
        if (ldapUser) {
          console.log(`✅ LDAP authentication successful for ${username}`);
          isLDAPUser = true;
        } else {
          throw new AuthenticationError('LDAP authentication failed');
        }
      } catch (error) {
        console.error('LDAP authentication error:', error);
        // Fall back to local authentication if LDAP fails
        console.log('🔄 Falling back to local authentication...');
      }
    }
    
    // Local password verification (if not LDAP or LDAP failed)
    if (!isLDAPUser) {
      const isValidPassword = await verifyPassword(password, user.password_hash);
      if (!isValidPassword) {
        throw new AuthenticationError('Invalid email or password');
      }
    }
  }
  
  // Update last login
  await query(
    'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
    [user.id]
  );
  
  // Generate tokens
  const tokenPayload = {
    userId: user.id,
    email: user.email,
    organizationId: user.organization_id,
    roleId: user.role_id,
  };
  
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);
  
  // Log authentication
  await query(
    `INSERT INTO transaction_logs (user_id, organization_id, action_type, target_type, status, ip_address, user_agent)
     VALUES ($1, $2, 'login', 'system', 'success', $3, $4)`,
    [
      user.id,
      user.organization_id,
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    ]
  );
  
  return successResponse({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      organization: {
        id: user.organization_id,
        name: user.organization_name,
      },
      role: {
        id: user.role_id,
        name: user.role_name,
      },
      status: user.status,
    },
    tokens: {
      accessToken,
      refreshToken,
    },
  });
}

export const POST = asyncHandler(signInHandler);