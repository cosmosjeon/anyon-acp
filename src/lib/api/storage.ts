import { apiCall } from '../apiAdapter';

/**
 * Storage API for SQLite database operations
 */
export const storageApi = {
  /**
   * Lists all tables in the SQLite database
   * @returns Promise resolving to an array of table information
   */
  async storageListTables(): Promise<any[]> {
    try {
      return await apiCall<any[]>("storage_list_tables");
    } catch (error) {
      console.error("Failed to list tables:", error);
      throw error;
    }
  },

  /**
   * Reads table data with pagination
   * @param tableName - Name of the table to read
   * @param page - Page number (1-indexed)
   * @param pageSize - Number of rows per page
   * @param searchQuery - Optional search query
   * @returns Promise resolving to table data with pagination info
   */
  async storageReadTable(
    tableName: string,
    page: number,
    pageSize: number,
    searchQuery?: string
  ): Promise<any> {
    try {
      return await apiCall<any>("storage_read_table", {
        tableName,
        page,
        pageSize,
        searchQuery,
      });
    } catch (error) {
      console.error("Failed to read table:", error);
      throw error;
    }
  },

  /**
   * Updates a row in a table
   * @param tableName - Name of the table
   * @param primaryKeyValues - Map of primary key column names to values
   * @param updates - Map of column names to new values
   * @returns Promise resolving when the row is updated
   */
  async storageUpdateRow(
    tableName: string,
    primaryKeyValues: Record<string, any>,
    updates: Record<string, any>
  ): Promise<void> {
    try {
      return await apiCall<void>("storage_update_row", {
        tableName,
        primaryKeyValues,
        updates,
      });
    } catch (error) {
      console.error("Failed to update row:", error);
      throw error;
    }
  },

  /**
   * Deletes a row from a table
   * @param tableName - Name of the table
   * @param primaryKeyValues - Map of primary key column names to values
   * @returns Promise resolving when the row is deleted
   */
  async storageDeleteRow(
    tableName: string,
    primaryKeyValues: Record<string, any>
  ): Promise<void> {
    try {
      return await apiCall<void>("storage_delete_row", {
        tableName,
        primaryKeyValues,
      });
    } catch (error) {
      console.error("Failed to delete row:", error);
      throw error;
    }
  },

  /**
   * Inserts a new row into a table
   * @param tableName - Name of the table
   * @param values - Map of column names to values
   * @returns Promise resolving to the last insert row ID
   */
  async storageInsertRow(
    tableName: string,
    values: Record<string, any>
  ): Promise<number> {
    try {
      return await apiCall<number>("storage_insert_row", {
        tableName,
        values,
      });
    } catch (error) {
      console.error("Failed to insert row:", error);
      throw error;
    }
  },

  /**
   * Executes a raw SQL query
   * @param query - SQL query string
   * @returns Promise resolving to query result
   */
  async storageExecuteSql(query: string): Promise<any> {
    try {
      return await apiCall<any>("storage_execute_sql", { query });
    } catch (error) {
      console.error("Failed to execute SQL:", error);
      throw error;
    }
  },

  /**
   * Resets the entire database
   * @returns Promise resolving when the database is reset
   */
  async storageResetDatabase(): Promise<void> {
    try {
      return await apiCall<void>("storage_reset_database");
    } catch (error) {
      console.error("Failed to reset database:", error);
      throw error;
    }
  },

  /**
   * Gets a setting from the app_settings table
   * @param key - The setting key to retrieve
   * @returns Promise resolving to the setting value or null if not found
   */
  async getSetting(key: string): Promise<string | null> {
    try {
      // Always read from DB to ensure we have the latest data
      // (localStorage is updated by saveSetting, not used for reading)
      const result = await storageApi.storageReadTable('app_settings', 1, 1000);
      const setting = result?.rows?.find((row: any) => row.key === key);
      const value = setting?.value || null;

      return value;
    } catch (error) {
      console.error(`Failed to get setting ${key}:`, error);
      return null;
    }
  },

  /**
   * Saves a setting to the app_settings table (insert or update)
   * @param key - The setting key
   * @param value - The setting value
   * @returns Promise resolving when the setting is saved
   */
  async saveSetting(key: string, value: string): Promise<void> {
    try {
      console.log('[storageApi] saveSetting called:', key, 'value length:', value.length);
      // Mirror to localStorage for instant availability on next startup
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        try {
          window.localStorage.setItem(`app_setting:${key}`, value);
          console.log('[storageApi] Saved to localStorage');
        } catch (_ignore) {
          // best-effort; continue to persist in DB
        }
      }
      // Check if row exists first (don't use getSetting as it would cause recursion)
      const checkResult = await storageApi.storageReadTable('app_settings', 1, 1000);
      const exists = checkResult?.rows?.some((row: any) => row.key === key);
      console.log('[storageApi] Row exists:', exists);

      if (exists) {
        // Update existing row
        console.log('[storageApi] Trying updateRow...');
        const updateResult = await storageApi.storageUpdateRow(
          'app_settings',
          { key },
          { value }
        );
        console.log('[storageApi] updateRow result:', updateResult);
      } else {
        // Insert new row
        console.log('[storageApi] Row does not exist, trying insertRow...');
        const insertResult = await storageApi.storageInsertRow('app_settings', { key, value });
        console.log('[storageApi] insertRow result:', insertResult);
      }
      console.log('[storageApi] saveSetting completed successfully');
    } catch (error) {
      console.error(`Failed to save setting ${key}:`, error);
      throw error;
    }
  },
};
