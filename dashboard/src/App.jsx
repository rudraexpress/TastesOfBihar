import React, { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import RightBar from "./components/RightBar";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import SimplePage from "./pages/SimplePage";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Analytics from "./pages/Analytics";
import Inventory from "./pages/Inventory";
import Accounts from "./pages/Accounts";

export default function App() {
  const [active, setActive] = useState("dashboard");
  const [productModalRequest, setProductModalRequest] = useState(0); // incremental signal
  const [rightCollapsed, setRightCollapsed] = useState(false);
  // centralize theme so hiding RightBar (which previously owned toggle) doesn't reset
  const [isDark, setIsDark] = useState(() => {
    try {
      return localStorage.getItem("theme-dark") === "1";
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    if (isDark) document.body.classList.add("dark-theme-variables");
    else document.body.classList.remove("dark-theme-variables");
    try {
      localStorage.setItem("theme-dark", isDark ? "1" : "0");
    } catch (e) {}
  }, [isDark]);

  const toggleTheme = () => setIsDark((v) => !v);

  const handleAddProductRequest = () => {
    setActive("products");
    setTimeout(() => setProductModalRequest((c) => c + 1), 0);
  };

  return (
    <div className={`container ${rightCollapsed ? "right-collapsed" : ""}`}>
      <Sidebar active={active} onChange={setActive} />

      <main id="content">
        {active === "dashboard" && <Dashboard />}
        {active === "customers" && <Customers />}
        {active === "orders" && <Orders />}
        {active === "analytics" && <Analytics />}
        {active === "inventory" && <Inventory />}
        {active === "accounts" && <Accounts />}
        {active === "messages" && (
          <SimplePage title="Support">
            <p>Support Chat will be displayed here.</p>
          </SimplePage>
        )}
        {active === "products" && <Products openSignal={productModalRequest} />}
        {active === "reports" && (
          <SimplePage title="Reports">
            <p>Reports will be displayed here.</p>
          </SimplePage>
        )}
        {active === "settings" && (
          <SimplePage title="Settings">
            <p>Settings will be displayed here.</p>
          </SimplePage>
        )}
      </main>

      {!rightCollapsed && (
        <RightBar
          activePage={active}
          onAddProduct={handleAddProductRequest}
          externalThemeState={{ isDark, toggleTheme }}
          onCollapse={() => setRightCollapsed(true)}
        />
      )}
      {rightCollapsed && (
        <button
          className="expand-right-btn"
          onClick={() => setRightCollapsed(false)}
          aria-label="Expand analytics panel"
        >
          <span className="material-symbols-sharp"> chevron_left </span>
        </button>
      )}
    </div>
  );
}
