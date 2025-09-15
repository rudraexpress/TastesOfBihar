import React, { useEffect, useState } from "react";
import { listOrders, updateOrderStatus } from "../api/orders";

const STATUSES = [
  { id: "pending", label: "Pending" },
  { id: "shipped", label: "Shipped" },
  { id: "delivered", label: "Delivered" },
];

export default function Orders() {
  const [activeStatus, setActiveStatus] = useState("pending");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listOrders(activeStatus);
      setOrders(data);
    } catch (e) {
      setError(e.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [activeStatus]);

  const cycleStatus = async (order) => {
    const idx = STATUSES.findIndex((s) => s.id === order.status);
    const next = STATUSES[Math.min(idx + 1, STATUSES.length - 1)].id;
    if (next === order.status) return; // already at end
    try {
      await updateOrderStatus(order.id, next);
      load();
    } catch (e) {
      alert(e.message || "Failed to update status");
    }
  };

  return (
    <div id="orders-section">
      <h1>Orders</h1>
      <div style={{ marginTop: "1rem", display: "flex", gap: "0.6rem" }}>
        {STATUSES.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveStatus(s.id)}
            style={{
              background:
                activeStatus === s.id
                  ? "var(--color-primary)"
                  : "var(--color-light)",
              color: activeStatus === s.id ? "#fff" : "var(--color-dark)",
              padding: "0.55rem 1.2rem",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
              border: "2px solid transparent",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {loading && <p style={{ marginTop: "1.2rem" }}>Loading...</p>}
      {error && (
        <p className="danger" style={{ marginTop: "1.2rem" }}>
          {error}
        </p>
      )}

      <div className="customer-info" style={{ marginTop: "1.4rem" }}>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Customer</th>
              <th>Total (₹)</th>
              <th>Status</th>
              <th>Placed</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o, idx) => (
              <tr key={o.id}>
                <td>{idx + 1}</td>
                <td style={{ textAlign: "left" }}>{o.customerName || "-"}</td>
                <td>₹{o.total?.toFixed(2)}</td>
                <td>
                  <span
                    className="status-badge"
                    style={{
                      background:
                        o.status === "pending"
                          ? "#f7cb73"
                          : o.status === "shipped"
                          ? "#6d9ff5"
                          : "#7ddf91",
                      color: "#222",
                      padding: "4px 10px",
                      borderRadius: "20px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {o.status}
                  </span>
                </td>
                <td>
                  {o.createdAt ? new Date(o.createdAt).toLocaleString() : "-"}
                </td>
                <td>
                  {o.status !== "delivered" ? (
                    <button
                      onClick={() => cycleStatus(o)}
                      style={{
                        background: "var(--color-primary)",
                        color: "#fff",
                        padding: "4px 12px",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      Mark{" "}
                      {o.status === "pending"
                        ? "Shipped"
                        : o.status === "shipped"
                        ? "Delivered"
                        : "Done"}
                    </button>
                  ) : (
                    <span style={{ color: "var(--color-success)" }}>
                      Complete
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {!orders.length && !loading && (
              <tr>
                <td colSpan={6}>No {activeStatus} orders.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
