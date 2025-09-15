import { fetchSummary, fetchStatusDistribution } from "./analytics";
import { listOrders } from "./orders";

/**
 * Fetch dashboard summary data including revenue, orders, and quick stats
 */
export async function fetchDashboardSummary() {
  try {
    // Use last 24 hours as default range
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const range = {
      from: yesterday.toISOString().slice(0, 10),
      to: now.toISOString().slice(0, 10),
    };

    const [summary, statusDist] = await Promise.all([
      fetchSummary(range),
      fetchStatusDistribution(range),
    ]);

    // Calculate derived metrics
    const totalOrders =
      (statusDist?.pending || 0) +
      (statusDist?.shipped || 0) +
      (statusDist?.delivered || 0);
    const avgOrderValue =
      totalOrders > 0 ? summary.totalRevenue / totalOrders : 0;

    // Expenses and income should be calculated from real accounting data in production
    return {
      ...summary,
      totalOrders,
      avgOrderValue,
      statusDistribution: statusDist,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Failed to fetch dashboard summary:", error);
    throw error;
  }
}

/**
 * Fetch recent orders for dashboard display
 */
export async function fetchDashboardRecentOrders(limit = 5) {
  try {
    const allOrders = await listOrders(); // Get all orders
    // Sort by creation date (newest first) and take the limit
    return allOrders
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, limit);
  } catch (error) {
    console.error("Failed to fetch recent orders:", error);
    throw error;
  }
}

/**
 * Get dashboard refresh interval based on environment
 */
export function getDashboardRefreshInterval() {
  // Set to 0 to disable auto-refresh, or adjust as needed
  return 0; // Disabled for now
  // return isDummyMode() ? 120000 : 300000; // 2 minutes for dummy mode, 5 minutes for real data
}
