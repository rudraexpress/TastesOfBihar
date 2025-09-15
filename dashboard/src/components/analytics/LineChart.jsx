import React from "react";

export default function LineChart({
  data,
  xKey = "date",
  yKey = "revenue",
  height = 180,
}) {
  if (!data || !data.length) return <div style={emptyStyle}>No data</div>;
  const values = data.map((d) => d[yKey] || 0);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const w = 1000; // virtual width for smoother curve
  const h = 400; // virtual height
  const step = w / (data.length - 1 || 1);
  const points = values.map((v, i) => [
    i * step,
    h - ((v - min) / (max - min || 1)) * h,
  ]);
  const path = points
    .map((p, i) => (i === 0 ? `M ${p[0]},${p[1]}` : `L ${p[0]},${p[1]}`))
    .join(" ");
  return (
    <div style={{ position: "relative", width: "100%", height }}>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      >
        <path
          d={path}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth={10}
          strokeLinecap="round"
        />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p[0]}
            cy={p[1]}
            r={18}
            fill="var(--color-primary)"
          />
        ))}
      </svg>
      <div style={legendStyle}>
        {data.map((d) => (
          <span
            key={d[xKey]}
            style={{ flex: 1, fontSize: "0.55rem", textAlign: "center" }}
          >
            {d[xKey].slice(5)}
          </span>
        ))}
      </div>
    </div>
  );
}

const emptyStyle = {
  padding: "1rem",
  fontSize: "0.75rem",
  color: "var(--color-muted)",
};
const legendStyle = {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,
  display: "flex",
  gap: "0.25rem",
};
