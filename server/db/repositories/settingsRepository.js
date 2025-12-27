import { getDatabase } from '../index.js';

/**
 * Settings Repository - handles all user settings CRUD operations
 */
class SettingsRepository {
  constructor() {
    this.db = getDatabase();

    // Prepare statements for better performance
    this.statements = {
      set: this.db.prepare(`
        INSERT INTO user_settings (user_id, key, value)
        VALUES (?, ?, ?)
        ON CONFLICT(user_id, key) DO UPDATE SET
          value = excluded.value,
          updated_at = CURRENT_TIMESTAMP
      `),

      get: this.db.prepare(`
        SELECT value FROM user_settings WHERE user_id = ? AND key = ?
      `),

      getAll: this.db.prepare(`
        SELECT key, value FROM user_settings WHERE user_id = ?
      `),

      delete: this.db.prepare(`
        DELETE FROM user_settings WHERE user_id = ? AND key = ?
      `),

      deleteAll: this.db.prepare(`
        DELETE FROM user_settings WHERE user_id = ?
      `),
    };
  }

  /**
   * Set a setting value
   * @param {string} userId - User ID
   * @param {string} key - Setting key
   * @param {any} value - Setting value (will be JSON stringified)
   * @returns {boolean} True if successful
   */
  set(userId, key, value) {
    const stringValue = JSON.stringify(value);
    const result = this.statements.set.run(userId, key, stringValue);
    return result.changes > 0;
  }

  /**
   * Get a setting value
   * @param {string} userId - User ID
   * @param {string} key - Setting key
   * @returns {any|null} Setting value or null if not found
   */
  get(userId, key) {
    const row = this.statements.get.get(userId, key);
    if (!row) return null;

    try {
      return JSON.parse(row.value);
    } catch (error) {
      console.error(`Error parsing setting value for key "${key}":`, error);
      return null;
    }
  }

  /**
   * Get all settings for a user
   * @param {string} userId - User ID
   * @returns {Object} Object with all settings as key-value pairs
   */
  getAll(userId) {
    const rows = this.statements.getAll.all(userId);
    const settings = {};

    for (const row of rows) {
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
   * @returns {boolean} True if successful
   */
  setAll(userId, settings) {
    const transaction = this.db.transaction((userId, settings) => {
      for (const [key, value] of Object.entries(settings)) {
        this.set(userId, key, value);
      }
    });

    try {
      transaction(userId, settings);
      return true;
    } catch (error) {
      console.error('Error setting multiple settings:', error);
      return false;
    }
  }

  /**
   * Delete a setting
   * @param {string} userId - User ID
   * @param {string} key - Setting key
   * @returns {boolean} True if deleted, false otherwise
   */
  delete(userId, key) {
    const result = this.statements.delete.run(userId, key);
    return result.changes > 0;
  }

  /**
   * Delete all settings for a user
   * @param {string} userId - User ID
   * @returns {boolean} True if successful
   */
  deleteAll(userId) {
    const result = this.statements.deleteAll.run(userId);
    return result.changes >= 0; // 0 or more changes is fine
  }

  /**
   * Replace all settings for a user (delete all, then set new ones)
   * @param {string} userId - User ID
   * @param {Object} settings - Object with settings as key-value pairs
   * @returns {boolean} True if successful
   */
  replaceAll(userId, settings) {
    const transaction = this.db.transaction((userId, settings) => {
      this.deleteAll(userId);
      for (const [key, value] of Object.entries(settings)) {
        this.set(userId, key, value);
      }
    });

    try {
      transaction(userId, settings);
      return true;
    } catch (error) {
      console.error('Error replacing all settings:', error);
      return false;
    }
  }
}

export default new SettingsRepository();
