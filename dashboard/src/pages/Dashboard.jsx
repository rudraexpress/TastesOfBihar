import React, { useEffect, useState } from "react";
import StatCard from "../components/StatCard";
import RecentOrders from "../components/RecentOrders";
import {
  fetchDashboardSummary,
  getDashboardRefreshInterval,
} from "../api/dashboard";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load summary data on component mount and set up refresh interval
  useEffect(() => {
    const loadSummary = async (showLoading = true) => {
      if (showLoading) {
        setLoading(true);
      }
      setError("");
      try {
        const data = await fetchDashboardSummary();
        console.log("Dashboard summary data:", data); // Debug log
        setSummary(data);
      } catch (e) {
        setError(e.message || "Failed to load dashboard data");
        console.error("Dashboard data load error:", e);
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    };

    // Initial load with loading state
    loadSummary(true);

    // Set up periodic refresh without loading state (only if interval > 0)
    const refreshInterval = getDashboardRefreshInterval();
    let intervalId = null;
    if (refreshInterval > 0) {
      intervalId = setInterval(() => loadSummary(false), refreshInterval);
    }

    // Cleanup interval on unmount
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  return (
    <div id="dashboard-section">
      <h1>Dashboard</h1>

      <div className="date">
        <input type="date" />
        {summary?.lastUpdated && (
          <small style={{ marginLeft: "1rem", color: "var(--color-muted)" }}>
            Last updated: {new Date(summary.lastUpdated).toLocaleTimeString()}
          </small>
        )}
      </div>

      {error && (
        <div
          className="error"
          style={{ color: "var(--color-danger)", marginBottom: "1rem" }}
        >
          {error}
        </div>
      )}

      <div className="insights">
        <StatCard
          className="sales"
          icon="analytics"
          title="Total Sales"
          value={
            loading
              ? "Loading..."
              : summary
              ? `₹${summary.totalRevenue?.toFixed(2) || "0.00"}`
              : "₹0.00"
          }
          percent={
            loading
              ? "0%"
              : summary
              ? `${Math.round(summary.revenueGrowth || 0)}%`
              : "0%"
          }
          smallText="Last 24 Hours"
        />

        <StatCard
          className="expenses"
          icon="bar_chart"
          title="Total Expenses"
          value={
            loading
              ? "Loading..."
              : summary
              ? `₹${summary.estimatedExpenses?.toFixed(2) || "0.00"}`
              : "₹0.00"
          }
          percent={
            loading
              ? "0%"
              : summary && summary.totalRevenue > 0
              ? `${Math.round(
                  (summary.estimatedExpenses / summary.totalRevenue) * 100
                )}%`
              : "0%"
          }
          smallText="% of Revenue"
        />

        <StatCard
          className="income"
          icon="attach_money"
          title="Total Income"
          value={
            loading
              ? "Loading..."
              : summary
              ? `₹${summary.estimatedIncome?.toFixed(2) || "0.00"}`
              : "₹0.00"
          }
          percent={
            loading
              ? "0%"
              : summary
              ? `${Math.round(summary.revenueGrowth || 0)}%`
              : "0%"
          }
          smallText="Last 24 Hours"
        />
      </div>

      <RecentOrders />
    </div>
  );
}
