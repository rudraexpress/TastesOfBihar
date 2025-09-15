import React from "react";

export default function ProductInventoryTable({ products, wastageAgg }) {
  const totalProductWastage = products.reduce(
    (sum, p) => sum + (wastageAgg.product[p.id] || 0),
    0
  );

  const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);

  return (
    <div className="customer-info" style={{ padding: "1.2rem" }}>
      <h3 style={{ margin: "0 0 1rem", color: "var(--color-primary)" }}>
        Product Inventory
      </h3>
      <table className="customer">
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Stock (pcs)</th>
            <th>Stock Weight (kg)</th>
            <th>Wastage (pcs)</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td style={{ textAlign: "left" }}>{product.name}</td>
              <td>{(product.stock || 0).toFixed(0)}</td>
              <td>
                {product.stockGrams
                  ? (product.stockGrams / 1000).toFixed(2)
                  : "-"}
              </td>
              <td>
                {wastageAgg.product[product.id]
                  ? wastageAgg.product[product.id].toFixed(0)
                  : "0"}
              </td>
              <td>
                <span
                  style={{
                    padding: "0.2rem 0.5rem",
                    borderRadius: "4px",
                    fontSize: "0.7rem",
                    background:
                      (product.stock || 0) > 10
                        ? "#e8f5e8"
                        : (product.stock || 0) > 0
                        ? "#fff3cd"
                        : "#f8d7da",
                    color:
                      (product.stock || 0) > 10
                        ? "#155724"
                        : (product.stock || 0) > 0
                        ? "#856404"
                        : "#721c24",
                  }}
                >
                  {(product.stock || 0) > 10
                    ? "In Stock"
                    : (product.stock || 0) > 0
                    ? "Low Stock"
                    : "Out of Stock"}
                </span>
              </td>
            </tr>
          ))}
          {!products.length && (
            <tr>
              <td colSpan={5}>No products found</td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr style={{ background: "var(--color-light)" }}>
            <td style={{ textAlign: "right", fontWeight: 600 }}>Totals</td>
            <td style={{ fontWeight: 600 }}>{totalStock} pcs</td>
            <td style={{ fontWeight: 600 }}>-</td>
            <td style={{ fontWeight: 600 }}>
              {totalProductWastage.toFixed(0)}
            </td>
            <td></td>
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
        Note: Product costing and valuation features are being developed.
      </p>
    </div>
  );
}
