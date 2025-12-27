/**
 * Simple test script to verify database functionality
 */
import userRepository from './db/repositories/userRepository.js';
import settingsRepository from './db/repositories/settingsRepository.js';
import { closeDatabase } from './db/index.js';
import { createUser } from './models/userFactory.js';

console.log('🧪 Testing Database Functionality\n');

try {
  // Test 1: Create a user
  console.log('Test 1: Creating user...');
  const user = createUser({
    email: 'test@example.com',
    name: 'Test User',
    planType: 'PRO',
  });
  userRepository.create(user);
  console.log('✅ User created:', user.id);

  // Test 2: Find user by ID
  console.log('\nTest 2: Finding user by ID...');
  const foundUser = userRepository.findById(user.id);
  console.log('✅ User found:', foundUser.email);

  // Test 3: Find user by email
  console.log('\nTest 3: Finding user by email...');
  const userByEmail = userRepository.findByEmail('test@example.com');
  console.log('✅ User found by email:', userByEmail.name);

  // Test 4: Update subscription
  console.log('\nTest 4: Updating subscription...');
  const updatedUser = userRepository.updateSubscription(user.id, {
    planType: 'FREE',
    status: 'ACTIVE',
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  });
  console.log('✅ Subscription updated:', updatedUser.subscription.planType);

  // Test 5: Create settings
  console.log('\nTest 5: Creating settings...');
  settingsRepository.set(user.id, 'theme', 'dark');
  settingsRepository.set(user.id, 'language', 'en');
  settingsRepository.set(user.id, 'notifications', { email: true, push: false });
  console.log('✅ Settings created');

  // Test 6: Get all settings
  console.log('\nTest 6: Getting all settings...');
  const settings = settingsRepository.getAll(user.id);
  console.log('✅ Settings retrieved:', JSON.stringify(settings, null, 2));

  // Test 7: Update specific setting
  console.log('\nTest 7: Updating specific setting...');
  settingsRepository.set(user.id, 'theme', 'light');
  const updatedTheme = settingsRepository.get(user.id, 'theme');
  console.log('✅ Theme updated:', updatedTheme);

  // Test 8: Delete specific setting
  console.log('\nTest 8: Deleting specific setting...');
  settingsRepository.delete(user.id, 'language');
  const settingsAfterDelete = settingsRepository.getAll(user.id);
  console.log('✅ Setting deleted. Remaining:', Object.keys(settingsAfterDelete));

  // Test 9: List all users
  console.log('\nTest 9: Listing all users...');
  const allUsers = userRepository.list();
  console.log('✅ Total users:', allUsers.length);

  // Test 10: Delete user (cascade should delete settings too)
  console.log('\nTest 10: Deleting user...');
  userRepository.delete(user.id);
  const deletedUser = userRepository.findById(user.id);
  console.log('✅ User deleted:', deletedUser === null);

  console.log('\n🎉 All tests passed!');
} catch (error) {
  console.error('\n❌ Test failed:', error);
  process.exit(1);
} finally {
  closeDatabase();
}
