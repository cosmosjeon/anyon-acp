import { getDatabase } from '../index.js';

/**
 * User Repository - handles all user CRUD operations (PostgreSQL)
 */
class UserRepository {
  constructor() {
    this.pool = getDatabase();
  }

  /**
   * Create a new user
   * @param {Object} user - User object
   * @returns {Promise<Object>} Created user
   */
  async create(user) {
    const { id, email, name, profilePicture, googleId, passwordHash, emailVerified, subscription } = user;

    await this.pool.query(
      `INSERT INTO users (id, email, name, profile_picture, google_id, password_hash, email_verified, plan_type, subscription_status, current_period_end)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        id,
        email,
        name,
        profilePicture || null,
        googleId || null,
        passwordHash || null,
        emailVerified || false,
        subscription.planType,
        subscription.status,
        subscription.currentPeriodEnd || null
      ]
    );

    return this.findById(id);
  }

  /**
   * Find user by ID
   * @param {string} id - User ID
   * @returns {Promise<Object|null>} User object or null
   */
  async findById(id) {
    const result = await this.pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows.length > 0 ? this._mapRowToUser(result.rows[0]) : null;
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User object or null
   */
  async findByEmail(email) {
    const result = await this.pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows.length > 0 ? this._mapRowToUser(result.rows[0]) : null;
  }

  /**
   * Find user by Google ID
   * @param {string} googleId - Google OAuth ID
   * @returns {Promise<Object|null>} User object or null
   */
  async findByGoogleId(googleId) {
    const result = await this.pool.query('SELECT * FROM users WHERE google_id = $1', [googleId]);
    return result.rows.length > 0 ? this._mapRowToUser(result.rows[0]) : null;
  }

  /**
   * Update user
   * @param {string} id - User ID
   * @param {Object} user - Updated user data
   * @returns {Promise<Object|null>} Updated user or null
   */
  async update(id, user) {
    const { email, name, profilePicture, googleId, subscription } = user;

    await this.pool.query(
      `UPDATE users
       SET email = $1, name = $2, profile_picture = $3, google_id = $4, plan_type = $5, subscription_status = $6, current_period_end = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8`,
      [
        email,
        name,
        profilePicture || null,
        googleId || null,
        subscription.planType,
        subscription.status,
        subscription.currentPeriodEnd || null,
        id
      ]
    );

    return this.findById(id);
  }

  /**
   * Update user subscription
   * @param {string} id - User ID
   * @param {Object} subscription - Subscription data
   * @returns {Promise<Object|null>} Updated user or null
   */
  async updateSubscription(id, subscription) {
    const { planType, status, currentPeriodEnd } = subscription;

    await this.pool.query(
      `UPDATE users
       SET plan_type = $1, subscription_status = $2, current_period_end = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [planType, status, currentPeriodEnd || null, id]
    );

    return this.findById(id);
  }

  /**
   * Verify user email
   * @param {string} id - User ID
   * @returns {Promise<Object|null>} Updated user or null
   */
  async verifyEmail(id) {
    await this.pool.query(
      `UPDATE users SET email_verified = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [id]
    );
    return this.findById(id);
  }

  /**
   * Update user password
   * @param {string} id - User ID
   * @param {string} passwordHash - Bcrypt password hash
   * @returns {Promise<Object|null>} Updated user or null
   */
  async updatePassword(id, passwordHash) {
    await this.pool.query(
      `UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [passwordHash, id]
    );
    return this.findById(id);
  }

  /**
   * Delete user
   * @param {string} id - User ID
   * @returns {Promise<boolean>} True if deleted, false otherwise
   */
  async delete(id) {
    const result = await this.pool.query('DELETE FROM users WHERE id = $1', [id]);
    return result.rowCount > 0;
  }

  /**
   * List all users
   * @returns {Promise<Array>} Array of user objects
   */
  async list() {
    const result = await this.pool.query('SELECT * FROM users ORDER BY created_at DESC');
    return result.rows.map(row => this._mapRowToUser(row));
  }

  /**
   * Map database row to user object
   * @private
   * @param {Object} row - Database row
   * @returns {Object} User object
   */
  _mapRowToUser(row) {
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      profilePicture: row.profile_picture,
      googleId: row.google_id,
      passwordHash: row.password_hash,
      emailVerified: row.email_verified === true,
      subscription: {
        planType: row.plan_type,
        status: row.subscription_status,
        currentPeriodEnd: row.current_period_end,
      },
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export default new UserRepository();
