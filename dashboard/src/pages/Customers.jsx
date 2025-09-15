import React, { useEffect, useState } from "react";
import { listOrders } from "../api/orders";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCustomers() {
      setLoading(true);
      setError("");
      try {
        // Fetch all orders, then extract unique customers
        const orders = await listOrders();
        // Map orders to customer objects (assuming order has customer info)
        const customerMap = {};
        orders.forEach((order) => {
          if (order.customerName) {
            if (!customerMap[order.customerName]) {
              customerMap[order.customerName] = {
                customerName: order.customerName,
                phoneNumber: order.phoneNumber || "",
                emailId: order.emailId || "",
                address: order.address || "",
                orders: 1,
              };
            } else {
              customerMap[order.customerName].orders += 1;
            }
          }
        });
        setCustomers(Object.values(customerMap));
      } catch (e) {
        setError(e.message || "Failed to load customers");
      } finally {
        setLoading(false);
      }
    }
    fetchCustomers();
  }, []);

  return (
    <div id="customers-section">
      <div className="customer-info">
        <h2>Customers</h2>
        <div className="filter">
          <div className="input">
            <div className="date">
              <input type="date" />
              <p>To</p>
              <input type="date" />
            </div>
            <div className="inputquerry">
              <input type="name" placeholder="Name" />
            </div>
            <div className="inputquerry">
              <input type="email" placeholder="Email" />
            </div>
            <div className="inputquerry">
              <input type="text" placeholder="Address" />
            </div>
          </div>
          <button className="export">
            <span className="material-symbols-sharp"> file_export </span>Export
            Excel
          </button>
        </div>
        {error && <div style={{ color: "red" }}>{error}</div>}
        <table className="customer">
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Phone Number</th>
              <th>Email Id</th>
              <th>Address</th>
              <th>Orders</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5}>Loading...</td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={5}>No customers found</td>
              </tr>
            ) : (
              customers.map((c, i) => (
                <tr key={i}>
                  <td>{c.customerName}</td>
                  <td>{c.phoneNumber}</td>
                  <td>{c.emailId}</td>
                  <td>{c.address}</td>
                  <td>{c.orders}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <a href="#">Show All</a>
      </div>
    </div>
  );
}
