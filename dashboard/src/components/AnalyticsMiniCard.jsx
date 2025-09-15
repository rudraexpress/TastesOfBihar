import React from "react";

/*
  AnalyticsMiniCard
  Props:
    icon: material symbol name (string)
    title: label text
    value: main metric (string/number)
    delta: optional change indicator (string, e.g. +12%)
    variant: one of 'primary' | 'danger' | 'success' | 'warning' (affects accent)
*/
export default function AnalyticsMiniCard({
  icon,
  title,
  value,
  delta,
  variant = "primary",
}) {
  return (
    <div className={`mini-analytic-card variant-${variant}`}>
      <div className="mac-icon-wrap">
        <span className="material-symbols-sharp">{icon}</span>
      </div>
      <div className="mac-content">
        <p className="mac-title">{title}</p>
        <h4 className="mac-value">{value}</h4>
        {delta && <span className="mac-delta">{delta}</span>}
      </div>
    </div>
  );
}
