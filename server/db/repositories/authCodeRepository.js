import { getDatabase } from '../index.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * AuthCode Repository - handles authentication code operations (PostgreSQL)
 */
class AuthCodeRepository {
  constructor() {
    this.pool = getDatabase();
  }

  /**
   * Create new authentication code
   * @param {string} userId
   * @param {string} codeType - 'EMAIL_VERIFY' or 'PASSWORD_RESET'
   * @param {string} code - 6-digit code
   * @param {string} expiresAt - ISO timestamp
   * @returns {Promise<object>} Created code
   */
  async createCode(userId, codeType, code, expiresAt) {
    const id = uuidv4();
    await this.pool.query(
      `INSERT INTO auth_codes (id, user_id, code_type, code, expires_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, userId, codeType, code, expiresAt]
    );
    return { id, userId, codeType, code, expiresAt, attempts: 0 };
  }

  /**
   * Find authentication code by code and type
   * @param {string} code - 6-digit code
   * @param {string} codeType - 'EMAIL_VERIFY' or 'PASSWORD_RESET'
   * @returns {Promise<object|null>}
   */
  async findByCode(code, codeType) {
    const result = await this.pool.query(
      `SELECT * FROM auth_codes WHERE code = $1 AND code_type = $2`,
      [code, codeType]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Find latest code for user by type
   * @param {string} userId
   * @param {string} codeType
   * @returns {Promise<object|null>}
   */
  async findByUserId(userId, codeType) {
    const result = await this.pool.query(
      `SELECT * FROM auth_codes
       WHERE user_id = $1 AND code_type = $2
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId, codeType]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Increment code verification attempts
   * @param {string} codeId
   */
  async incrementAttempts(codeId) {
    await this.pool.query(
      `UPDATE auth_codes SET attempts = attempts + 1 WHERE id = $1`,
      [codeId]
    );
  }

  /**
   * Delete specific authentication code
   * @param {string} codeId
   */
  async deleteCode(codeId) {
    await this.pool.query('DELETE FROM auth_codes WHERE id = $1', [codeId]);
  }

  /**
   * Delete all codes for user of specific type
   * @param {string} userId
   * @param {string} codeType
   */
  async deleteUserCodes(userId, codeType) {
    await this.pool.query(
      'DELETE FROM auth_codes WHERE user_id = $1 AND code_type = $2',
      [userId, codeType]
    );
  }

  /**
   * Clean up expired authentication codes
   * @returns {Promise<number>} Number of deleted codes
   */
  async cleanupExpired() {
    const result = await this.pool.query(
      'DELETE FROM auth_codes WHERE expires_at < CURRENT_TIMESTAMP'
    );
    return result.rowCount;
  }
}

// Singleton instance
const authCodeRepository = new AuthCodeRepository();
export default authCodeRepository;
