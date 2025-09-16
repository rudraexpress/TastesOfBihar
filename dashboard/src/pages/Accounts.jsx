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
    cgstRate: "",
    sgstRate: "",
    igstRate: "",
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
  // dynamic expense categories with an inline 'add' modal
  const [expenseCategories, setExpenseCategories] = useState([
    "advertising",
    "utilities",
    "rent",
    "other",
  ]);
  const [showAddExpenseCategoryModal, setShowAddExpenseCategoryModal] =
    useState(false);
  const [newExpenseCategory, setNewExpenseCategory] = useState("");
  const [saleForm, setSaleForm] = useState({
    customerName: "",
    invoiceNumber: "",
    productId: "",
    quantity: 1,
    unit: "pcs",
    total: "",
    gstRate: "",
    cgstRate: "",
    sgstRate: "",
    igstRate: "",
    invoice: null,
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
    // append computed GST breakdown
    const igstVal = purchaseForm.igstRate;
    const cgstVal = purchaseForm.cgstRate;
    const sgstVal = purchaseForm.sgstRate;
    if (cgstVal) form.append("cgst", cgstVal);
    if (sgstVal) form.append("sgst", sgstVal);
    if (igstVal) form.append("igst", igstVal);
    // total gst rate (preferred IGST else CGST+SGST else override or material)
    form.append("gstRate", String(effectiveGstRate));
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
      cgstRate: "",
      sgstRate: "",
      igstRate: "",
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
  const effectiveGstRate = useMemo(() => {
    // IGST takes precedence
    const igst = parseFloat(purchaseForm.igstRate || 0) || 0;
    if (igst) return igst;
    const cgst = parseFloat(purchaseForm.cgstRate || 0) || 0;
    const sgst = parseFloat(purchaseForm.sgstRate || 0) || 0;
    if (cgst || sgst) return cgst + sgst;
    if (purchaseForm.gstRateOverride !== "")
      return parseFloat(purchaseForm.gstRateOverride || 0);
    return selectedMaterial?.gstRate || 0;
  }, [
    purchaseForm.cgstRate,
    purchaseForm.sgstRate,
    purchaseForm.igstRate,
    purchaseForm.gstRateOverride,
    selectedMaterial,
  ]);
  const computed = useMemo(() => {
    const total = parseFloat(purchaseForm.totalAmount || 0);
    if (!total) return { base: 0, gst: 0 };
    if (!effectiveGstRate) return { base: total, gst: 0 };
    const base = total / (1 + effectiveGstRate / 100);
    return { base, gst: total - base };
  }, [purchaseForm.totalAmount, effectiveGstRate]);

  // Expense GST computations
  const expenseEffectiveGstRate = useMemo(() => {
    const igst = parseFloat(expenseForm.igstRate || 0) || 0;
    if (igst) return igst;
    const cgst = parseFloat(expenseForm.cgstRate || 0) || 0;
    const sgst = parseFloat(expenseForm.sgstRate || 0) || 0;
    if (cgst || sgst) return cgst + sgst;
    return 0;
  }, [expenseForm.cgstRate, expenseForm.sgstRate, expenseForm.igstRate]);

  const expenseComputed = useMemo(() => {
    const base = parseFloat(expenseForm.baseAmount || 0) || 0;
    const gst = base * (expenseEffectiveGstRate / 100);
    const total = base + gst;
    return { base, gst, total };
  }, [expenseForm.baseAmount, expenseEffectiveGstRate]);
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
    // Prepare sale payload; if an invoice file is attached, send FormData
    const igstVal = saleForm.igstRate;
    const cgstVal = saleForm.cgstRate;
    const sgstVal = saleForm.sgstRate;
    const effectiveGstRate = igstVal
      ? igstVal
      : Number(cgstVal || 0) + Number(sgstVal || 0) || saleForm.gstRate;

    // numeric coercions
    const quantity = parseFloat(saleForm.quantity) || 1;
    const total = parseFloat(saleForm.total) || 0;

    if (saleForm.invoice) {
      const form = new FormData();
      form.append("customerName", saleForm.customerName);
      if (saleForm.invoiceNumber)
        form.append("invoiceNumber", saleForm.invoiceNumber);
      if (saleForm.productId) form.append("productId", saleForm.productId);
      form.append("quantity", String(quantity));
      form.append("unit", saleForm.unit || "pcs");
      form.append("total", String(total));
      if (cgstVal) form.append("cgst", cgstVal);
      if (sgstVal) form.append("sgst", sgstVal);
      if (igstVal) form.append("igst", igstVal);
      form.append("gstRate", String(effectiveGstRate));
      if (saleForm.notes) form.append("notes", saleForm.notes);
      form.append("invoice", saleForm.invoice);

      // send as multipart
      await fetch(
        (import.meta.env?.VITE_API_URL || "http://localhost:5000/api") +
          "/sales",
        {
          method: "POST",
          body: form,
        }
      ).then((res) => {
        if (!res.ok) throw new Error("API error");
        return res.json();
      });
    } else {
      const payload = { ...saleForm };
      if (!payload.productId) delete payload.productId;
      // attach computed GST breakdown
      if (cgstVal) payload.cgst = cgstVal;
      if (sgstVal) payload.sgst = sgstVal;
      if (igstVal) payload.igst = igstVal;
      payload.gstRate = effectiveGstRate;
      payload.quantity = quantity;
      payload.total = total;
      if (!payload.gstRate) delete payload.gstRate;

      await createSale(payload);
    }
    setSaleForm({
      customerName: "",
      invoiceNumber: "",
      productId: "",
      quantity: 1,
      unit: "pcs",
      total: "",
      gstRate: "",
      cgstRate: "",
      sgstRate: "",
      igstRate: "",
      invoice: null,
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
          <h2 style={{ margin: "0 0 .5rem", textAlign: "center" }}>
            Add Purchase
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
              onSubmit={submitPurchase}
              style={{
                ...formGrid,
                margin: "0 auto",
                width: "100%",
                maxWidth: "600px",
              }}
            >
              <input
                placeholder="Supplier"
                value={purchaseForm.supplier}
                onChange={(e) =>
                  changePurchaseField("supplier", e.target.value)
                }
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
                <select
                  value={purchaseForm.unit}
                  onChange={(e) => changePurchaseField("unit", e.target.value)}
                  style={{
                    ...input,
                    display: "inline-block",
                    padding: "0.35rem 0.6rem",
                    minWidth: "70px",
                    textAlign: "center",
                    borderRadius: "6px",
                    fontSize: ".85rem",
                    fontWeight: 600,
                  }}
                >
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                </select>
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
                  gap: ".6rem",
                  alignItems: "center",
                  flexWrap: "wrap",
                  width: "100%",
                }}
              >
                <div style={{ display: "flex", gap: ".5rem", flex: 1 }}>
                  <input
                    type="number"
                    placeholder="CGST %"
                    value={purchaseForm.cgstRate}
                    onChange={(e) => {
                      const v = e.target.value;
                      // setting CGST/SGST clears IGST
                      setPurchaseForm((x) => ({
                        ...x,
                        cgstRate: v,
                        igstRate: "",
                      }));
                    }}
                    style={{ ...input, flex: 1, minWidth: 80 }}
                  />
                  <input
                    type="number"
                    placeholder="SGST %"
                    value={purchaseForm.sgstRate}
                    onChange={(e) => {
                      const v = e.target.value;
                      setPurchaseForm((x) => ({
                        ...x,
                        sgstRate: v,
                        igstRate: "",
                      }));
                    }}
                    style={{ ...input, flex: 1, minWidth: 80 }}
                  />
                  <input
                    type="number"
                    placeholder="IGST %"
                    value={purchaseForm.igstRate}
                    onChange={(e) => {
                      const v = e.target.value;
                      // setting IGST clears CGST/SGST
                      setPurchaseForm((x) => ({
                        ...x,
                        igstRate: v,
                        cgstRate: "",
                        sgstRate: "",
                      }));
                    }}
                    style={{ ...input, width: "140px", minWidth: 100 }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: ".6rem",
                    flex: 1,
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: ".6rem",
                    }}
                  >
                    <input
                      type="text"
                      readOnly
                      value={`GST %: ${effectiveGstRate}%`}
                      style={{
                        ...input,
                        width: "120px",
                        textAlign: "center",
                        background: "var(--color-light)",
                      }}
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: ".6rem",
                      justifyContent: "flex-end",
                    }}
                  >
                    <div
                      style={{
                        fontSize: ".8rem",
                        display: "flex",
                        flexDirection: "column",
                        textAlign: "right",
                      }}
                    >
                      <div>Base: ₹{computed.base.toFixed(2)}</div>
                      <div>
                        GST: ₹{computed.gst.toFixed(2)} ({effectiveGstRate}%)
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <textarea
                placeholder="Notes"
                value={purchaseForm.notes}
                onChange={(e) => changePurchaseField("notes", e.target.value)}
                style={{ ...input, resize: "vertical" }}
              />
              <div
                style={{ display: "flex", alignItems: "center", gap: ".6rem" }}
              >
                <input
                  id="purchase-invoice-input"
                  type="file"
                  onChange={(e) =>
                    changePurchaseField("invoice", e.target.files[0])
                  }
                  style={{ display: "none" }}
                  aria-label="Upload purchase invoice"
                />

                <label
                  htmlFor="purchase-invoice-input"
                  style={{
                    background: "var(--color-primary)",
                    color: "#fff",
                    padding: ".35rem .6rem",
                    borderRadius: "6px",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: ".35rem",
                    border: "none",
                    fontSize: "0.9rem",
                    height: "32px",
                  }}
                >
                  <span
                    className="material-symbols-sharp"
                    style={{ fontSize: "18px", lineHeight: 1 }}
                  >
                    cloud_upload
                  </span>
                  Choose Invoice
                </label>

                <div style={{ fontSize: ".9rem", color: "var(--color-dark)" }}>
                  {purchaseForm.invoice ? (
                    <span>{purchaseForm.invoice.name || "Selected file"}</span>
                  ) : (
                    <span style={{ color: "#6b7280" }}>No file chosen</span>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button type="submit" style={btnPrimary}>
                  Save Purchase
                </button>
              </div>
            </form>
          </div>
          <h2 style={{ margin: "2rem 0 .5rem" }}>Recent Purchases</h2>
          <div className="customer-info">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Material</th>
                  <th>Qty (kg)</th>
                  <th>Invoice</th>
                  <th>Base</th>
                  <th>CGST</th>
                  <th>SGST</th>
                  <th>IGST</th>
                  <th>GST (total)</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((p) => {
                  const cgst = Number(p.cgst) || 0;
                  const sgst = Number(p.sgst) || 0;
                  const igst = Number(p.igst) || 0;
                  const gstTotal = Number(p.gst) || cgst + sgst + igst;
                  const base = Number(p.baseAmount) || 0;
                  const ratePercent = p.gstRate
                    ? Number(p.gstRate)
                    : base
                    ? Number(((gstTotal / base) * 100).toFixed(2))
                    : 0;

                  return (
                    <tr key={p.id}>
                      <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td style={{ textAlign: "left" }}>
                        {materials.find((m) => m.id === p.rawMaterialId)
                          ?.name || p.rawMaterialId}
                      </td>
                      <td>{(p.quantityGrams / 1000).toFixed(2)}</td>
                      <td>
                        {p.invoiceFile ? (
                          <a href={p.invoiceFile} target="_blank">
                            View
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>₹{base.toFixed(2)}</td>
                      <td>₹{cgst.toFixed(2)}</td>
                      <td>₹{sgst.toFixed(2)}</td>
                      <td>₹{igst.toFixed(2)}</td>
                      <td>₹{gstTotal.toFixed(2)}</td>
                      <td>₹{Number(p.price || 0).toFixed(2)}</td>
                    </tr>
                  );
                })}
                {!purchases.length && (
                  <tr>
                    <td colSpan={10}>No purchases</td>
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
                  <th>Qty (pcs)</th>
                  <th>Invoice</th>
                  <th>Base</th>
                  <th>CGST</th>
                  <th>SGST</th>
                  <th>IGST</th>
                  <th>GST (total)</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((s) => {
                  const cgst = Number(s.cgst) || 0;
                  const sgst = Number(s.sgst) || 0;
                  const igst = Number(s.igst) || 0;
                  const gstTotal = Number(s.gst) || cgst + sgst + igst;
                  const base = Number(s.baseAmount) || 0;
                  const total = Number(s.total) || 0;
                  return (
                    <tr key={s.id}>
                      <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                      <td style={{ textAlign: "left" }}>
                        {s.customerName || "-"}
                      </td>
                      <td>
                        {s.quantity} {s.unit || "pcs"}
                      </td>
                      <td>
                        {s.invoiceFile ? (
                          <a
                            href={s.invoiceFile}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View
                          </a>
                        ) : s.invoiceNumber ? (
                          s.invoiceNumber
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>₹{base.toFixed(2)}</td>
                      <td>₹{cgst.toFixed(2)}</td>
                      <td>₹{sgst.toFixed(2)}</td>
                      <td>₹{igst.toFixed(2)}</td>
                      <td>₹{gstTotal.toFixed(2)}</td>
                      <td>₹{total.toFixed(2)}</td>
                    </tr>
                  );
                })}
                {!sales.length && (
                  <tr>
                    <td colSpan={10}>No sales</td>
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
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <select
                    value={expenseForm.category}
                    onChange={(e) =>
                      changeExpenseField("category", e.target.value)
                    }
                    style={{
                      ...input,
                      flex: 1,
                      borderTopRightRadius: 0,
                      borderBottomRightRadius: 0,
                      borderRight: "none",
                      WebkitAppearance: "none",
                      MozAppearance: "none",
                      appearance: "none",
                    }}
                  >
                    <option value="">Select Category</option>
                    {expenseCategories.map((c) => (
                      <option key={c} value={c}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowAddExpenseCategoryModal(true)}
                    aria-label="Add expense category"
                    style={{
                      height: "34px",
                      minWidth: "40px",
                      borderRadius: "0 6px 6px 0",
                      background: "var(--color-primary)",
                      color: "#fff",
                      border: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      fontSize: "1.05rem",
                      padding: 0,
                      marginLeft: -1,
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
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
              <div
                style={{
                  display: "flex",
                  gap: ".6rem",
                  alignItems: "center",
                  flexWrap: "wrap",
                  width: "100%",
                }}
              >
                <div style={{ display: "flex", gap: ".5rem", flex: 1 }}>
                  <input
                    type="text"
                    readOnly
                    value={`GST %: ${expenseEffectiveGstRate}%`}
                    style={{
                      ...input,
                      width: "120px",
                      textAlign: "center",
                      background: "var(--color-light)",
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: ".6rem",
                    justifyContent: "flex-end",
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      fontSize: ".8rem",
                      display: "flex",
                      flexDirection: "column",
                      textAlign: "right",
                    }}
                  >
                    <div>Base: ₹{expenseComputed.base.toFixed(2)}</div>
                    <div>
                      GST: ₹{expenseComputed.gst.toFixed(2)} (
                      {expenseEffectiveGstRate}%)
                    </div>
                  </div>
                </div>
              </div>
              <textarea
                placeholder="Notes"
                value={expenseForm.notes}
                onChange={(e) => changeExpenseField("notes", e.target.value)}
                style={{ ...input, resize: "vertical" }}
              />
              <div
                style={{ display: "flex", alignItems: "center", gap: ".6rem" }}
              >
                <input
                  id="expense-invoice-input"
                  type="file"
                  onChange={(e) =>
                    changeExpenseField("invoice", e.target.files[0])
                  }
                  style={{ display: "none" }}
                  aria-label="Upload expense invoice"
                />

                <label
                  htmlFor="expense-invoice-input"
                  style={{
                    background: "var(--color-primary)",
                    color: "#fff",
                    padding: ".35rem .6rem",
                    borderRadius: "6px",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: ".35rem",
                    border: "none",
                    fontSize: "0.9rem",
                    height: "32px",
                  }}
                >
                  <span
                    className="material-symbols-sharp"
                    style={{ fontSize: "18px", lineHeight: 1 }}
                  >
                    cloud_upload
                  </span>
                  Choose Invoice
                </label>

                <div style={{ fontSize: ".9rem", color: "var(--color-dark)" }}>
                  {expenseForm.invoice ? (
                    <span>{expenseForm.invoice.name || "Selected file"}</span>
                  ) : (
                    <span style={{ color: "#6b7280" }}>No file chosen</span>
                  )}
                </div>
              </div>
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
                    <th>Base</th>
                    <th>CGST</th>
                    <th>SGST</th>
                    <th>IGST</th>
                    <th>GST (total)</th>
                    <th>Total</th>
                    <th>Invoice</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((x) => {
                    const cgst = Number(x.cgst) || 0;
                    const sgst = Number(x.sgst) || 0;
                    const igst = Number(x.igst) || 0;
                    const gstTotal = Number(x.gst) || cgst + sgst + igst;
                    const base = Number(x.baseAmount) || 0;
                    const total = Number(x.amount) || 0;
                    return (
                      <tr key={x.id}>
                        <td>{new Date(x.createdAt).toLocaleDateString()}</td>
                        <td>{x.category}</td>
                        <td style={{ textAlign: "left", maxWidth: "260px" }}>
                          {x.description}
                        </td>
                        <td>₹{base.toFixed(2)}</td>
                        <td>₹{cgst.toFixed(2)}</td>
                        <td>₹{sgst.toFixed(2)}</td>
                        <td>₹{igst.toFixed(2)}</td>
                        <td>₹{gstTotal.toFixed(2)}</td>
                        <td>₹{total.toFixed(2)}</td>
                        <td>
                          {x.invoiceFile ? (
                            <a
                              href={x.invoiceFile}
                              target="_blank"
                              rel="noreferrer"
                            >
                              View
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {!expenses.length && (
                    <tr>
                      <td colSpan={10}>No expenses</td>
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
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "0.35rem 0.6rem",
                    background: "var(--color-light)",
                    borderRadius: "6px",
                    fontSize: ".85rem",
                    fontWeight: 600,
                    minWidth: "70px",
                    justifyContent: "center",
                  }}
                >
                  pcs
                </div>
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
              </div>

              <div
                style={{
                  display: "flex",
                  gap: ".6rem",
                  alignItems: "center",
                  flexWrap: "wrap",
                  width: "100%",
                }}
              >
                <div style={{ display: "flex", gap: ".5rem", flex: 1 }}>
                  <input
                    type="number"
                    placeholder="CGST %"
                    value={saleForm.cgstRate}
                    onChange={(e) => {
                      const v = e.target.value;
                      changeSaleField("cgstRate", v);
                      // clear IGST
                      changeSaleField("igstRate", "");
                    }}
                    style={{ ...input, flex: 1, minWidth: 80 }}
                  />
                  <input
                    type="number"
                    placeholder="SGST %"
                    value={saleForm.sgstRate}
                    onChange={(e) => {
                      const v = e.target.value;
                      changeSaleField("sgstRate", v);
                      changeSaleField("igstRate", "");
                    }}
                    style={{ ...input, flex: 1, minWidth: 80 }}
                  />
                  <input
                    type="number"
                    placeholder="IGST %"
                    value={saleForm.igstRate}
                    onChange={(e) => {
                      const v = e.target.value;
                      changeSaleField("igstRate", v);
                      changeSaleField("cgstRate", "");
                      changeSaleField("sgstRate", "");
                    }}
                    style={{ ...input, width: "140px", minWidth: 100 }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: ".6rem",
                    flex: 1,
                    justifyContent: "space-between",
                  }}
                >
                  <input
                    type="text"
                    readOnly
                    value={`GST %: ${
                      saleForm.igstRate
                        ? saleForm.igstRate
                        : Number(saleForm.cgstRate || 0) +
                            Number(saleForm.sgstRate || 0) ||
                          saleForm.gstRate ||
                          0
                    }%`}
                    style={{
                      ...input,
                      width: "120px",
                      textAlign: "center",
                      background: "var(--color-light)",
                    }}
                  />

                  <div
                    style={{
                      fontSize: ".75rem",
                      display: "flex",
                      gap: "1.5rem",
                      justifyContent: "flex-end",
                    }}
                  >
                    <span>
                      Base: ₹{saleBase ? saleBase.toFixed(2) : "0.00"}
                    </span>
                    <span>GST: ₹{saleGst ? saleGst.toFixed(2) : "0.00"}</span>
                  </div>
                </div>
              </div>

              <textarea
                placeholder="Notes"
                value={saleForm.notes}
                onChange={(e) => changeSaleField("notes", e.target.value)}
                style={{ ...input, resize: "vertical", minHeight: "70px" }}
              />

              <input
                id="sale-invoice-input"
                type="file"
                onChange={(e) => changeSaleField("invoice", e.target.files[0])}
                style={{ display: "none" }}
                aria-label="Upload sale invoice"
              />
              <div
                style={{ display: "flex", gap: ".6rem", alignItems: "center" }}
              >
                <label
                  htmlFor="sale-invoice-input"
                  style={{
                    background: "var(--color-primary)",
                    color: "#fff",
                    padding: ".35rem .6rem",
                    borderRadius: "6px",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: ".35rem",
                    border: "none",
                    fontSize: "0.9rem",
                    height: "32px",
                  }}
                >
                  <span
                    className="material-symbols-sharp"
                    style={{ fontSize: "18px", lineHeight: 1 }}
                  >
                    cloud_upload
                  </span>
                  Choose Invoice
                </label>
                <div style={{ fontSize: ".9rem", color: "var(--color-dark)" }}>
                  {saleForm.invoice ? (
                    <span>{saleForm.invoice.name || "Selected file"}</span>
                  ) : (
                    <span style={{ color: "#6b7280" }}>No file chosen</span>
                  )}
                </div>
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
      {showAddExpenseCategoryModal && (
        <div style={modalBackdrop}>
          <div
            style={modalCard}
            role="dialog"
            aria-modal="true"
            aria-label="Add Expense Category"
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: ".75rem",
              }}
            >
              <h3 style={{ margin: 0 }}>Add Expense Category</h3>
              <button
                type="button"
                onClick={() => setShowAddExpenseCategoryModal(false)}
                style={btnGhost}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div style={{ display: "grid", gap: ".6rem" }}>
              <input
                placeholder="Category name"
                value={newExpenseCategory}
                onChange={(e) => setNewExpenseCategory(e.target.value)}
                style={input}
                autoFocus
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: ".6rem",
                }}
              >
                <button
                  type="button"
                  style={btn}
                  onClick={() => {
                    setNewExpenseCategory("");
                    setShowAddExpenseCategoryModal(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  style={btnPrimary}
                  onClick={() => {
                    const v = (newExpenseCategory || "").trim();
                    if (!v) return;
                    // prevent duplicates
                    if (!expenseCategories.includes(v)) {
                      setExpenseCategories((s) => [...s, v]);
                    }
                    changeExpenseField("category", v);
                    setNewExpenseCategory("");
                    setShowAddExpenseCategoryModal(false);
                  }}
                >
                  Add
                </button>
              </div>
            </div>
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
  padding: ".9rem 1rem",
  borderRadius: ".8rem",
  width: "min(720px, 94vw)",
  boxShadow: "var(--box-shadow)",
  maxHeight: "85vh",
  overflowY: "auto",
  boxSizing: "border-box",
};
