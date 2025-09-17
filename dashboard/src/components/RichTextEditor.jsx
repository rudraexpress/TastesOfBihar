import React, { useRef, useEffect } from "react";

const RichTextEditor = ({
  value,
  onChange,
  placeholder = "Write your content here...",
}) => {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || "";
    }
  }, [value]);

  const exec = (cmd, arg) => {
    document.execCommand(cmd, false, arg);
    onChange(ref.current.innerHTML);
    ref.current.focus();
  };

  const btn = (children, onClick) => (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "8px 12px",
        borderRadius: 8,
        background: "rgba(0,0,0,0.08)",
        color: "var(--color-white)",
        border: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      {children}
    </button>
  );

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        {btn(<strong>B</strong>, () => exec("bold"))}
        {btn(<em>I</em>, () => exec("italic"))}
        {btn("Link", () => {
          const url = prompt("Enter URL");
          if (url) exec("createLink", url);
        })}
        {btn("Clear", () => {
          onChange("");
          if (ref.current) ref.current.innerHTML = "";
        })}
      </div>
      <div
        ref={ref}
        contentEditable
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        placeholder={placeholder}
        style={{
          minHeight: 160,
          padding: "0.6rem 0.9rem",
          borderRadius: 8,
          background: "var(--color-light)",
          color: "var(--color-dark)",
          outline: "none",
          border: "2px solid transparent",
        }}
      />
    </div>
  );
};

export default RichTextEditor;
