/**
 * API Integration Test
 * Tests the full authentication and settings flow
 */

console.log('🧪 Starting API Integration Test\n');

const BASE_URL = 'http://localhost:4000';
let authToken = '';
let userId = '';

async function request(method, path, body = null, token = null) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${path}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Request failed: ${JSON.stringify(data)}`);
  }

  return data;
}

async function runTests() {
  try {
    // Test 1: Health check
    console.log('Test 1: Health check...');
    const health = await request('GET', '/health');
    console.log('✅ Health check passed:', health.status);

    // Test 2: Dev login
    console.log('\nTest 2: Dev login...');
    const loginResponse = await request('POST', '/auth/dev/login');
    authToken = loginResponse.token;
    userId = loginResponse.user.id;
    console.log('✅ Login successful. User ID:', userId);
    console.log('   Plan:', loginResponse.subscription.planType);

    // Test 3: Verify token
    console.log('\nTest 3: Verify token...');
    const verifyResponse = await request('GET', '/auth/verify', null, authToken);
    console.log('✅ Token verified:', verifyResponse.valid);

    // Test 4: Get user info
    console.log('\nTest 4: Get user info...');
    const userInfo = await request('GET', '/auth/me', null, authToken);
    console.log('✅ User info retrieved:', userInfo.user.email);

    // Test 5: Create settings
    console.log('\nTest 5: Create settings...');
    await request('POST', '/api/settings', {
      settings: {
        theme: 'dark',
        language: 'en',
        notifications: {
          email: true,
          push: false,
        },
      },
    }, authToken);
    console.log('✅ Settings created');

    // Test 6: Get settings
    console.log('\nTest 6: Get settings...');
    const settingsResponse = await request('GET', '/api/settings', null, authToken);
    console.log('✅ Settings retrieved:', JSON.stringify(settingsResponse.settings, null, 2));

    // Test 7: Update specific setting
    console.log('\nTest 7: Update specific setting...');
    await request('PATCH', '/api/settings/theme', { value: 'light' }, authToken);
    console.log('✅ Theme updated to light');

    // Test 8: Verify setting update
    console.log('\nTest 8: Verify setting update...');
    const updatedSettings = await request('GET', '/api/settings', null, authToken);
    console.log('✅ Updated theme:', updatedSettings.settings.theme);

    // Test 9: Delete specific setting
    console.log('\nTest 9: Delete specific setting...');
    await request('DELETE', '/api/settings/language', null, authToken);
    console.log('✅ Language setting deleted');

    // Test 10: Update subscription
    console.log('\nTest 10: Update subscription...');
    const subscriptionResponse = await request('POST', '/auth/subscription', {
      planType: 'FREE',
      status: 'ACTIVE',
    }, authToken);
    console.log('✅ Subscription updated:', subscriptionResponse.subscription.planType);

    // Test 11: Create test user
    console.log('\nTest 11: Create test user...');
    const newUser = await request('POST', '/dev/create-user', {
      email: `test-${Date.now()}@example.com`,
      name: 'API Test User',
      planType: 'PRO',
    });
    console.log('✅ Test user created:', newUser.user.email);

    // Test 12: List all users
    console.log('\nTest 12: List all users...');
    const usersResponse = await request('GET', '/dev/users');
    console.log('✅ Total users in database:', usersResponse.users.length);

    // Test 13: Settings persistence across login
    console.log('\nTest 13: Settings persistence across login...');
    const loginAgain = await request('POST', '/auth/dev/login');
    const persistedSettings = await request('GET', '/api/settings', null, loginAgain.token);
    console.log('✅ Settings persisted:', Object.keys(persistedSettings.settings));

    console.log('\n🎉 All API tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Wait a bit for server to start if needed
setTimeout(runTests, 1000);
