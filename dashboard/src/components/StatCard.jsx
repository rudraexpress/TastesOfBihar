import React from "react";

const StatCard = ({ className, icon, title, value, percent, smallText }) => {
  // Normalize percent: accept numbers or strings like "81%" and clamp to [0,100]
  const raw =
    typeof percent === "string"
      ? parseFloat(percent.replace("%", ""))
      : percent;
  const numericPercent = Math.min(
    Math.max(Number.isFinite(raw) ? raw : 0, 0),
    100
  );

  // Check if value indicates no data (0, "0", "₹0.00", etc.)
  const isZeroValue =
    value === "0" ||
    value === "₹0.00" ||
    value === "₹0" ||
    (typeof value === "string" && value.match(/^[\₹$€£¥]?0(\.0+)?$/)) ||
    value === 0;

  // Calculate the stroke dasharray for the circular progress
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (numericPercent / 100) * circumference;

  // Determine color based on card type or if it's a zero value
  let strokeColor = "var(--color-primary)";
  if (isZeroValue) strokeColor = "var(--color-danger)";
  else if (className === "expenses") strokeColor = "var(--color-danger)";
  else if (className === "income") strokeColor = "var(--color-success)";

  return (
    <div className={`stat-card ${className}`}>
      <div className="icon">
        <span className="material-symbols-sharp">{icon}</span>
      </div>
      <div className="middle">
        <div className="left">
          <h3>{title}</h3>
          <h1
            style={{ color: isZeroValue ? "var(--color-danger)" : "inherit" }}
          >
            {value}
          </h1>
        </div>
        <div className="progress">
          <svg
            className="progress-ring"
            width="92"
            height="92"
            viewBox="0 0 92 92"
          >
            <circle
              className={`progress-bar ${className}`}
              stroke={strokeColor}
              strokeWidth={10}
              fill="transparent"
              r={radius}
              cx={46}
              cy={46}
              transform={`rotate(-90 46 46)`}
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: strokeDashoffset,
                strokeLinecap: "round",
                transition: "stroke-dashoffset 0.5s ease",
              }}
            />
            <text
              x="50%"
              y="50%"
              dominantBaseline="middle"
              textAnchor="middle"
              style={{
                fontSize: "14px",
                fontWeight: 600,
                fill: isZeroValue ? "var(--color-danger)" : "var(--color-dark)",
              }}
            >
              {Math.round(numericPercent)}%
            </text>
          </svg>
        </div>
      </div>
      <small className="text-muted">{smallText}</small>
    </div>
  );
};

export default StatCard;
