import React from "react";

export default function DonutChart({ data, size = 180 }) {
  const total = Object.values(data || {}).reduce((a, b) => a + b, 0);
  const entries = Object.entries(data || {});
  const colors = {
    pending: "#f7cb73",
    shipped: "#6d9ff5",
    delivered: "#7ddf91",
  };

  if (!entries.length || total === 0) {
    return (
      <div
        style={{
          position: "relative",
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.7rem",
          color: "var(--color-muted)",
        }}
      >
        No data
      </div>
    );
  }

  let cumulative = 0;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg
        viewBox="0 0 42 42"
        width={size}
        height={size}
        style={{ transform: "rotate(-90deg)" }}
      >
        <circle cx="21" cy="21" r="15.915" fill="var(--color-light)" />
        {entries.map(([k, v]) => {
          const val = total ? (v / total) * 100 : 0;
          const strokeDasharray = `${val} ${100 - val}`;
          const strokeDashoffset = 100 - cumulative;
          cumulative += val;
          return (
            <circle
              key={k}
              cx="21"
              cy="21"
              r="15.915"
              fill="transparent"
              stroke={colors[k] || "var(--color-primary)"}
              strokeWidth="6"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="butt"
              style={{ transition: "stroke-dashoffset .6s" }}
            />
          );
        })}
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.7rem",
        }}
      >
        <strong style={{ fontSize: "0.9rem" }}>{total}</strong>
        <span style={{ opacity: 0.7 }}>Orders</span>
      </div>
      <div
        style={{
          marginTop: "0.4rem",
          display: "flex",
          gap: "0.5rem",
          flexWrap: "wrap",
          fontSize: "0.55rem",
        }}
      >
        {entries.map(([k, v]) => (
          <span
            key={k}
            style={{ display: "flex", alignItems: "center", gap: "4px" }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                background: colors[k] || "var(--color-primary)",
                borderRadius: 2,
              }}
            />
            {k} ({v})
          </span>
        ))}
      </div>
    </div>
  );
}
