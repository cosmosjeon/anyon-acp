import { v4 as uuidv4 } from 'uuid';

/**
 * Create a user object with consistent structure
 * @param {Object} params - User parameters
 * @param {string} [params.id] - User ID (auto-generated if not provided)
 * @param {string} params.email - User email
 * @param {string} params.name - User name
 * @param {string} [params.googleId] - Google OAuth ID
 * @param {string} [params.profilePicture] - Profile picture URL
 * @param {string} [params.planType='FREE'] - Subscription plan type ('FREE' or 'PRO')
 * @param {string} [params.status='ACTIVE'] - Subscription status
 * @returns {Object} User object
 */
export function createUser({
  id = uuidv4(),
  email,
  name,
  googleId = null,
  profilePicture = null,
  planType = 'FREE',
  status = 'ACTIVE',
}) {
  const user = {
    id,
    email,
    name,
    profilePicture,
    subscription: {
      planType,
      status,
    },
  };

  // Add googleId if provided
  if (googleId) {
    user.googleId = googleId;
  }

  // Add currentPeriodEnd for PRO users
  if (planType === 'PRO') {
    user.subscription.currentPeriodEnd = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    ).toISOString();
  }

  return user;
}
