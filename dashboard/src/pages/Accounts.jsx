import React, { useEffect, useState, useMemo } from "react";
import { listMaterials } from "../api/inventory";
import {
  listPurchases,
  createPurchase,
  listExpenses,
  createExpense,
  accountsSummary,
  balanceSheet,
  exportAccounts,
  profitLoss,
} from "../api/accounts";
import { listSales, createSale, salesSummary } from "../api/sales";

export default function Accounts() {
  const [showBalanceSheet, setShowBalanceSheet] = useState(false);
  const [balanceSheetData, setBalanceSheetData] = useState(null);
  const [showProfitLoss, setShowProfitLoss] = useState(false);
  const [profitLossData, setProfitLossData] = useState(null);
  const [tab, setTab] = useState("purchases");
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [purchaseForm, setPurchaseForm] = useState({
    supplier: "",
    rawMaterialId: "",
    quantity: "",
    unit: "kg", // kept for compatibility but UI locked to kg
    totalAmount: "",
    gstRateOverride: "",
    notes: "",
    invoice: null,
  });
  const [expenseForm, setExpenseForm] = useState({
    category: "advertising",
    description: "",
    baseAmount: "",
    sgstRate: "",
    cgstRate: "",
    igstRate: "",
    notes: "",
    invoice: null,
  });
  const [saleForm, setSaleForm] = useState({
    customerName: "",
    invoiceNumber: "",
    productId: "",
    quantity: 1,
    unit: "pcs",
    total: "",
    gstRate: "",
    notes: "",
  });
  const [salesSummaryState, setSalesSummary] = useState({
    count: 0,
    base: 0,
    gst: 0,
    gross: 0,
  });

  const load = async () => {
    setLoading(true);
    try {
      const [m, p, e, summary, s, sSum] = await Promise.all([
        listMaterials(),
        listPurchases(),
        listExpenses(),
        accountsSummary(),
        listSales(),
        salesSummary(),
      ]);
      setMaterials(m);
      setPurchases(p);
      setExpenses(e);
      setAccountsSummary(summary);
      setSales(s);
      setSalesSummary(sSum || { count: 0, base: 0, gst: 0, gross: 0 });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const [accountsSummaryState, setAccountsSummary] = React.useState(null);

  const changePurchaseField = (f, v) =>
    setPurchaseForm((x) => ({ ...x, [f]: v }));
  const changeExpenseField = (f, v) =>
    setExpenseForm((x) => ({ ...x, [f]: v }));
  const changeSaleField = (f, v) => setSaleForm((x) => ({ ...x, [f]: v }));

  const submitPurchase = async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append("supplier", purchaseForm.supplier);
    form.append("rawMaterialId", purchaseForm.rawMaterialId);
    form.append("quantity", purchaseForm.quantity);
    form.append("unit", purchaseForm.unit);
    form.append("totalAmount", purchaseForm.totalAmount);
    if (purchaseForm.gstRateOverride)
      form.append("gstRate", purchaseForm.gstRateOverride);
    if (purchaseForm.notes) form.append("notes", purchaseForm.notes);
    if (purchaseForm.invoice) form.append("invoice", purchaseForm.invoice);
    await createPurchase(form);
    setPurchaseForm({
      supplier: "",
      rawMaterialId: "",
      quantity: "",
      unit: "kg",
      totalAmount: "",
      gstRateOverride: "",
      notes: "",
      invoice: null,
    });
    await load();
    setTab("purchases");
  };

  const selectedMaterial = useMemo(
    () => materials.find((m) => m.id == purchaseForm.rawMaterialId),
    [materials, purchaseForm.rawMaterialId]
  );
  const effectiveGstRate =
    purchaseForm.gstRateOverride !== ""
      ? parseFloat(purchaseForm.gstRateOverride || 0)
      : selectedMaterial?.gstRate || 0;
  const computed = useMemo(() => {
    const total = parseFloat(purchaseForm.totalAmount || 0);
    if (!total) return { base: 0, gst: 0 };
    if (!effectiveGstRate) return { base: total, gst: 0 };
    const base = total / (1 + effectiveGstRate / 100);
    return { base, gst: total - base };
  }, [purchaseForm.totalAmount, effectiveGstRate]);
  const submitExpense = async (e) => {
    e.preventDefault();
    const form = new FormData();
    Object.entries(expenseForm).forEach(([k, v]) => {
      if (v) form.append(k, v);
    });
    await createExpense(form);
    setExpenseForm({
      category: "advertising",
      description: "",
      baseAmount: "",
      sgstRate: "",
      cgstRate: "",
      igstRate: "",
      notes: "",
      invoice: null,
    });
    await load();
    setTab("expenses");
  };

  const submitSale = async (e) => {
    e.preventDefault();
    const payload = { ...saleForm };
    if (!payload.productId) delete payload.productId;
    if (!payload.gstRate) delete payload.gstRate;
    payload.quantity = parseFloat(payload.quantity) || 1;
    payload.total = parseFloat(payload.total);
    await createSale(payload);
    setSaleForm({
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
    setShowSaleModal(false);
  };

  const saleRate = parseFloat(saleForm.gstRate || 0);
  const saleGross = parseFloat(saleForm.total || 0);
  const saleBase = saleRate ? saleGross / (1 + saleRate / 100) : saleGross;
  const saleGst = saleGross ? saleGross - saleBase : 0;

  // Balance sheet
  const openBalanceSheet = async () => {
    setShowBalanceSheet(true);
    setBalanceSheetData(null);
    try {
      const data = await balanceSheet();
      setBalanceSheetData(data);
    } catch (e) {
      console.error("Balance sheet load failed", e);
      setBalanceSheetData({
        timestamp: new Date().toISOString(),
        inventoryValue: 0,
        purchasesBase: 0,
        salesBase: 0,
        expensesBase: 0,
        inputGst: 0,
        outputGst: 0,
        netGstPayable: 0,
      });
    }
  };

  const openProfitLoss = async () => {
    setShowProfitLoss(true);
    setProfitLossData(null);
    try {
      const data = await profitLoss();
      setProfitLossData(data);
    } catch (e) {
      console.error("P&L load failed", e);
      setProfitLossData({
        periodStart: new Date(Date.now() - 29 * 86400000).toISOString(),
        periodEnd: new Date().toISOString(),
        revenueBase: 0,
        revenueGross: 0,
        cogsEstimated: 0,
        operatingExpensesBase: 0,
        grossProfit: 0,
        netProfitBeforeTax: 0,
        cogsBreakdown: [],
        notes: ["Failed to load P&L"],
      });
    }
  };

  const downloadExport = async (type) => {
    try {
      const blob = await exportAccounts(type);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Export failed");
    }
  };

  return (
    <div>
      <h1>Accounts</h1>
      {accountsSummaryState && (
        <div style={{ marginTop: ".5rem", fontSize: ".95rem" }}>
          <strong>Net GST Payable: </strong>
          <span
            style={{
              color:
                accountsSummaryState.netGstPayable >= 0
                  ? "var(--color-danger)"
                  : "var(--color-success)",
            }}
          >
            ₹{accountsSummaryState.netGstPayable.toFixed(2)}
          </span>
          <div style={{ marginTop: ".25rem", fontSize: ".85rem" }}>
            Output GST: ₹{(accountsSummaryState.outputGst || 0).toFixed(2)} |
            Input GST: ₹{(accountsSummaryState.inputGst || 0).toFixed(2)}
          </div>
        </div>
      )}
      <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
        <button
          onClick={() => setTab("purchases")}
          style={tab === "purchases" ? btnActive : btn}
        >
          Purchases
        </button>
        <button
          onClick={() => setTab("sales")}
          style={tab === "sales" ? btnActive : btn}
        >
          Sales
        </button>
        <button
          onClick={() => setTab("expenses")}
          style={tab === "expenses" ? btnActive : btn}
        >
          Expenses
        </button>
        <button onClick={openBalanceSheet} style={btn}>
          Balance Sheet
        </button>
        <button onClick={openProfitLoss} style={btn}>
          Profit & Loss
        </button>
      </div>
      {loading && <p>Loading...</p>}
      {tab === "purchases" && (
        <div style={{ marginTop: "1rem" }}>
          <h2 style={{ margin: "0 0 .5rem" }}>Add Purchase</h2>
          <form onSubmit={submitPurchase} style={formGrid}>
            <input
              placeholder="Supplier"
              value={purchaseForm.supplier}
              onChange={(e) => changePurchaseField("supplier", e.target.value)}
              required
              style={input}
            />
            <select
              value={purchaseForm.rawMaterialId}
              onChange={(e) =>
                changePurchaseField("rawMaterialId", e.target.value)
              }
              required
              style={input}
            >
              <option value="">Select Material</option>
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <div style={{ display: "flex", gap: ".5rem" }}>
              <input
                type="number"
                placeholder="Quantity"
                value={purchaseForm.quantity}
                onChange={(e) =>
                  changePurchaseField("quantity", e.target.value)
                }
                required
                style={{ ...input, flex: 1 }}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "0.5rem 0.7rem",
                  background: "var(--color-light)",
                  borderRadius: "6px",
                  fontSize: ".85rem",
                  fontWeight: 600,
                  minWidth: "70px",
                  justifyContent: "center",
                }}
              >
                kg
              </div>
            </div>
            <input
              type="number"
              placeholder="Total Amount (Incl. GST)"
              value={purchaseForm.totalAmount}
              onChange={(e) =>
                changePurchaseField("totalAmount", e.target.value)
              }
              required
              style={input}
            />
            <div
              style={{
                display: "flex",
                gap: ".5rem",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <input
                type="number"
                placeholder={`GST % (Material: ${
                  selectedMaterial?.gstRate || 0
                })`}
                value={purchaseForm.gstRateOverride}
                onChange={(e) =>
                  changePurchaseField("gstRateOverride", e.target.value)
                }
                style={{ ...input, flex: 1 }}
              />
              <div style={{ fontSize: ".8rem" }}>
                <div>Base: ₹{computed.base.toFixed(2)}</div>
                <div>
                  GST: ₹{computed.gst.toFixed(2)} ({effectiveGstRate}%)
                </div>
              </div>
            </div>
            <textarea
              placeholder="Notes"
              value={purchaseForm.notes}
              onChange={(e) => changePurchaseField("notes", e.target.value)}
              style={{ ...input, resize: "vertical" }}
            />
            <input
              type="file"
              onChange={(e) =>
                changePurchaseField("invoice", e.target.files[0])
              }
            />
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" style={btnPrimary}>
                Save Purchase
              </button>
            </div>
          </form>
          <h2 style={{ margin: "2rem 0 .5rem" }}>Recent Purchases</h2>
          <div className="customer-info">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Material</th>
                  <th>Qty (kg)</th>
                  <th>Total</th>
                  <th>Base</th>
                  <th>GST</th>
                  <th>Rate%</th>
                  <th>Invoice</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((p) => (
                  <tr key={p.id}>
                    <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td style={{ textAlign: "left" }}>
                      {materials.find((m) => m.id === p.rawMaterialId)?.name ||
                        p.rawMaterialId}
                    </td>
                    <td>{(p.quantityGrams / 1000).toFixed(2)}</td>
                    <td>₹{p.price.toFixed(2)}</td>
                    <td>₹{p.baseAmount?.toFixed(2)}</td>
                    <td>₹{(p.gst ?? p.sgst + p.cgst + p.igst).toFixed(2)}</td>
                    <td>
                      {p.gstRate ??
                        (p.sgst + p.cgst + p.igst && p.baseAmount
                          ? (
                              ((p.sgst + p.cgst + p.igst) / p.baseAmount) *
                              100
                            ).toFixed(2)
                          : 0)}
                    </td>
                    <td>
                      {p.invoiceFile ? (
                        <a href={p.invoiceFile} target="_blank">
                          View
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
                {!purchases.length && (
                  <tr>
                    <td colSpan={8}>No purchases</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "sales" && (
        <div style={{ marginTop: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <h2 style={{ margin: 0 }}>Sales</h2>
            <button
              style={btnPrimary}
              type="button"
              onClick={() => setShowSaleModal(true)}
            >
              Add Sale
            </button>
          </div>
          <p style={{ margin: ".5rem 0 0", fontSize: ".7rem", opacity: 0.8 }}>
            Record occasional offline sales. GST auto derived from total.
          </p>
          <h2 style={{ margin: "1.5rem 0 .5rem" }}>Recent Sales</h2>
          <p style={{ marginTop: 0, fontSize: ".75rem" }}>
            Count: {salesSummaryState.count} | Base ₹
            {salesSummaryState.base.toFixed(2)} | GST ₹
            {salesSummaryState.gst.toFixed(2)} | Gross ₹
            {salesSummaryState.gross.toFixed(2)}
          </p>
          <div className="customer-info">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Invoice</th>
                  <th>Qty</th>
                  <th>Total</th>
                  <th>Base</th>
                  <th>GST</th>
                  <th>Rate%</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((s) => (
                  <tr key={s.id}>
                    <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                    <td style={{ textAlign: "left" }}>
                      {s.customerName || "-"}
                    </td>
                    <td>{s.invoiceNumber || "-"}</td>
                    <td>
                      {s.quantity} {s.unit || ""}
                    </td>
                    <td>₹{s.total.toFixed(2)}</td>
                    <td>₹{s.baseAmount.toFixed(2)}</td>
                    <td>₹{s.gst.toFixed(2)}</td>
                    <td>{s.gstRate || 0}</td>
                  </tr>
                ))}
                {!sales.length && (
                  <tr>
                    <td colSpan={8}>No sales</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "expenses" && (
        <div style={{ marginTop: "1rem" }}>
          <h2 style={{ margin: "0 0 .5rem", textAlign: "center" }}>
            Add Expense
          </h2>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
              width: "100%",
            }}
          >
            <form
              onSubmit={submitExpense}
              style={{
                ...formGrid,
                margin: "0 auto",
                width: "100%",
                maxWidth: "600px",
              }}
            >
              <select
                value={expenseForm.category}
                onChange={(e) => changeExpenseField("category", e.target.value)}
                style={input}
              >
                <option value="advertising">Advertising</option>
                <option value="utilities">Utilities</option>
                <option value="rent">Rent</option>
                <option value="other">Other</option>
              </select>
              <input
                placeholder="Description"
                value={expenseForm.description}
                onChange={(e) =>
                  changeExpenseField("description", e.target.value)
                }
                required
                style={input}
              />
              <input
                type="number"
                placeholder="Base Amount"
                value={expenseForm.baseAmount}
                onChange={(e) =>
                  changeExpenseField("baseAmount", e.target.value)
                }
                required
                style={input}
              />
              <div style={{ display: "flex", gap: ".5rem" }}>
                <input
                  type="number"
                  placeholder="SGST %"
                  value={expenseForm.sgstRate}
                  onChange={(e) =>
                    changeExpenseField("sgstRate", e.target.value)
                  }
                  style={{ ...input, flex: 1 }}
                />
                <input
                  type="number"
                  placeholder="CGST %"
                  value={expenseForm.cgstRate}
                  onChange={(e) =>
                    changeExpenseField("cgstRate", e.target.value)
                  }
                  style={{ ...input, flex: 1 }}
                />
                <input
                  type="number"
                  placeholder="IGST %"
                  value={expenseForm.igstRate}
                  onChange={(e) =>
                    changeExpenseField("igstRate", e.target.value)
                  }
                  style={{ ...input, flex: 1 }}
                />
              </div>
              <textarea
                placeholder="Notes"
                value={expenseForm.notes}
                onChange={(e) => changeExpenseField("notes", e.target.value)}
                style={{ ...input, resize: "vertical" }}
              />
              <input
                type="file"
                onChange={(e) =>
                  changeExpenseField("invoice", e.target.files[0])
                }
              />
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button type="submit" style={btnPrimary}>
                  Save Expense
                </button>
              </div>
            </form>
          </div>
          <h2 style={{ margin: "2rem 0 .5rem", textAlign: "center" }}>
            Recent Expenses
          </h2>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <div
              className="customer-info"
              style={{
                width: "100%",
                maxWidth: "800px",
              }}
            >
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Total</th>
                    <th>GST</th>
                    <th>Invoice</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((x) => (
                    <tr key={x.id}>
                      <td>{new Date(x.createdAt).toLocaleDateString()}</td>
                      <td>{x.category}</td>
                      <td style={{ textAlign: "left", maxWidth: "260px" }}>
                        {x.description}
                      </td>
                      <td>₹{x.amount.toFixed(2)}</td>
                      <td>₹{(x.sgst + x.cgst + x.igst).toFixed(2)}</td>
                      <td>
                        {x.invoiceFile ? (
                          <a href={x.invoiceFile} target="_blank">
                            View
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  ))}
                  {!expenses.length && (
                    <tr>
                      <td colSpan={6}>No expenses</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {showSaleModal && (
        <div style={modalBackdrop}>
          <div
            style={modalCard}
            role="dialog"
            aria-modal="true"
            aria-label="Add Sale"
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: ".75rem",
              }}
            >
              <h3 style={{ margin: 0 }}>Add Sale</h3>
              <button
                type="button"
                onClick={() => setShowSaleModal(false)}
                style={btnGhost}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <form
              onSubmit={submitSale}
              style={{ display: "grid", gap: ".7rem" }}
            >
              <input
                placeholder="Customer"
                value={saleForm.customerName}
                onChange={(e) =>
                  changeSaleField("customerName", e.target.value)
                }
                style={input}
                autoFocus
              />
              <input
                placeholder="Invoice #"
                value={saleForm.invoiceNumber}
                onChange={(e) =>
                  changeSaleField("invoiceNumber", e.target.value)
                }
                style={input}
              />
              <div style={{ display: "flex", gap: ".6rem" }}>
                <input
                  type="number"
                  placeholder="Qty"
                  value={saleForm.quantity}
                  onChange={(e) => changeSaleField("quantity", e.target.value)}
                  style={{ ...input, flex: 1 }}
                />
                <select
                  value={saleForm.unit}
                  onChange={(e) => changeSaleField("unit", e.target.value)}
                  style={{ ...input, width: "90px" }}
                >
                  <option value="pcs">pcs</option>
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="pack">pack</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: ".6rem" }}>
                <input
                  type="number"
                  placeholder="Total (Incl. GST)"
                  value={saleForm.total}
                  onChange={(e) => changeSaleField("total", e.target.value)}
                  required
                  style={{ ...input, flex: 1 }}
                />
                <input
                  type="number"
                  placeholder="GST %"
                  value={saleForm.gstRate}
                  onChange={(e) => changeSaleField("gstRate", e.target.value)}
                  style={{ ...input, width: "90px" }}
                />
              </div>
              <textarea
                placeholder="Notes"
                value={saleForm.notes}
                onChange={(e) => changeSaleField("notes", e.target.value)}
                style={{ ...input, resize: "vertical", minHeight: "70px" }}
              />
              <div
                style={{ fontSize: ".75rem", display: "flex", gap: "1.5rem" }}
              >
                <span>Base: ₹{saleBase ? saleBase.toFixed(2) : "0.00"}</span>
                <span>GST: ₹{saleGst ? saleGst.toFixed(2) : "0.00"}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: ".6rem",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowSaleModal(false)}
                  style={btn}
                >
                  Cancel
                </button>
                <button type="submit" style={btnPrimary} disabled={!saleGross}>
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showBalanceSheet && (
        <div style={modalBackdrop}>
          <div
            style={modalCard}
            role="dialog"
            aria-modal="true"
            aria-label="Balance Sheet"
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: ".75rem",
              }}
            >
              <h3 style={{ margin: 0 }}>Balance Sheet Snapshot</h3>
              <button
                style={btnGhost}
                onClick={() => setShowBalanceSheet(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            {!balanceSheetData && <p style={{ marginTop: 0 }}>Loading...</p>}
            {balanceSheetData && (
              <div style={{ display: "grid", gap: ".5rem", fontSize: ".9rem" }}>
                <div>
                  <strong>As Of:</strong>{" "}
                  {new Date(balanceSheetData.timestamp).toLocaleString()}
                </div>
                {balanceSheetData.startPeriod && balanceSheetData.endPeriod && (
                  <div style={{ fontSize: ".8rem", opacity: 0.85 }}>
                    Period:{" "}
                    {new Date(
                      balanceSheetData.startPeriod
                    ).toLocaleDateString()}{" "}
                    –{" "}
                    {new Date(balanceSheetData.endPeriod).toLocaleDateString()}
                  </div>
                )}
                <div>
                  <strong>Inventory Value:</strong> ₹
                  {balanceSheetData.inventoryValue.toFixed(2)}
                </div>
                <div>
                  <strong>Purchases (Base):</strong> ₹
                  {balanceSheetData.purchasesBase.toFixed(2)}
                </div>
                <div>
                  <strong>Sales (Base):</strong> ₹
                  {balanceSheetData.salesBase.toFixed(2)}
                </div>
                <div>
                  <strong>Expenses (Base):</strong> ₹
                  {balanceSheetData.expensesBase.toFixed(2)}
                </div>
                <div>
                  <strong>Input GST:</strong> ₹
                  {balanceSheetData.inputGst.toFixed(2)}
                </div>
                <div>
                  <strong>Output GST:</strong> ₹
                  {balanceSheetData.outputGst.toFixed(2)}
                </div>
                <div>
                  <strong>Net GST Payable:</strong>{" "}
                  <span
                    style={{
                      color:
                        balanceSheetData.netGstPayable >= 0
                          ? "var(--color-danger)"
                          : "var(--color-success)",
                    }}
                  >
                    ₹{balanceSheetData.netGstPayable.toFixed(2)}
                  </span>
                </div>
                <div
                  style={{
                    marginTop: ".75rem",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: ".5rem",
                  }}
                >
                  <button
                    type="button"
                    style={btn}
                    onClick={() => downloadExport("balanceSheet")}
                  >
                    Export Sheet CSV
                  </button>
                  <button
                    type="button"
                    style={btn}
                    onClick={() => downloadExport("inventory")}
                  >
                    Export Inventory
                  </button>
                  <button
                    type="button"
                    style={btn}
                    onClick={() => downloadExport("purchases")}
                  >
                    Export Purchases
                  </button>
                  <button
                    type="button"
                    style={btn}
                    onClick={() => downloadExport("sales")}
                  >
                    Export Sales
                  </button>
                  <button
                    type="button"
                    style={btn}
                    onClick={() => downloadExport("expenses")}
                  >
                    Export Expenses
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {showProfitLoss && (
        <div style={modalBackdrop}>
          <div
            style={modalCard}
            role="dialog"
            aria-modal="true"
            aria-label="Profit & Loss"
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: ".75rem",
              }}
            >
              <h3 style={{ margin: 0 }}>Profit &amp; Loss (Approx)</h3>
              <button
                style={btnGhost}
                onClick={() => setShowProfitLoss(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            {!profitLossData && <p style={{ marginTop: 0 }}>Loading...</p>}
            {profitLossData && (
              <div style={{ display: "grid", gap: ".5rem", fontSize: ".9rem" }}>
                <div style={{ fontSize: ".8rem", opacity: 0.85 }}>
                  Period:{" "}
                  {new Date(profitLossData.periodStart).toLocaleDateString()} –{" "}
                  {new Date(profitLossData.periodEnd).toLocaleDateString()}
                </div>
                <div>
                  <strong>Revenue (Base):</strong> ₹
                  {profitLossData.revenueBase.toFixed(2)}
                </div>
                <div>
                  <strong>Revenue (Gross):</strong> ₹
                  {profitLossData.revenueGross.toFixed(2)}
                </div>
                <div>
                  <strong>COGS (Est.):</strong> ₹
                  {profitLossData.cogsEstimated.toFixed(2)}
                </div>
                <div>
                  <strong>Gross Profit:</strong> ₹
                  {profitLossData.grossProfit.toFixed(2)}
                </div>
                <div>
                  <strong>Operating Expenses:</strong> ₹
                  {profitLossData.operatingExpensesBase.toFixed(2)}
                </div>
                <div>
                  <strong>Net Profit Before Tax:</strong> ₹
                  {profitLossData.netProfitBeforeTax.toFixed(2)}
                </div>
                {profitLossData.cogsBreakdown?.length > 0 && (
                  <details style={{ marginTop: ".5rem" }}>
                    <summary style={{ cursor: "pointer" }}>
                      COGS Breakdown
                    </summary>
                    <table style={{ width: "100%", marginTop: ".4rem" }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: "left" }}>Material</th>
                          <th>Grams</th>
                          <th>Avg Cost/g</th>
                          <th>Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        {profitLossData.cogsBreakdown.map((r) => (
                          <tr key={r.materialId}>
                            <td style={{ textAlign: "left" }}>{r.name}</td>
                            <td>{r.grams.toFixed(2)}</td>
                            <td>₹{r.avgCostPerGram.toFixed(4)}</td>
                            <td>₹{r.cost.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </details>
                )}
                {profitLossData.notes?.length > 0 && (
                  <ul
                    style={{
                      margin: ".5rem 0 0",
                      paddingLeft: "1.1rem",
                      fontSize: ".7rem",
                      opacity: 0.8,
                    }}
                  >
                    {profitLossData.notes.map((n, i) => (
                      <li key={i}>{n}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const input = {
  padding: "0.5rem 0.7rem",
  borderRadius: "6px",
  background: "var(--color-light)",
  border: "1px solid transparent",
};
const formGrid = { display: "grid", gap: ".7rem", maxWidth: "680px" };
const btn = {
  background: "var(--color-light)",
  padding: "0.5rem 1rem",
  borderRadius: "6px",
  cursor: "pointer",
};
const btnActive = { ...btn, background: "var(--color-primary)", color: "#fff" };
const btnPrimary = {
  background: "var(--color-primary)",
  color: "#fff",
  padding: "0.55rem 1.1rem",
  borderRadius: "6px",
  cursor: "pointer",
};
const btnGhost = {
  background: "transparent",
  cursor: "pointer",
  fontSize: "1rem",
  lineHeight: 1,
};
const modalBackdrop = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.45)",
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  paddingTop: "8vh",
  zIndex: 2000,
  backdropFilter: "blur(2px)",
};
const modalCard = {
  background: "var(--color-white)",
  padding: "1.2rem 1.3rem 1.4rem",
  borderRadius: "1rem",
  width: "min(480px, 92vw)",
  boxShadow: "var(--box-shadow)",
  maxHeight: "80vh",
  overflowY: "auto",
};
