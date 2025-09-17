import React from "react";

const LayoutPreview = ({ layout, onSelect, selected }) => {
  const base = {
    container: {
      display: "flex",
      gap: 8,
      alignItems: "center",
      cursor: "pointer",
      padding: "0.45rem",
      borderRadius: 8,
      transition: "all 120ms",
    },
    thumb: {
      width: 112,
      height: 68,
      borderRadius: 6,
      background: "var(--color-light)",
      boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)",
    },
    label: { fontSize: 13, color: "var(--color-dark)" },
    hint: { fontSize: 12, color: "var(--color-light)", marginLeft: 6 },
  };

  const renderThumb = (id) => {
    switch (id) {
      case "hero":
        return (
          <div
            style={{ ...base.thumb, display: "flex", flexDirection: "column" }}
          >
            <div
              style={{
                height: "55%",
                background: "rgba(0,0,0,0.08)",
                borderTopLeftRadius: 6,
                borderTopRightRadius: 6,
              }}
            />
            <div style={{ height: "45%", padding: 6 }}>
              <div
                style={{
                  height: 8,
                  background: "rgba(0,0,0,0.06)",
                  borderRadius: 4,
                  width: "70%",
                }}
              />
              <div style={{ height: 6 }} />
              <div
                style={{
                  height: 6,
                  background: "rgba(0,0,0,0.06)",
                  borderRadius: 4,
                  width: "50%",
                }}
              />
            </div>
          </div>
        );
      case "media-left":
        return (
          <div style={{ ...base.thumb, display: "flex", gap: 6, padding: 6 }}>
            <div
              style={{
                width: "45%",
                background: "rgba(0,0,0,0.08)",
                borderRadius: 4,
              }}
            />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  height: 8,
                  background: "rgba(0,0,0,0.06)",
                  borderRadius: 4,
                  marginBottom: 6,
                }}
              />
              <div
                style={{
                  height: 8,
                  background: "rgba(0,0,0,0.06)",
                  borderRadius: 4,
                  width: "60%",
                }}
              />
            </div>
          </div>
        );
      case "grid":
        return (
          <div
            style={{
              ...base.thumb,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 6,
              padding: 6,
            }}
          >
            <div style={{ background: "rgba(0,0,0,0.08)", borderRadius: 4 }} />
            <div style={{ background: "rgba(0,0,0,0.08)", borderRadius: 4 }} />
            <div
              style={{
                background: "rgba(0,0,0,0.06)",
                height: 8,
                borderRadius: 4,
                gridColumn: "1 / -1",
              }}
            />
          </div>
        );
      default:
        return <div style={base.thumb} />;
    }
  };

  return (
    <div
      onClick={() => onSelect(layout.id)}
      onKeyDown={(e) => e.key === "Enter" && onSelect(layout.id)}
      role="button"
      tabIndex={0}
      style={{
        ...base.container,
        background: selected ? "rgba(79,70,229,0.06)" : "transparent",
        border: selected
          ? "1px solid rgba(79,70,229,0.5)"
          : "1px solid rgba(0,0,0,0.04)",
      }}
      title={layout.label}
    >
      {renderThumb(layout.id)}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={base.label}>{layout.label}</div>
        <div style={base.hint}>
          {layout.id === "hero"
            ? "Large banner + text"
            : layout.id === "media-left"
            ? "Image left, text right"
            : "Multiple images grid"}
        </div>
      </div>
    </div>
  );
};

export default LayoutPreview;
