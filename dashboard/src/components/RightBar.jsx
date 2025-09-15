import React, { useEffect, useState } from "react";
import AnalyticsMiniCard from "./AnalyticsMiniCard";
// RightBar with recent updates (restored)

export default function RightBar({
  onAddProduct,
  activePage,
  externalThemeState,
  showRecentUpdates = true, // new optional prop: can be boolean or array of page ids
  onCollapse,
}) {
  // support external (App-level) theme state; if not provided, fallback to internal
  const [internalDark, setInternalDark] = useState(() => {
    try {
      return localStorage.getItem("theme-dark") === "1";
    } catch {
      return false;
    }
  });
  const isDark = externalThemeState ? externalThemeState.isDark : internalDark;
  const toggle = externalThemeState
    ? externalThemeState.toggleTheme
    : () => setInternalDark((v) => !v);

  useEffect(() => {
    if (externalThemeState) return; // App handles side effects
    if (isDark) document.body.classList.add("dark-theme-variables");
    else document.body.classList.remove("dark-theme-variables");
    try {
      localStorage.setItem("theme-dark", isDark ? "1" : "0");
    } catch {}
  }, [isDark, externalThemeState]);

  return (
    <div className="right">
      <div className="top">
        {onCollapse && (
          <button
            className="collapse-right-btn"
            type="button"
            aria-label="Collapse right sidebar"
            onClick={() => onCollapse()}
          >
            <span className="material-symbols-sharp"> chevron_right </span>
          </button>
        )}
        <button className="menu-btn" id="menu-btn">
          <span className="material-symbols-sharp"> menu </span>
        </button>
        <div
          className="theme-toggler"
          onClick={toggle}
          role="button"
          aria-pressed={isDark}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggle();
            }
          }}
        >
          <span className={`material-symbols-sharp ${!isDark ? "active" : ""}`}>
            {" "}
            partly_cloudy_day{" "}
          </span>
          <span className={`material-symbols-sharp ${isDark ? "active" : ""}`}>
            {" "}
            nights_stay{" "}
          </span>
        </div>
        <div className="profile">
          <div className="info">
            <p>
              Hey, <b>Admin</b>
            </p>
            <small className="text-muted">Admin</small>
          </div>
          <div className="profile-photo">
            <img src="images/profile-1.jpg" alt="profile picture" />
          </div>
        </div>
      </div>

      {(Array.isArray(showRecentUpdates)
        ? showRecentUpdates.includes(activePage)
        : showRecentUpdates) && (
        <div className="recent-updates">
          <h2>Recent Updates</h2>
          <div className="updates">
            <div className="update">
              <div className="profile-photo">
                <img src="images/profile-2.jpg" alt="" />
              </div>
              <div className="message">
                <p>
                  <b>Rakesh Kumar</b> received his order of Thekua — Coconut
                  Magic (250g).
                </p>
                <small className="text-muted">2 Minutes Ago</small>
              </div>
            </div>
            <div className="update">
              <div className="profile-photo">
                <img src="images/profile-3.jpg" alt="" />
              </div>
              <div className="message">
                <p>
                  <b>Geeta</b> received her order of Thekua — Coconut Magic
                  (500g).
                </p>
                <small className="text-muted">45 Minutes Ago</small>
              </div>
            </div>
            <div className="update">
              <div className="profile-photo">
                <img src="images/profile-4.jpg" alt="" />
              </div>
              <div className="message">
                <p>
                  <b>Priya Singh</b> received her order of Thekua — Coconut
                  Magic (1kg).
                </p>
                <small className="text-muted">2 Hours Ago</small>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="sales-analytics redesigned">
        <h2>Sales Analytics</h2>
        <div className="sales-analytics-grid">
          <AnalyticsMiniCard
            icon="shopping_cart"
            title="Online Orders"
            value="3,489"
            delta="+39%"
            variant="primary"
          />
          <AnalyticsMiniCard
            icon="local_mall"
            title="Offline Orders"
            value="1,234"
            delta="-17%"
            variant="danger"
          />
          <AnalyticsMiniCard
            icon="person"
            title="New Customers"
            value="743"
            delta="+25%"
            variant="success"
          />
          <AnalyticsMiniCard
            icon="attach_money"
            title="Revenue"
            value="₹15.2k"
            delta="+12%"
            variant="success"
          />
        </div>
        <button
          className="mini-add-product"
          onClick={() => onAddProduct && onAddProduct()}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && onAddProduct) {
              e.preventDefault();
              onAddProduct();
            }
          }}
        >
          <span className="material-symbols-sharp"> add </span>
          <span>Add Product</span>
        </button>
      </div>
    </div>
  );
}
