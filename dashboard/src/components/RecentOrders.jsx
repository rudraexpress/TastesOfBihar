import React, { useEffect, useState } from "react";
import { fetchDashboardRecentOrders } from "../api/dashboard";

export default function RecentOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const data = await fetchDashboardRecentOrders(5);
        setOrders(data || []);
      } catch (err) {
        setError("Failed to load recent orders");
        console.error("Recent orders error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  return (
    <div className="recent-orders">
      <h2>Recent Orders</h2>
      <table>
        <thead>
          <tr>
            <th>Customer Name</th>
            <th>Order ID</th>
            <th>Amount</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="5" style={{ textAlign: "center", padding: "1rem" }}>
                Loading recent orders...
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td
                colSpan="5"
                style={{
                  textAlign: "center",
                  padding: "1rem",
                  color: "var(--color-danger)",
                }}
              >
                {error}
              </td>
            </tr>
          ) : orders.length === 0 ? (
            <tr>
              <td
                colSpan="5"
                style={{
                  textAlign: "center",
                  padding: "1rem",
                  color: "var(--color-muted)",
                }}
              >
                No recent orders found
              </td>
            </tr>
          ) : (
            orders.map((order) => (
              <tr key={order.id}>
                <td>{order.customerName}</td>
                <td>#{order.id}</td>
                <td>₹{order.total?.toFixed(2) || "0.00"}</td>
                <td
                  className={
                    order.status === "pending"
                      ? "warning"
                      : order.status === "shipped"
                      ? "primary"
                      : order.status === "delivered"
                      ? "success"
                      : "info"
                  }
                >
                  {order.status?.charAt(0).toUpperCase() +
                    order.status?.slice(1) || "Unknown"}
                </td>
                <td className="primary">Details</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <a href="#" onClick={(e) => e.preventDefault()}>
        Show All
      </a>
    </div>
  );
}
