# Inventory & Accounting Implementation Notes

## Models Added

- RawMaterial: Stores quantity in grams (or ml for liquids). Moving average cost maintained.
- ProductRecipe: Grams per product unit (mode per_unit only currently used).
- InventoryTransaction: Audit log of inventory changes (purchases, production consumption/output).
- Purchase: Raw material purchases with tax breakdown (SGST/CGST/IGST) and invoice file.
- Expense: Non-inventory expenses (advertising etc.) with tax breakdown.
- Product extended with stockGrams for produced mass tracking.

## Key Endpoints

- /api/inventory/materials (CRUD)
- /api/inventory/products/:productId/recipe (GET/POST replace)
- /api/inventory/produce (POST production run)
- /api/inventory/materials-low-stock (GET)
- /api/accounts/purchases (GET/POST multipart)
- /api/accounts/expenses (GET/POST multipart)

## Tax Handling (Updated)

Unified GST approach:

- Each RawMaterial can have a single `gstRate` (%).
- Purchases now submit `totalAmount` (inclusive of GST) and optional `gstRate` override.
- Server derives `baseAmount = total / (1 + rate/100)` and `gst = total - baseAmount`.
- Legacy fields (sgst, cgst, igst) retained as 0 for backward compatibility; use `gst` & `gstRate` going forward.

### Sales (Output GST)

Added `Sale` model capturing outward taxable supplies with:

- `total` (gross, tax inclusive)
- `baseAmount` (net of GST)
- `gst` (output GST portion)
- `gstRate`
- optional `productId`, `customerName`, `invoiceNumber`, `quantity`

Endpoint: `GET /api/sales`, `POST /api/sales`, and `GET /api/sales/summary` (aggregates count, base, gst, gross).

Input GST arises from Purchases/Expenses (their `gst` fields); Output GST from Sales. Net payable = Output GST - Input GST (not yet computed automatically—future enhancement could expose `/api/gst/summary`).

## Assumptions

1. Single tenant / no user scoping yet.
2. All raw material quantities stored in grams for solids and ml for liquids (treated equivalently). Conversions: kg->g, l->ml.
3. Recipe mode limited to per_unit use case; per_kg could be added later.
4. Negative inventory prevented in production route; no partial consumption logic.
5. No authentication/authorization checks added to new routes yet.
6. Unified GST rate sufficient; if intra/inter-state split needed later, can map unified gst into sgst/cgst or igst based on context.
7. Moving average cost updated only on purchase; production does not affect cost basis.

## Potential Next Steps

- Add authentication middleware to sensitive routes.
- Implement deletion constraints (cannot delete material with transactions).
- Add Product cost calculation endpoint deriving cost per unit from recipe + avg costs.
- Add date filtering & summary reporting endpoints (monthly totals, GST summary per rate).
- Add CSV export for purchases/expenses.
- Support adjustments (manual inventory corrections) with proper transaction logging.
- Implement pagination for large data sets.

## Alerts

Low stock determined by `quantityGrams <= reorderLevelGrams`.

## File Storage

Invoices saved in assets/invoices and served via /assets path already configured in server.js.
