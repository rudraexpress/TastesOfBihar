import React, { useEffect, useState, useCallback } from "react";
import {
  fetchSummary,
  fetchDaily,
  fetchStatusDistribution,
  fetchTopCustomers,
  fetchLowInventory,
  exportToCsv,
} from "../api/analytics";
import KpiCard from "../components/analytics/KpiCard";
import LineChart from "../components/analytics/LineChart";
import DonutChart from "../components/analytics/DonutChart";
import BarChart from "../components/analytics/BarChart";

export default function Analytics() {
  const [range, setRange] = useState(() => {
    const to = new Date();
    const from = new Date(Date.now() - 13 * 86400000);
    return {
      from: from.toISOString().slice(0, 10),
      to: to.toISOString().slice(0, 10),
    };
  });
  const [summary, setSummary] = useState(null);
  const [daily, setDaily] = useState([]);
  const [statusDist, setStatusDist] = useState(null);
  const [topCustomers, setTopCustomers] = useState([]);
  const [lowInventory, setLowInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [chartMode, setChartMode] = useState("revenue");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [s, d, dist, tops, low] = await Promise.all([
        fetchSummary(range),
        fetchDaily(range),
        fetchStatusDistribution(range),
        fetchTopCustomers(range, 6),
        fetchLowInventory(10),
      ]);
      setSummary(s);
      setDaily(d);
      setStatusDist(dist);
      setTopCustomers(tops);
      setLowInventory(low);
    } catch (e) {
      setError(e.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    load();
  }, [load]);

  const onRangeChange = (field, value) => {
    setRange((r) => ({ ...r, [field]: value }));
  };

  const dailyForChart = daily.map((d) => ({
    date: d.date,
    revenue: d.revenue,
    orders: d.orders,
  }));

  return (
    <div id="analytics-section">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <h1 style={{ margin: 0 }}>Analytics</h1>
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
            <label style={labelStyle}>From</label>
            <input
              type="date"
              value={range.from}
              onChange={(e) => onRangeChange("from", e.target.value)}
              style={dateInput}
            />
          </div>
          <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
            <label style={labelStyle}>To</label>
            <input
              type="date"
              value={range.to}
              onChange={(e) => onRangeChange("to", e.target.value)}
              style={dateInput}
            />
          </div>
          <button onClick={load} style={primaryBtn}>
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <p className="danger" style={{ marginTop: "1rem" }}>
          {error}
        </p>
      )}

      <div className="analytics-kpi-grid" style={{ marginTop: "1.8rem" }}>
        <KpiCard
          title="Revenue"
          value={summary ? `₹${summary.totalRevenue.toFixed(2)}` : "—"}
          trend={summary?.revenueGrowth}
          sub="Selected range"
        />
        <KpiCard
          title="Orders"
          value={summary ? summary.totalOrders : "—"}
          sub="Total orders"
        />
        <KpiCard
          title="Avg Order"
          value={summary ? `₹${summary.avgOrder.toFixed(2)}` : "—"}
          sub="Revenue / Orders"
        />
        <KpiCard
          title="Pending"
          value={summary ? summary.pending : "—"}
          sub="Orders"
        />
        <KpiCard
          title="Shipped"
          value={summary ? summary.shipped : "—"}
          sub="Orders"
        />
        <KpiCard
          title="Delivered"
          value={summary ? summary.delivered : "—"}
          sub="Orders"
        />
      </div>

      <div className="analytics-panels-grid" style={{ marginTop: "2.4rem" }}>
        <div className="customer-info analytics-panel" style={panelStyle}>
          <div style={panelHeader}>
            <h2 style={panelTitle}>
              Daily {chartMode === "revenue" ? "Revenue" : "Orders"}
            </h2>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                style={chartModeBtn(chartMode === "revenue")}
                onClick={() => setChartMode("revenue")}
              >
                Revenue
              </button>
              <button
                style={chartModeBtn(chartMode === "orders")}
                onClick={() => setChartMode("orders")}
              >
                Orders
              </button>
            </div>
          </div>
          <LineChart data={dailyForChart} yKey={chartMode} />
        </div>
        <div className="customer-info analytics-panel" style={panelStyle}>
          <h2 style={panelTitle}>Status Distribution</h2>
          <DonutChart data={statusDist || {}} />
        </div>
        <div className="customer-info analytics-panel" style={panelStyle}>
          <h2 style={panelTitle}>Top Customers</h2>
          <BarChart data={topCustomers} />
          <div style={{ marginTop: "0.7rem", textAlign: "right" }}>
            <button
              style={smallBtn}
              onClick={() => exportToCsv("top-customers.csv", topCustomers)}
            >
              Export CSV
            </button>
          </div>
        </div>
        <div className="customer-info analytics-panel" style={panelStyle}>
          <h2 style={panelTitle}>Low Inventory</h2>
          <table style={{ fontSize: "0.75rem" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Product</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              {lowInventory.map((p) => (
                <tr key={p.id}>
                  <td style={{ textAlign: "left" }}>{p.name}</td>
                  <td>{p.stock}</td>
                </tr>
              ))}
              {!lowInventory.length && (
                <tr>
                  <td colSpan={2}>No low stock items</td>
                </tr>
              )}
            </tbody>
          </table>
          <div style={{ marginTop: "0.7rem", textAlign: "right" }}>
            <button
              style={smallBtn}
              onClick={() => exportToCsv("low-inventory.csv", lowInventory)}
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {loading && <p style={{ marginTop: "1rem" }}>Loading...</p>}
    </div>
  );
}

const labelStyle = {
  fontSize: "0.75rem",
  fontWeight: 600,
  letterSpacing: ".5px",
};
const dateInput = {
  padding: "0.6rem 0.9rem",
  background: "var(--color-light)",
  borderRadius: "10px",
  border: "2px solid transparent",
  fontSize: ".85rem",
  fontWeight: 500,
};
const primaryBtn = {
  background: "var(--color-primary)",
  color: "#fff",
  padding: "0.75rem 1.4rem",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: ".85rem",
  boxShadow: "0 4px 10px rgba(0,0,0,.12)",
};
const panelStyle = {
  padding: "1.8rem 1.6rem",
  display: "flex",
  flexDirection: "column",
  gap: "1.1rem",
  background: "var(--color-white)",
  borderRadius: "1.4rem",
  boxShadow: "var(--box-shadow)",
};
const panelHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "1rem",
};
const panelTitle = { margin: 0, fontSize: "1.15rem", letterSpacing: ".3px" };
const chartModeBtn = (active) => ({
  background: active ? "var(--color-primary)" : "var(--color-light)",
  color: active ? "#fff" : "var(--color-dark)",
  padding: "0.55rem 1rem",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "0.7rem",
  fontWeight: 600,
});
const smallBtn = {
  background: "var(--color-primary)",
  color: "#fff",
  padding: "0.55rem 1rem",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "0.7rem",
  fontWeight: 600,
  boxShadow: "0 4px 10px rgba(0,0,0,.12)",
};
