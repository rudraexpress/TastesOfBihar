import React from "react";

export default function KpiCard({ title, value, sub, trend }) {
  const trendColor =
    trend > 0
      ? "var(--color-success)"
      : trend < 0
      ? "var(--color-danger)"
      : "var(--color-dark)";
  return (
    <div className="kpi-card">
      <div className="kpi-head-row">
        <div>
          <small className="text-muted kpi-title-label">{title}</small>
          <h2 className="kpi-value">{value}</h2>
        </div>
        {Number.isFinite(trend) && (
          <span className="kpi-trend" style={{ color: trendColor }}>
            {trend > 0 ? "+" : ""}
            {trend.toFixed(1)}%
          </span>
        )}
      </div>
      {sub && <small className="text-muted kpi-sub">{sub}</small>}
    </div>
  );
}
