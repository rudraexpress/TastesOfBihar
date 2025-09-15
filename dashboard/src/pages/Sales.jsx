import React, { useEffect, useState } from "react";
import { listSales, createSale, salesSummary } from "../api/sales";
import { getProducts } from "../api/products";

export default function Sales() {
  const [sales, setSales] = useState([]);
  // default summary prevents runtime .toFixed errors when API fails
  const [summary, setSummary] = useState({
    count: 0,
    gross: 0,
    gst: 0,
    base: 0,
  });
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    customerName: "",
    invoiceNumber: "",
    productId: "",
    quantity: 1,
    unit: "pcs",
    total: "",
    gstRate: "",
    notes: "",
  });
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [s, sum, prods] = await Promise.all([
        listSales(),
        salesSummary(),
        getProducts(),
      ]);
      setSales(Array.isArray(s) ? s : []);
      setSummary(sum || { count: 0, gross: 0, gst: 0, base: 0 });
      setProducts(Array.isArray(prods) ? prods : []);
    } catch (e) {
      console.error("Sales load error:", e);
      setError("Failed to load sales: " + (e.message || e));
      // keep defaults so UI still renders
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const change = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = { ...form };
      if (!payload.productId) delete payload.productId;
      if (!payload.gstRate) delete payload.gstRate;
      payload.quantity = parseFloat(payload.quantity) || 1;
      payload.total = parseFloat(payload.total);
      await createSale(payload);
      setForm({
        customerName: "",
        invoiceNumber: "",
        productId: "",
        quantity: 1,
        unit: "pcs",
        total: "",
        gstRate: "",
        notes: "",
      });
      await load();
    } catch (e2) {
      console.error(e2);
      setError("Create failed");
    }
  };

  const rate = parseFloat(form.gstRate || 0);
  const gross = parseFloat(form.total || 0);
  const base = rate ? gross / (1 + rate / 100) : gross;
  const gst = gross ? gross - base : 0;

  return (
    <div>
      <h1>Sales</h1>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "var(--color-danger)" }}>{error}</p>}
      <section style={{ marginTop: "1rem" }}>
        <h2
          style={{
            margin: 0,
            display: "flex",
            gap: ".75rem",
            alignItems: "center",
          }}
        >
          New Sale
        </h2>
        <form
          onSubmit={submit}
          style={{
            marginTop: ".75rem",
            display: "flex",
            flexWrap: "wrap",
            gap: ".75rem",
            alignItems: "flex-end",
          }}
        >
          <input
            name="customerName"
            placeholder="Customer"
            value={form.customerName}
            onChange={change}
            style={input}
          />
          <input
            name="invoiceNumber"
            placeholder="Invoice #"
            value={form.invoiceNumber}
            onChange={change}
            style={input}
          />
          <select
            name="productId"
            value={form.productId}
            onChange={change}
            style={input}
          >
            <option value="">(Optional Product)</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            step="0.01"
            name="quantity"
            value={form.quantity}
            onChange={change}
            placeholder="Qty"
            style={smallNum}
          />
          <select
            name="unit"
            value={form.unit}
            onChange={change}
            style={smallSel}
          >
            <option value="pcs">pcs</option>
            <option value="kg">kg</option>
            <option value="g">g</option>
            <option value="pack">pack</option>
          </select>
          <input
            type="number"
            step="0.01"
            name="total"
            value={form.total}
            onChange={change}
            placeholder="Total (incl GST)"
            style={smallNum}
          />
          <input
            type="number"
            step="0.01"
            name="gstRate"
            value={form.gstRate}
            onChange={change}
            placeholder="GST %"
            style={smallNum}
          />
          <input
            name="notes"
            placeholder="Notes"
            value={form.notes}
            onChange={change}
            style={{ ...input, minWidth: "14rem" }}
          />
          <div style={{ fontSize: ".75rem", lineHeight: 1.2 }}>
            <div>Base: ₹{base ? base.toFixed(2) : "0.00"}</div>
            <div>GST: ₹{gst ? gst.toFixed(2) : "0.00"}</div>
          </div>
          <button type="submit" style={btnSm} disabled={!gross}>
            Save
          </button>
        </form>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2 style={{ margin: 0 }}>Sales Records</h2>
        <p style={{ marginTop: ".25rem", fontSize: ".8rem" }}>
          Count: {summary.count} | Base ₹{(summary.base || 0).toFixed(2)} | GST
          ₹{(summary.gst || 0).toFixed(2)} | Gross ₹
          {(summary.gross || 0).toFixed(2)}
        </p>
        <div className="customer-info" style={{ marginTop: ".75rem" }}>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Invoice</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Total</th>
                <th>Base</th>
                <th>GST</th>
                <th>Rate%</th>
              </tr>
            </thead>
            <tbody>
              {sales && sales.length > 0 ? (
                sales.map((s) => (
                  <tr key={s.id}>
                    <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                    <td style={{ textAlign: "left" }}>
                      {s.customerName || "-"}
                    </td>
                    <td>{s.invoiceNumber || "-"}</td>
                    <td>
                      {s.productId
                        ? products.find((p) => p.id === s.productId)?.name ||
                          s.productId
                        : "-"}
                    </td>
                    <td>
                      {s.quantity} {s.unit || ""}
                    </td>
                    <td>₹{s.total.toFixed(2)}</td>
                    <td>₹{s.baseAmount.toFixed(2)}</td>
                    <td>₹{s.gst.toFixed(2)}</td>
                    <td>{s.gstRate || 0}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9}>No sales yet or failed to load.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

// Shared style tokens (duplicated from other pages; could be refactored later)
const input = {
  background: "var(--color-white)",
  padding: ".45rem .6rem",
  borderRadius: ".4rem",
  border: "1px solid var(--color-light)",
  fontSize: ".78rem",
};
const smallNum = { ...input, width: "7rem" };
const smallSel = { ...input, width: "5.5rem" };
const btnSm = {
  background: "var(--color-primary)",
  color: "#fff",
  padding: ".55rem 1.1rem",
  borderRadius: ".5rem",
  fontSize: ".75rem",
  cursor: "pointer",
  border: 0,
};
