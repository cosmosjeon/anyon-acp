/**
 * Usage API - Usage statistics and analytics
 */

import { apiCall } from '../apiAdapter';
import type { UsageStats, UsageEntry, ProjectUsage } from './types';

export const usageApi = {
  /**
   * Gets overall usage statistics
   */
  async getUsageStats(): Promise<UsageStats> {
    try {
      return await apiCall<UsageStats>("get_usage_stats");
    } catch (error) {
      console.error("Failed to get usage stats:", error);
      throw error;
    }
  },

  /**
   * Gets usage statistics filtered by date range
   */
  async getUsageByDateRange(startDate: string, endDate: string): Promise<UsageStats> {
    try {
      return await apiCall<UsageStats>("get_usage_by_date_range", { startDate, endDate });
    } catch (error) {
      console.error("Failed to get usage by date range:", error);
      throw error;
    }
  },

  /**
   * Gets usage statistics grouped by session
   */
  async getSessionStats(
    since?: string,
    until?: string,
    order?: "asc" | "desc"
  ): Promise<ProjectUsage[]> {
    try {
      return await apiCall<ProjectUsage[]>("get_session_stats", {
        since,
        until,
        order,
      });
    } catch (error) {
      console.error("Failed to get session stats:", error);
      throw error;
    }
  },

  /**
   * Gets detailed usage entries with optional filtering
   */
  async getUsageDetails(limit?: number): Promise<UsageEntry[]> {
    try {
      return await apiCall<UsageEntry[]>("get_usage_details", { limit });
    } catch (error) {
      console.error("Failed to get usage details:", error);
      throw error;
    }
  },
};
