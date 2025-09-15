import React, { useEffect, useState, useMemo } from "react";
import {
  listMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  getRecipe,
  saveRecipe,
  produce,
  lowStock,
  listWastage,
  recordWastage,
} from "../api/inventory";
import { listProducts } from "../api/products";

// Small metric display
function Metric({ label, value, emphasize }) {
  return (
    <div style={{ minWidth: 110 }}>
      <div
        style={{
          fontSize: ".6rem",
          opacity: 0.7,
          textTransform: "uppercase",
          letterSpacing: ".5px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontWeight: 600,
          color: emphasize ? "var(--color-danger)" : "inherit",
        }}
      >
        {value}
      </div>
    </div>
  );
}
const tabBtn = {
  background: "var(--color-light)",
  padding: ".45rem .9rem",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: ".8rem",
  border: "none",
};
const tabBtnActive = {
  ...tabBtn,
  background: "var(--color-primary)",
  color: "#fff",
};

export default function Inventory() {
  // Core state
  // Start on overview to give immediate consolidated snapshot
  const [tab, setTab] = useState("overview");
  const [materials, setMaterials] = useState([]);
  const [products, setProducts] = useState([]);
  const [low, setLow] = useState([]);
  const [wastage, setWastage] = useState([]);
  const [loading, setLoading] = useState(false);

  // Material form
  const [showMatModal, setShowMatModal] = useState(false);
  const [editingMat, setEditingMat] = useState(null);
  const [matForm, setMatForm] = useState({
    name: "",
    unit: "g",
    reorderLevel: "",
    gstRate: "",
  });

  // Recipe / production
  const [selectedProduct, setSelectedProduct] = useState("");
  const [recipe, setRecipe] = useState([]); // [{rawMaterialId, grams}]
  const [produceForm, setProduceForm] = useState({
    units: "",
    outputMassGrams: "",
  });

  // Wastage
  const [wastageModalOpen, setWastageModalOpen] = useState(false);
  const [wastageForm, setWastageForm] = useState({
    rawMaterialId: "",
    productId: "",
    quantity: "",
    unit: "g",
    reason: "damage",
    notes: "",
  });

  // Filters
  const [matFilter, setMatFilter] = useState("");

  // Load data
  const loadAll = async () => {
    setLoading(true);
    try {
      const [m, p, w] = await Promise.all([
        listMaterials(),
        listProducts(),
        listWastage().catch(() => []),
      ]);
      setMaterials(m);
      setProducts(p);
      setWastage(w);
      const lw = await lowStock();
      setLow(lw);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadAll();
  }, []);

  // Fetch recipe when product changes
  useEffect(() => {
    if (selectedProduct) {
      getRecipe(selectedProduct).then((r) =>
        setRecipe(
          r.map((x) => ({ rawMaterialId: x.rawMaterialId, grams: x.grams }))
        )
      );
    } else setRecipe([]);
  }, [selectedProduct]);

  // Derived metrics
  const inventoryValue = useMemo(
    () =>
      materials.reduce(
        (s, m) => s + (m.quantityGrams || 0) * (m.avgCostPerGram || 0),
        0
      ),
    [materials]
  );
  const lowCount = low.length;
  const productCount = products.length;
  const matFiltered = materials.filter((m) =>
    m.name.toLowerCase().includes(matFilter.toLowerCase())
  );

  // Aggregated wastage (absolute grams lost per item)
  const wastageAgg = useMemo(() => {
    const material = {};
    const product = {};
    wastage.forEach((w) => {
      const amt = Math.abs(w.deltaGrams || 0);
      if (w.rawMaterialId) {
        material[w.rawMaterialId] = (material[w.rawMaterialId] || 0) + amt;
      } else if (w.productId) {
        product[w.productId] = (product[w.productId] || 0) + amt;
      }
    });
    return { material, product };
  }, [wastage]);

  // Overview combined rows
  const overviewRows = useMemo(() => {
    const rows = [];
    materials.forEach((m) => {
      rows.push({
        key: "mat-" + m.id,
        type: "Material",
        name: m.name,
        qty: m.quantityGrams || 0,
        unit: "g",
        avgCost: m.avgCostPerGram || 0,
        value: (m.quantityGrams || 0) * (m.avgCostPerGram || 0),
        wastage: wastageAgg.material[m.id] || 0,
      });
    });
    products.forEach((p) => {
      rows.push({
        key: "prod-" + p.id,
        type: "Product",
        name: p.name,
        qty: p.stock ?? 0,
        unit: "pcs",
        avgCost: null, // not tracked at product level yet
        value: null, // value calculation for finished goods not implemented
        wastage: wastageAgg.product[p.id] || 0,
      });
    });
    return rows;
  }, [materials, products, wastageAgg]);

  const totalMaterialValue = useMemo(
    () =>
      overviewRows
        .filter((r) => r.type === "Material")
        .reduce((s, r) => s + r.value, 0),
    [overviewRows]
  );
  const totalMaterialWastage = useMemo(
    () =>
      overviewRows
        .filter((r) => r.type === "Material")
        .reduce((s, r) => s + r.wastage, 0),
    [overviewRows]
  );
  const totalProductWastage = useMemo(
    () =>
      overviewRows
        .filter((r) => r.type === "Product")
        .reduce((s, r) => s + r.wastage, 0),
    [overviewRows]
  );

  // Production preview
  const recipePreview = useMemo(() => {
    const units = parseFloat(produceForm.units || 0);
    if (!selectedProduct || !units || !recipe.length) return [];
    return recipe.map((r) => {
      const mat = materials.find((m) => m.id === r.rawMaterialId);
      const gramsNeeded = (parseFloat(r.grams) || 0) * units;
      return {
        rawMaterialId: r.rawMaterialId,
        name: mat?.name || r.rawMaterialId,
        gramsNeeded,
        available: mat?.quantityGrams || 0,
        remaining: (mat?.quantityGrams || 0) - gramsNeeded,
      };
    });
  }, [produceForm.units, selectedProduct, recipe, materials]);

  // Handlers: materials
  const openAddMaterial = () => {
    setEditingMat(null);
    setMatForm({ name: "", unit: "g", reorderLevel: "", gstRate: "" });
    setShowMatModal(true);
  };
  const openEditMaterial = (m) => {
    setEditingMat(m);
    setMatForm({
      name: m.name,
      unit: m.unit,
      reorderLevel: m.reorderLevelGrams || "",
      gstRate: m.gstRate || "",
    });
    setShowMatModal(true);
  };
  const saveMaterial = async (e) => {
    e.preventDefault();
    const payload = { name: matForm.name, unit: matForm.unit };
    if (matForm.reorderLevel)
      payload.reorderLevel = parseFloat(matForm.reorderLevel);
    if (matForm.gstRate !== "") payload.gstRate = parseFloat(matForm.gstRate);
    if (editingMat) await updateMaterial(editingMat.id, payload);
    else await createMaterial(payload);
    setShowMatModal(false);
    await loadAll();
  };
  const deleteMaterialHandler = async (m) => {
    if (!window.confirm("Delete material?")) return;
    await deleteMaterial(m.id);
    loadAll();
  };

  // Handlers: recipe
  const addRecipeItem = () =>
    setRecipe((r) => [
      ...r,
      { rawMaterialId: materials[0]?.id || "", grams: "" },
    ]);
  const updateRecipeItem = (idx, field, value) =>
    setRecipe((r) =>
      r.map((it, i) => (i === idx ? { ...it, [field]: value } : it))
    );
  const removeRecipeItem = (idx) =>
    setRecipe((r) => r.filter((_, i) => i !== idx));
  const saveRecipeHandler = async () => {
    if (!selectedProduct) return;
    await saveRecipe(
      selectedProduct,
      recipe.map((r) => ({
        rawMaterialId: r.rawMaterialId,
        grams: parseFloat(r.grams || 0),
      }))
    );
    alert("Recipe saved");
  };

  // Handlers: production
  const produceHandler = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return alert("Select product");
    const units = parseFloat(produceForm.units || 0);
    if (!units || units <= 0) return alert("Enter units");
    if (recipePreview.some((r) => r.remaining < 0)) {
      if (!window.confirm("Some materials insufficient. Continue?")) return;
    }
    try {
      // Treat outputMassGrams field as kilograms entered by user (optional)
      let outputMassGrams;
      if (produceForm.outputMassGrams) {
        const kg = parseFloat(produceForm.outputMassGrams);
        if (kg > 0) outputMassGrams = kg * 1000; // convert to grams for backend
      }
      await produce({
        productId: selectedProduct,
        unitsProduced: units,
        outputMassGrams,
      });
      setProduceForm({ units: "", outputMassGrams: "" });
      await loadAll();
    } catch (err) {
      alert(err.message || "Production failed");
    }
  };

  // Handlers: wastage
  const openWastageModal = () => {
    setWastageForm({
      rawMaterialId: materials[0]?.id || "",
      productId: "",
      quantity: "",
      unit: "kg", // user will input in kg now
      reason: "damage",
      notes: "",
    });
    setWastageModalOpen(true);
  };
  const saveWastage = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...wastageForm };
      if (!payload.rawMaterialId) delete payload.rawMaterialId;
      if (!payload.productId) delete payload.productId;
      const q = parseFloat(payload.quantity);
      if (!q || q <= 0) return alert("Enter quantity");
      // Convert kg to grams for raw material wastage when rawMaterialId present and unit is kg
      if (payload.rawMaterialId && (!payload.unit || payload.unit === "kg")) {
        payload.quantity = q * 1000;
        payload.unit = "g"; // backend expects grams unit for conversion safety
      } else {
        payload.quantity = q;
      }
      await recordWastage(payload);
      setWastageModalOpen(false);
      await loadAll();
    } catch (err) {
      alert(err.message || "Failed");
    }
  };

  return (
    <div>
      <h1 style={{ margin: 0 }}>Inventory</h1>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1.2rem",
          marginTop: ".85rem",
          fontSize: ".8rem",
        }}
      >
        <Metric
          label="Inventory Value"
          value={`₹${inventoryValue.toFixed(2)}`}
        />
        <Metric label="Materials" value={materials.length} />
        <Metric label="Products" value={productCount} />
        <Metric label="Low Stock" value={lowCount} emphasize={lowCount > 0} />
        <Metric label="Wastage Entries" value={wastage.length} />
      </div>
      <nav
        style={{
          display: "flex",
          gap: ".6rem",
          marginTop: "1.1rem",
          flexWrap: "wrap",
        }}
      >
        {["overview", "materials", "recipes", "production", "wastage"].map(
          (t) => (
            <button
              key={t}
              style={t === tab ? tabBtnActive : tabBtn}
              onClick={() => setTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          )
        )}
      </nav>
      {loading && <p style={{ marginTop: "1rem" }}>Loading...</p>}

      {/* Overview Tab */}
      {tab === "overview" && (
        <section style={{ marginTop: "1rem" }}>
          <div className="customer-info" style={{ padding: "1.2rem" }}>
            <h2 style={{ margin: "0 0 .6rem" }}>Inventory Overview</h2>
            <table className="customer">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Name</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th>Avg Cost / kg</th>
                  <th>Value (₹)</th>
                  <th>Wastage (kg)</th>
                </tr>
              </thead>
              <tbody>
                {overviewRows.map((r) => (
                  <tr key={r.key}>
                    <td>{r.type}</td>
                    <td style={{ textAlign: "left" }}>{r.name}</td>
                    <td>
                      {r.type === "Material"
                        ? (r.qty / 1000).toFixed(2)
                        : r.qty.toFixed(2)}
                    </td>
                    <td>{r.unit}</td>
                    <td>
                      {r.type === "Material"
                        ? (r.avgCost * 1000).toFixed(2)
                        : "-"}
                    </td>
                    <td>{r.type === "Material" ? r.value.toFixed(2) : "-"}</td>
                    <td>{r.wastage ? (r.wastage / 1000).toFixed(2) : "-"}</td>
                  </tr>
                ))}
                {!overviewRows.length && (
                  <tr>
                    <td colSpan={7}>No data</td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr style={{ background: "var(--color-light)" }}>
                  <td
                    colSpan={2}
                    style={{ textAlign: "right", fontWeight: 600 }}
                  >
                    Totals (Materials)
                  </td>
                  <td colSpan={2} style={{ fontWeight: 600 }}>
                    {(
                      materials.reduce(
                        (s, m) => s + (m.quantityGrams || 0),
                        0
                      ) / 1000
                    ).toFixed(2)}{" "}
                    kg
                  </td>
                  <td></td>
                  <td style={{ fontWeight: 600 }}>
                    ₹{totalMaterialValue.toFixed(2)}
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    {(totalMaterialWastage / 1000).toFixed(2)}
                  </td>
                </tr>
                <tr style={{ background: "var(--color-light)" }}>
                  <td
                    colSpan={2}
                    style={{ textAlign: "right", fontWeight: 600 }}
                  >
                    Totals (Products)
                  </td>
                  <td colSpan={2} style={{ fontWeight: 600 }}>
                    {products.reduce((s, p) => s + (p.stock || 0), 0)}
                  </td>
                  <td></td>
                  <td style={{ fontWeight: 600 }}>-</td>
                  <td style={{ fontWeight: 600 }}>
                    {totalProductWastage.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
            <p
              style={{
                fontSize: ".65rem",
                opacity: 0.7,
                marginTop: ".6rem",
                textAlign: "left",
              }}
            >
              Note: Product average cost & value not yet implemented; only raw
              material weighted average & value shown.
            </p>
          </div>
        </section>
      )}

      {/* Materials Tab */}
      {tab === "materials" && (
        <section style={{ marginTop: "1rem" }}>
          <div
            className="customer-info"
            style={{ padding: 0, boxShadow: "none", background: "transparent" }}
          >
            <div
              style={{
                display: "flex",
                gap: "1rem",
                flexWrap: "wrap",
                alignItems: "center",
                marginTop: 0,
              }}
            >
              <input
                placeholder="Search"
                value={matFilter}
                onChange={(e) => setMatFilter(e.target.value)}
                style={input}
              />
              <button style={btnSm} onClick={openAddMaterial}>
                Add Material
              </button>
            </div>
            <table className="customer" style={{ marginTop: "1rem" }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Qty (kg)</th>
                  <th>Reorder (kg)</th>
                  <th>GST %</th>
                  <th>Avg Cost / kg</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {matFiltered.map((m) => (
                  <tr
                    key={m.id}
                    style={
                      low.some((l) => l.id === m.id)
                        ? { background: "#fff2f2" }
                        : {}
                    }
                  >
                    <td>{m.name}</td>
                    <td>{((m.quantityGrams || 0) / 1000).toFixed(2)}</td>
                    <td>
                      {m.reorderLevelGrams
                        ? (m.reorderLevelGrams / 1000).toFixed(2)
                        : "-"}
                    </td>
                    <td>{m.gstRate || 0}</td>
                    <td>
                      {m.avgCostPerGram
                        ? (m.avgCostPerGram * 1000).toFixed(2)
                        : "-"}
                    </td>
                    <td>
                      <button style={btnXs} onClick={() => openEditMaterial(m)}>
                        Edit
                      </button>{" "}
                      <button
                        style={btnXsDanger}
                        onClick={() => deleteMaterialHandler(m)}
                      >
                        Del
                      </button>
                    </td>
                  </tr>
                ))}
                {!matFiltered.length && (
                  <tr>
                    <td colSpan={6}>No materials</td>
                  </tr>
                )}
              </tbody>
            </table>
            {lowCount > 0 && (
              <p
                style={{
                  color: "var(--color-danger)",
                  marginTop: ".5rem",
                  fontSize: ".7rem",
                  textAlign: "left",
                }}
              >
                Low stock: {low.map((l) => l.name).join(", ")}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Recipes Tab */}
      {tab === "recipes" && (
        <section style={{ marginTop: "1rem" }}>
          <div className="customer-info" style={{ padding: "1.2rem" }}>
            <h2 style={{ margin: 0 }}>Recipes</h2>
            <div
              style={{
                display: "flex",
                gap: "1rem",
                flexWrap: "wrap",
                alignItems: "center",
                marginTop: "1rem",
              }}
            >
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                style={input}
              >
                <option value="">Select Product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              {selectedProduct && (
                <button style={btnSm} onClick={addRecipeItem}>
                  Add Ingredient
                </button>
              )}
              {selectedProduct && !!recipe.length && (
                <button style={btnSm} onClick={saveRecipeHandler}>
                  Save Recipe
                </button>
              )}
            </div>
            {!selectedProduct && (
              <p
                style={{
                  marginTop: ".7rem",
                  fontSize: ".75rem",
                  textAlign: "left",
                }}
              >
                Select a product to edit its recipe.
              </p>
            )}
            {selectedProduct && (
              <table className="customer" style={{ marginTop: "1rem" }}>
                <thead>
                  <tr>
                    <th>Material</th>
                    <th>Grams / Unit</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {recipe.map((r, i) => (
                    <tr key={i}>
                      <td>
                        <select
                          value={r.rawMaterialId}
                          onChange={(e) =>
                            updateRecipeItem(i, "rawMaterialId", e.target.value)
                          }
                          style={input}
                        >
                          {materials.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          value={r.grams}
                          onChange={(e) =>
                            updateRecipeItem(i, "grams", e.target.value)
                          }
                          style={{ ...input, width: "140px" }}
                        />
                      </td>
                      <td>
                        <button
                          style={btnXsDanger}
                          onClick={() => removeRecipeItem(i)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!recipe.length && (
                    <tr>
                      <td
                        colSpan={3}
                        style={{ padding: ".6rem", textAlign: "center" }}
                      >
                        No ingredients.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </section>
      )}

      {/* Production Tab */}
      {tab === "production" && (
        <section style={{ marginTop: "1rem" }}>
          <div className="customer-info" style={{ padding: "1.2rem" }}>
            <h2 style={{ margin: 0 }}>Production</h2>
            <form
              onSubmit={produceHandler}
              style={{
                display: "flex",
                gap: "1rem",
                flexWrap: "wrap",
                marginTop: "1rem",
              }}
            >
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                style={input}
              >
                <option value="">Select Product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Units produced"
                value={produceForm.units}
                onChange={(e) =>
                  setProduceForm((f) => ({ ...f, units: e.target.value }))
                }
                style={input}
              />
              <input
                type="number"
                placeholder="Output mass (kg optional)"
                value={produceForm.outputMassGrams}
                onChange={(e) =>
                  setProduceForm((f) => ({
                    ...f,
                    // store internally still in grams for backend but user enters kg
                    outputMassGrams: e.target.value,
                  }))
                }
                style={input}
              />
              <button type="submit" style={btnSm}>
                Record Production
              </button>
            </form>
            {!!recipePreview.length && (
              <div style={{ marginTop: "1rem" }}>
                <h4 style={{ margin: "0 0 .4rem" }}>Consumption Preview</h4>
                <table className="customer">
                  <thead>
                    <tr>
                      <th>Material</th>
                      <th>Needed (kg)</th>
                      <th>Available (kg)</th>
                      <th>Remaining (kg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recipePreview.map((r) => (
                      <tr
                        key={r.rawMaterialId}
                        style={r.remaining < 0 ? { background: "#ffe8e8" } : {}}
                      >
                        <td>{r.name}</td>
                        <td>{(r.gramsNeeded / 1000).toFixed(3)}</td>
                        <td>{(r.available / 1000).toFixed(3)}</td>
                        <td>{(r.remaining / 1000).toFixed(3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {recipePreview.some((r) => r.remaining < 0) && (
                  <p
                    style={{
                      color: "var(--color-danger)",
                      fontSize: ".7rem",
                      marginTop: ".4rem",
                      textAlign: "left",
                    }}
                  >
                    Insufficient materials — adjust units or procure stock.
                  </p>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Wastage Tab */}
      {tab === "wastage" && (
        <section style={{ marginTop: "1rem" }}>
          <div className="customer-info" style={{ padding: "1.2rem" }}>
            <h2 style={{ margin: "0 0 .6rem" }}>
              Wastage / Spoilage
              <button
                style={{ ...btnSm, marginLeft: ".75rem" }}
                onClick={openWastageModal}
              >
                Record
              </button>
            </h2>
            <table className="customer">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Item</th>
                  <th>Reason</th>
                  <th>Delta (kg)</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {wastage.map((w) => {
                  const label = w.rawMaterialId
                    ? materials.find((m) => m.id === w.rawMaterialId)?.name ||
                      w.rawMaterialId
                    : products.find((p) => p.id === w.productId)?.name ||
                      w.productId;
                  return (
                    <tr key={w.id}>
                      <td>{new Date(w.createdAt).toLocaleDateString()}</td>
                      <td style={{ textAlign: "left" }}>{label}</td>
                      <td style={{ textTransform: "capitalize" }}>
                        {w.reason || "-"}
                      </td>
                      <td>{(w.deltaGrams / 1000).toFixed(3)}</td>
                      <td style={{ textAlign: "left" }}>
                        {w.note?.slice(0, 80)}
                      </td>
                    </tr>
                  );
                })}
                {!wastage.length && (
                  <tr>
                    <td colSpan={5}>No wastage recorded</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Material Modal */}
      {showMatModal && (
        <div style={modalBackdrop}>
          <div style={modalBox}>
            <h3 style={{ marginTop: 0 }}>
              {editingMat ? "Edit" : "Add"} Material
            </h3>
            <form
              onSubmit={saveMaterial}
              style={{ display: "grid", gap: ".7rem" }}
            >
              <input
                placeholder="Name"
                value={matForm.name}
                onChange={(e) =>
                  setMatForm((f) => ({ ...f, name: e.target.value }))
                }
                required
                style={input}
              />
              <select
                value={matForm.unit}
                onChange={(e) =>
                  setMatForm((f) => ({ ...f, unit: e.target.value }))
                }
                style={input}
              >
                <option value="g">g</option>
                <option value="kg">kg</option>
                <option value="ml">ml</option>
                <option value="l">l</option>
                <option value="pcs">pcs</option>
              </select>
              <input
                type="number"
                placeholder="Reorder level (g or pcs)"
                value={matForm.reorderLevel}
                onChange={(e) =>
                  setMatForm((f) => ({ ...f, reorderLevel: e.target.value }))
                }
                style={input}
              />
              <input
                type="number"
                placeholder="GST %"
                value={matForm.gstRate}
                onChange={(e) =>
                  setMatForm((f) => ({ ...f, gstRate: e.target.value }))
                }
                style={input}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: ".5rem",
                }}
              >
                <button
                  type="button"
                  style={btnXs}
                  onClick={() => setShowMatModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" style={btnSm}>
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Wastage Modal */}
      {wastageModalOpen && (
        <div style={modalBackdrop}>
          <div style={modalBox}>
            <h3 style={{ marginTop: 0 }}>Record Wastage</h3>
            <form
              onSubmit={saveWastage}
              style={{ display: "grid", gap: ".6rem" }}
            >
              <div style={{ fontSize: ".7rem", opacity: 0.75 }}>
                Choose either a material OR a product
              </div>
              <select
                value={wastageForm.rawMaterialId}
                onChange={(e) =>
                  setWastageForm((f) => ({
                    ...f,
                    rawMaterialId: e.target.value,
                    productId: "",
                  }))
                }
                style={input}
              >
                <option value="">-- Raw Material --</option>
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              <select
                value={wastageForm.productId}
                onChange={(e) =>
                  setWastageForm((f) => ({
                    ...f,
                    productId: e.target.value,
                    rawMaterialId: "",
                  }))
                }
                style={input}
              >
                <option value="">-- Product --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <div style={{ display: "flex", gap: ".6rem" }}>
                <input
                  type="number"
                  placeholder="Quantity"
                  value={wastageForm.quantity}
                  onChange={(e) =>
                    setWastageForm((f) => ({ ...f, quantity: e.target.value }))
                  }
                  required
                  style={{ ...input, flex: 1 }}
                />
                <select
                  value={wastageForm.unit}
                  onChange={(e) =>
                    setWastageForm((f) => ({ ...f, unit: e.target.value }))
                  }
                  style={{ ...input, width: 90 }}
                >
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                  <option value="ml">ml</option>
                  <option value="l">l</option>
                  <option value="pcs">pcs</option>
                </select>
              </div>
              <select
                value={wastageForm.reason}
                onChange={(e) =>
                  setWastageForm((f) => ({ ...f, reason: e.target.value }))
                }
                style={input}
              >
                <option value="damage">Damage</option>
                <option value="spoilage">Spoilage</option>
                <option value="expiry">Expiry</option>
                <option value="missing">Missing</option>
                <option value="other">Other</option>
              </select>
              <textarea
                placeholder="Notes (optional)"
                value={wastageForm.notes}
                onChange={(e) =>
                  setWastageForm((f) => ({ ...f, notes: e.target.value }))
                }
                style={{ ...input, minHeight: 70, resize: "vertical" }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: ".5rem",
                }}
              >
                <button
                  type="button"
                  style={btnXs}
                  onClick={() => setWastageModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={btnSm}
                  disabled={
                    !wastageForm.quantity ||
                    (!wastageForm.rawMaterialId && !wastageForm.productId)
                  }
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Styles
const input = {
  padding: "0.5rem 0.7rem",
  borderRadius: 6,
  background: "var(--color-light)",
  border: "1px solid transparent",
};
const btnSm = {
  background: "var(--color-primary)",
  color: "#fff",
  padding: "0.45rem 0.9rem",
  borderRadius: 6,
  cursor: "pointer",
  border: "none",
};
const btnXs = {
  background: "var(--color-light)",
  padding: "0.3rem 0.6rem",
  borderRadius: 6,
  cursor: "pointer",
  border: "none",
};
const btnXsDanger = {
  background: "var(--color-danger)",
  color: "#fff",
  padding: "0.3rem 0.6rem",
  borderRadius: 6,
  cursor: "pointer",
  border: "none",
};
const modalBackdrop = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};
const modalBox = {
  background: "var(--color-white)",
  padding: "1.2rem 1.3rem",
  borderRadius: 12,
  width: "min(440px,94%)",
  boxShadow: "0 4px 18px -2px rgba(0,0,0,.15)",
};
const th = {
  textAlign: "left",
  padding: ".5rem .6rem",
  background: "var(--color-light)",
  fontWeight: 600,
  fontSize: ".7rem",
};
const td = {
  padding: ".45rem .6rem",
  textAlign: "left",
  fontSize: ".75rem",
  borderTop: "1px solid rgba(0,0,0,.05)",
};
