import React from "react";

export default function IngredientsInventoryTable({
  materials,
  wastageAgg,
  lowStockItems,
}) {
  const totalMaterialValue = materials.reduce(
    (sum, m) => sum + (m.quantityGrams || 0) * (m.avgCostPerGram || 0),
    0
  );

  const totalMaterialWastage = materials.reduce(
    (sum, m) => sum + (wastageAgg.material[m.id] || 0),
    0
  );

  const totalQuantity = materials.reduce(
    (sum, m) => sum + (m.quantityGrams || 0),
    0
  );

  return (
    <div className="customer-info" style={{ padding: "1.2rem" }}>
      <h3 style={{ margin: "0 0 1rem", color: "var(--color-primary)" }}>
        Ingredients Inventory (Raw Materials)
      </h3>
      <table className="customer">
        <thead>
          <tr>
            <th>Ingredient Name</th>
            <th>Quantity (kg)</th>
            <th>Reorder Level (kg)</th>
            <th>Avg Cost / kg</th>
            <th>Value (₹)</th>
            <th>Wastage (kg)</th>
            <th>GST %</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {materials.map((material) => {
            const isLowStock = lowStockItems.some(
              (item) => item.id === material.id
            );
            return (
              <tr
                key={material.id}
                style={isLowStock ? { background: "#fff2f2" } : {}}
              >
                <td style={{ textAlign: "left" }}>{material.name}</td>
                <td>{((material.quantityGrams || 0) / 1000).toFixed(2)}</td>
                <td>
                  {material.reorderLevelGrams
                    ? (material.reorderLevelGrams / 1000).toFixed(2)
                    : "-"}
                </td>
                <td>
                  {material.avgCostPerGram
                    ? (material.avgCostPerGram * 1000).toFixed(2)
                    : "-"}
                </td>
                <td>
                  {(
                    (material.quantityGrams || 0) *
                    (material.avgCostPerGram || 0)
                  ).toFixed(2)}
                </td>
                <td>
                  {wastageAgg.material[material.id]
                    ? (wastageAgg.material[material.id] / 1000).toFixed(2)
                    : "0.00"}
                </td>
                <td>{material.gstRate || 0}%</td>
                <td>
                  <span
                    style={{
                      padding: "0.2rem 0.5rem",
                      borderRadius: "4px",
                      fontSize: "0.7rem",
                      background: isLowStock
                        ? "#f8d7da"
                        : (material.quantityGrams || 0) > 0
                        ? "#e8f5e8"
                        : "#f8d7da",
                      color: isLowStock
                        ? "#721c24"
                        : (material.quantityGrams || 0) > 0
                        ? "#155724"
                        : "#721c24",
                    }}
                  >
                    {isLowStock
                      ? "Low Stock"
                      : (material.quantityGrams || 0) > 0
                      ? "In Stock"
                      : "Out of Stock"}
                  </span>
                </td>
              </tr>
            );
          })}
          {!materials.length && (
            <tr>
              <td colSpan={8}>No ingredients found</td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr style={{ background: "var(--color-light)" }}>
            <td style={{ textAlign: "right", fontWeight: 600 }}>Totals</td>
            <td style={{ fontWeight: 600 }}>
              {(totalQuantity / 1000).toFixed(2)} kg
            </td>
            <td></td>
            <td></td>
            <td style={{ fontWeight: 600 }}>
              ₹{totalMaterialValue.toFixed(2)}
            </td>
            <td style={{ fontWeight: 600 }}>
              {(totalMaterialWastage / 1000).toFixed(2)}
            </td>
            <td></td>
            <td></td>
          </tr>
        </tfoot>
      </table>
      {lowStockItems.length > 0 && (
        <p
          style={{
            color: "var(--color-danger)",
            marginTop: ".5rem",
            fontSize: ".7rem",
            textAlign: "left",
          }}
        >
          Low stock ingredients:{" "}
          {lowStockItems.map((item) => item.name).join(", ")}
        </p>
      )}
      <p
        style={{
          fontSize: ".65rem",
          opacity: 0.7,
          marginTop: ".6rem",
          textAlign: "left",
        }}
      >
        Note: Quantities are tracked in grams for precision, displayed in
        kilograms for readability.
      </p>
    </div>
  );
}
