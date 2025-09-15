import React from "react";

export default function BarChart({ data, height = 200 }) {
  if (!data || !data.length) return <div style={emptyStyle}>No data</div>;
  const max = Math.max(...data.map((d) => d.total), 1);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: "0.6rem",
        width: "100%",
        height,
      }}
    >
      {data.map((d) => (
        <div
          key={d.customerName}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <div
            title={`₹${d.total.toFixed(2)}`}
            style={{
              width: "100%",
              background: "var(--color-primary)",
              height: `${(d.total / max) * 100}%`,
              borderRadius: "6px 6px 0 0",
              boxShadow: "var(--box-shadow)",
            }}
          />
          <small
            style={{
              fontSize: "0.55rem",
              textAlign: "center",
              wordBreak: "break-word",
            }}
          >
            {d.customerName}
          </small>
        </div>
      ))}
    </div>
  );
}

const emptyStyle = {
  padding: "1rem",
  fontSize: "0.75rem",
  color: "var(--color-muted)",
};
