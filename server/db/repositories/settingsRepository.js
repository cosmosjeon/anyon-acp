import { getDatabase } from '../index.js';

/**
 * Settings Repository - handles all user settings CRUD operations (PostgreSQL)
 */
class SettingsRepository {
  constructor() {
    this.pool = getDatabase();
  }

  /**
   * Set a setting value
   * @param {string} userId - User ID
   * @param {string} key - Setting key
   * @param {any} value - Setting value (will be JSON stringified)
   * @returns {Promise<boolean>} True if successful
   */
  async set(userId, key, value) {
    const stringValue = JSON.stringify(value);
    const result = await this.pool.query(
      `INSERT INTO user_settings (user_id, key, value)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, key) DO UPDATE SET
         value = EXCLUDED.value,
         updated_at = CURRENT_TIMESTAMP`,
      [userId, key, stringValue]
    );
    return result.rowCount > 0;
  }

  /**
   * Get a setting value
   * @param {string} userId - User ID
   * @param {string} key - Setting key
   * @returns {Promise<any|null>} Setting value or null if not found
   */
  async get(userId, key) {
    const result = await this.pool.query(
      'SELECT value FROM user_settings WHERE user_id = $1 AND key = $2',
      [userId, key]
    );

    if (result.rows.length === 0) return null;

    try {
      return JSON.parse(result.rows[0].value);
    } catch (error) {
      console.error(`Error parsing setting value for key "${key}":`, error);
      return null;
    }
  }

  /**
   * Get all settings for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Object with all settings as key-value pairs
   */
  async getAll(userId) {
    const result = await this.pool.query(
      'SELECT key, value FROM user_settings WHERE user_id = $1',
      [userId]
    );

    const settings = {};
    for (const row of result.rows) {
      try {
        settings[row.key] = JSON.parse(row.value);
      } catch (error) {
        console.error(`Error parsing setting value for key "${row.key}":`, error);
        settings[row.key] = null;
      }
    }

    return settings;
  }

  /**
   * Set multiple settings at once
   * @param {string} userId - User ID
   * @param {Object} settings - Object with settings as key-value pairs
   * @returns {Promise<boolean>} True if successful
   */
  async setAll(userId, settings) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      for (const [key, value] of Object.entries(settings)) {
        const stringValue = JSON.stringify(value);
        await client.query(
          `INSERT INTO user_settings (user_id, key, value)
           VALUES ($1, $2, $3)
           ON CONFLICT (user_id, key) DO UPDATE SET
             value = EXCLUDED.value,
             updated_at = CURRENT_TIMESTAMP`,
          [userId, key, stringValue]
        );
      }

      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error setting multiple settings:', error);
      return false;
    } finally {
      client.release();
    }
  }

  /**
   * Delete a setting
   * @param {string} userId - User ID
   * @param {string} key - Setting key
   * @returns {Promise<boolean>} True if deleted, false otherwise
   */
  async delete(userId, key) {
    const result = await this.pool.query(
      'DELETE FROM user_settings WHERE user_id = $1 AND key = $2',
      [userId, key]
    );
    return result.rowCount > 0;
  }

  /**
   * Delete all settings for a user
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} True if successful
   */
  async deleteAll(userId) {
    const result = await this.pool.query(
      'DELETE FROM user_settings WHERE user_id = $1',
      [userId]
    );
    return result.rowCount >= 0;
  }

  /**
   * Replace all settings for a user (delete all, then set new ones)
   * @param {string} userId - User ID
   * @param {Object} settings - Object with settings as key-value pairs
   * @returns {Promise<boolean>} True if successful
   */
  async replaceAll(userId, settings) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Delete all existing settings
      await client.query('DELETE FROM user_settings WHERE user_id = $1', [userId]);

      // Insert new settings
      for (const [key, value] of Object.entries(settings)) {
        const stringValue = JSON.stringify(value);
        await client.query(
          `INSERT INTO user_settings (user_id, key, value)
           VALUES ($1, $2, $3)`,
          [userId, key, stringValue]
        );
      }

      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error replacing all settings:', error);
      return false;
    } finally {
      client.release();
    }
  }
}

export default new SettingsRepository();
