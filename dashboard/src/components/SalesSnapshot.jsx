import React, { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

export default function SalesSnapshot() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/analytics/summary`);
      if (!res.ok) throw new Error("Failed to fetch summary");
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading && !data)
    return <p style={{ padding: "0 1rem" }}>Loading snapshot...</p>;
  if (error && !data)
    return (
      <p className="danger" style={{ padding: "0 1rem" }}>
        {error}
      </p>
    );

  if (!data) return null;

  const metrics = [
    { label: "Revenue", value: `₹${data.totalRevenue.toFixed(2)}` },
    { label: "Orders", value: data.totalOrders },
    { label: "Avg Order", value: `₹${data.avgOrder.toFixed(2)}` },
    { label: "Products", value: data.productCount },
  ];

  const statuses = [
    { label: "Pending", value: data.pending, color: "#f7cb73" },
    { label: "Shipped", value: data.shipped, color: "#6d9ff5" },
    { label: "Delivered", value: data.delivered, color: "#7ddf91" },
  ];

  return (
    <div className="sales-snapshot" style={{ padding: "0 0.5rem 1rem" }}>
      <h2 style={{ margin: "0 0 0.75rem 0", padding: "0 0.5rem" }}>
        Sales Snapshot
      </h2>
      <div
        style={{
          display: "grid",
          gap: "0.7rem",
          gridTemplateColumns: "repeat(auto-fill,minmax(120px,1fr))",
          padding: "0 0.5rem",
        }}
      >
        {metrics.map((m) => (
          <div
            key={m.label}
            style={{
              background: "var(--color-white)",
              padding: "0.7rem 0.8rem",
              borderRadius: "0.8rem",
              boxShadow: "var(--box-shadow)",
            }}
          >
            <small className="text-muted" style={{ fontSize: "0.65rem" }}>
              {m.label}
            </small>
            <h3 style={{ margin: "0.25rem 0 0 0", fontSize: "0.95rem" }}>
              {m.value}
            </h3>
          </div>
        ))}
      </div>
      <div style={{ marginTop: "1rem", padding: "0 0.5rem" }}>
        <small className="text-muted" style={{ fontSize: "0.65rem" }}>
          Fulfillment Status
        </small>
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.4rem" }}>
          {statuses.map((s) => (
            <div key={s.label} style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.65rem",
                  fontWeight: 600,
                }}
              >
                <span>{s.label}</span>
                <span>{s.value}</span>
              </div>
              <div
                style={{
                  height: "6px",
                  background: "var(--color-light)",
                  borderRadius: "4px",
                  marginTop: "4px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: data.totalOrders
                      ? `${(s.value / data.totalOrders) * 100}%`
                      : "0%",
                    background: s.color,
                    height: "100%",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginTop: "1rem", padding: "0 0.5rem" }}>
        <small className="text-muted" style={{ fontSize: "0.65rem" }}>
          Revenue Growth
        </small>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            marginTop: "0.3rem",
          }}
        >
          <span
            style={{
              fontWeight: 600,
              color:
                data.revenueGrowth >= 0
                  ? "var(--color-success)"
                  : "var(--color-danger)",
            }}
          >
            {data.revenueGrowth >= 0 ? "+" : ""}
            {data.revenueGrowth.toFixed(1)}%
          </span>
          <div
            style={{
              flex: 1,
              height: "6px",
              background: "var(--color-light)",
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${Math.min(Math.abs(data.revenueGrowth), 100)}%`,
                background:
                  data.revenueGrowth >= 0
                    ? "var(--color-success)"
                    : "var(--color-danger)",
                height: "100%",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
