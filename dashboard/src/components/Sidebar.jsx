import React from "react";
import { PUBLIC_SITE_URL } from "../config";

const links = [
  { id: "dashboard", icon: "dashboard", label: "Dashboard" },
  { id: "customers", icon: "groups", label: "Customers" },
  { id: "orders", icon: "receipt_long", label: "Orders" },
  { id: "analytics", icon: "insights", label: "Analytics" },
  { id: "inventory", icon: "inventory_2", label: "Inventory" },
  { id: "accounts", icon: "account_balance", label: "Accounts" },
  { id: "messages", icon: "mail_outline", label: "Messages", badge: 26 },
  { id: "products", icon: "inventory", label: "Products" },
  { id: "reports", icon: "report_gmailerrorred", label: "Reports" },
  { id: "settings", icon: "settings", label: "Settings" },
  { id: "logout", icon: "logout", label: "Logout" },
];

export default function Sidebar({ active, onChange, onLogout }) {
  return (
    <aside>
      <div className="top">
        <div className="logo">
          <img src="images/logo.png" alt="brand logo" />
          <h2>
            Tastes<span className="brand-bihar">OfBihar</span>
          </h2>
        </div>
        <div className="close" id="close-btn">
          <span className="material-symbols-sharp"> close </span>
        </div>
      </div>

      <div className="sidebar">
        {links.map((l) => {
          const handleClick = (e) => {
            e.preventDefault();
            if (l.id === "logout") {
              // Optional external callback (e.g., clear tokens)
              if (onLogout) {
                try {
                  onLogout();
                } catch (err) {
                  console.error("onLogout error", err);
                }
              }
              // Redirect to main public site root
              window.location.href = PUBLIC_SITE_URL;
              return;
            }
            onChange(l.id);
          };
          return (
            <a
              key={l.id}
              href="#"
              className={active === l.id ? "active" : ""}
              onClick={handleClick}
            >
              <span className="material-symbols-sharp">{l.icon}</span>
              <h3>{l.label}</h3>
              {l.badge && <span className="message-count">{l.badge}</span>}
            </a>
          );
        })}
      </div>
    </aside>
  );
}
