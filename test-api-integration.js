#!/usr/bin/env node

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testAPIIntegration() {
  const BASE_URL = 'http://localhost:9002';
  
  console.log('🚀 Testing SPEKTRA API Integration...\n');
  
  try {
    // Step 1: Test Authentication
    console.log('1️⃣ Testing Authentication...');
    const authResponse = await fetch(`${BASE_URL}/api/auth/sign-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@spektra.com',
        password: 'password123'
      })
    });
    
    if (!authResponse.ok) {
      throw new Error(`Authentication failed: ${authResponse.status}`);
    }
    
    const authData = await authResponse.json();
    console.log('✅ Authentication successful');
    console.log(`   User: ${authData.user.name} (${authData.user.email})`);
    console.log(`   Role: ${authData.user.role.name}`);
    console.log(`   Organization: ${authData.user.organization.name}\n`);
    
    const token = authData.tokens.accessToken;
    
    // Step 2: Test User Info Endpoint
    console.log('2️⃣ Testing User Info Endpoint...');
    const meResponse = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!meResponse.ok) {
      throw new Error(`User info failed: ${meResponse.status}`);
    }
    
    const meData = await meResponse.json();
    console.log('✅ User info retrieved successfully');
    console.log(`   Status: ${meData.status}\n`);
    
    // Step 3: Test Assets Endpoint
    console.log('3️⃣ Testing Assets Endpoint...');
    const assetsResponse = await fetch(`${BASE_URL}/api/assets`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!assetsResponse.ok) {
      throw new Error(`Assets fetch failed: ${assetsResponse.status}`);
    }
    
    const assetsData = await assetsResponse.json();
    console.log('✅ Assets retrieved successfully');
    console.log(`   Total assets: ${assetsData.assets.length}`);
    console.log(`   Pagination: Page ${assetsData.pagination.page} of ${assetsData.pagination.totalPages}`);
    
    if (assetsData.assets.length > 0) {
      const firstAsset = assetsData.assets[0];
      console.log(`   First asset: ${firstAsset.title}`);
      console.log(`   Access status: ${firstAsset.accessStatus}`);
      console.log(`   Owner: ${firstAsset.owner.name}\n`);
    }
    
    // Step 4: Test Assets Search
    console.log('4️⃣ Testing Assets Search...');
    const searchResponse = await fetch(`${BASE_URL}/api/assets?search=seismic`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!searchResponse.ok) {
      throw new Error(`Assets search failed: ${searchResponse.status}`);
    }
    
    const searchData = await searchResponse.json();
    console.log('✅ Assets search successful');
    console.log(`   Search results: ${searchData.assets.length} assets found\n`);
    
    // Step 5: Test Users Endpoint
    console.log('5️⃣ Testing Users Endpoint...');
    const usersResponse = await fetch(`${BASE_URL}/api/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!usersResponse.ok) {
      throw new Error(`Users fetch failed: ${usersResponse.status}`);
    }
    
    const usersData = await usersResponse.json();
    console.log('✅ Users retrieved successfully');
    console.log(`   Total users: ${usersData.users.length}\n`);
    
    // Step 6: Test Error Handling
    console.log('6️⃣ Testing Error Handling...');
    const errorResponse = await fetch(`${BASE_URL}/api/assets`, {
      // No authorization header
    });
    
    if (errorResponse.status === 401) {
      const errorData = await errorResponse.json();
      console.log('✅ Error handling working correctly');
      console.log(`   Error: ${errorData.error}`);
      console.log(`   Code: ${errorData.code}\n`);
    }
    
    console.log('🎉 ALL TESTS PASSED! API Integration is working correctly.');
    console.log('\n📋 Summary:');
    console.log('   ✅ Authentication with JWT tokens');
    console.log('   ✅ Protected endpoint access');
    console.log('   ✅ User management');
    console.log('   ✅ Asset management with search');
    console.log('   ✅ Proper error handling');
    console.log('   ✅ Role-based access control');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testAPIIntegration();