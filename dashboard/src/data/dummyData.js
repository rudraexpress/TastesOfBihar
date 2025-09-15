// Dummy data removed. All API calls should use real backend endpoints.
// Centralized dummy data & helper functions for offline / no-backend mode.
// Now using realistic fixed data for full financial year
// Activate by running Vite with:  (PowerShell)
//   $env:VITE_USE_DUMMY="1"; npm run dev
// or create a .env file with VITE_USE_DUMMY=1

import {
  realisticData,
  dashboardSummary,
  BUSINESS_CONFIG,
} from "./realisticDummyData.js";

const today = new Date();
function daysAgo(n) {
  const d = new Date(today.getTime() - n * 86400000);
  return d.toISOString().slice(0, 10);
}

// Use realistic data for analytics
const daily = realisticData.current.daily.map((day) => ({
  date: day.date,
  revenue: day.revenue,
  orders: day.orders,
}));

// Get status counts from realistic orders
const recentOrders = realisticData.yearly.orders.filter((order) => {
  const orderDate = new Date(order.date);
  const cutoff = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  return orderDate >= cutoff;
});

const statusCounts = {
  pending: recentOrders.filter((o) => o.status === "pending").length,
  shipped: recentOrders.filter((o) => o.status === "shipped").length,
  delivered: recentOrders.filter((o) => o.status === "delivered").length,
};

// Use realistic calculated values
const totalRevenue = dashboardSummary.totalRevenue;
const totalOrders = dashboardSummary.totalOrders;
const revenueGrowth = dashboardSummary.revenueGrowth;

// Top customers from realistic data (last 30 days)
const topCustomers = realisticData.customers
  .map((customer) => {
    const customerOrders = recentOrders.filter(
      (o) => o.customerId === customer.id
    );
    const total = customerOrders.reduce((sum, order) => sum + order.total, 0);
    return {
      customerName: customer.name,
      total: total,
      location: customer.location,
      orderCount: customerOrders.length,
    };
  })
  .filter((c) => c.total > 0)
  .sort((a, b) => b.total - a.total);

// Low inventory from realistic raw materials
const lowInventory = realisticData.rawMaterials
  .filter((item) => item.currentStock <= item.minStock + 5)
  .map((item) => ({
    id: item.id,
    name: `${item.name} (${item.unit})`,
    stock: item.currentStock,
    minStock: item.minStock,
    pricePerUnit: item.pricePerUnit,
  }));

// Generate a stable growth rate for the session
// const sessionGrowthRate = 0.12 + Math.random() * 0.08; // 12% to 20% growth (REPLACED WITH REAL CALCULATION)

export const dummyAnalytics = {
  summary: {
    totalRevenue,
    revenueGrowth: revenueGrowth, // Now using realistic calculated growth
    totalOrders,
    avgOrder: totalRevenue / totalOrders,
    pending: statusCounts.pending,
    shipped: statusCounts.shipped,
    delivered: statusCounts.delivered,
    estimatedExpenses: dashboardSummary.estimatedExpenses,
    estimatedIncome: dashboardSummary.estimatedIncome,
    // Add timestamp so data appears "fresh"
    lastUpdated: new Date().toISOString(),
  },
  daily,
  statusDistribution: statusCounts,
  topCustomers: (limit = 5) => topCustomers.slice(0, limit),
  lowInventory: (/* threshold */) => lowInventory,
};

// ------------ Orders -------------
// Use realistic orders from the generated data
let _dummyOrders = realisticData.yearly.orders.slice(-50).map((order) => ({
  id: order.id,
  customerName: order.customerName,
  total: order.total,
  status: order.status,
  createdAt: order.createdAt,
  items: order.items,
  date: order.date,
}));

export const dummyOrdersApi = {
  list(status) {
    return Promise.resolve(
      _dummyOrders.filter((o) => (status ? o.status === status : true))
    );
  },
  update(id, nextStatus) {
    _dummyOrders = _dummyOrders.map((o) =>
      o.id === id ? { ...o, status: nextStatus } : o
    );
    return Promise.resolve(
      _dummyOrders.find((o) => o.id === id) || { id, status: nextStatus }
    );
  },
};

// ------------ Products -------------
// Use realistic Thekua products with updated costs including packaging and shipping
let _dummyProducts = realisticData.products.map((product) => ({
  id: product.id,
  name: product.name,
  price: product.price,
  rawMaterialCost: product.cost, // Raw material cost only
  packagingCost: product.packaging, // ₹30 per order
  shippingCost: product.shipping, // ₹100 or ₹200 based on weight
  totalCost: product.totalCost, // All costs combined
  margin: product.margin, // Updated margin after all costs
  marginPercent: product.marginPercent, // Updated margin percentage
  stock: Math.floor(50 + Math.random() * 200), // Random current stock
  sku: product.sku,
  weight: product.weight,
  category: "Traditional Sweets",
  description: `Authentic Bihar Thekua made with traditional recipe - ${
    product.weight * 1000
  }g pack. Includes packaging (₹${product.packaging}) and shipping (₹${
    product.shipping
  }).`,
}));

export const dummyProductsApi = {
  list: () => Promise.resolve(_dummyProducts),
  get: (id) => Promise.resolve(_dummyProducts.find((p) => p.id == id)),
  create: (data) => {
    const id = Math.max(..._dummyProducts.map((p) => p.id)) + 1;
    const prod = { id, ...data };
    _dummyProducts.push(prod);
    return Promise.resolve(prod);
  },
  update: (id, data) => {
    _dummyProducts = _dummyProducts.map((p) =>
      p.id == id ? { ...p, ...data } : p
    );
    return Promise.resolve(_dummyProducts.find((p) => p.id == id));
  },
  delete: (id) => {
    _dummyProducts = _dummyProducts.filter((p) => p.id != id);
    return Promise.resolve({ ok: true });
  },
};

// ------------ Raw Materials & Inventory -------------
export const dummyInventoryApi = {
  rawMaterials: () => Promise.resolve(realisticData.rawMaterials),
  products: () =>
    Promise.resolve(
      _dummyProducts.map((p) => ({
        id: p.id,
        name: p.name,
        currentStock: p.stock,
        reservedStock: Math.floor(p.stock * 0.1),
        availableStock: Math.floor(p.stock * 0.9),
        reorderLevel: 20,
        reorderQuantity: 100,
      }))
    ),
  updateStock: (id, quantity) => {
    const product = _dummyProducts.find((p) => p.id == id);
    if (product) {
      product.stock = Math.max(0, product.stock + quantity);
    }
    return Promise.resolve({ success: true, newStock: product?.stock || 0 });
  },
};

// ------------ Customers -------------
export const dummyCustomersApi = {
  list: () =>
    Promise.resolve(
      realisticData.customers.map((customer) => ({
        ...customer,
        totalOrders: realisticData.yearly.orders.filter(
          (o) => o.customerId === customer.id
        ).length,
        totalSpent: realisticData.yearly.orders
          .filter((o) => o.customerId === customer.id)
          .reduce((sum, order) => sum + order.total, 0),
        lastOrderDate:
          realisticData.yearly.orders
            .filter((o) => o.customerId === customer.id)
            .sort((a, b) => new Date(b.date) - new Date(a.date))[0]?.date ||
          null,
      }))
    ),
  get: (id) => Promise.resolve(realisticData.customers.find((c) => c.id == id)),
};

// ------------ Sales Analytics -------------
export const dummySalesApi = {
  monthly: () => Promise.resolve(realisticData.yearly.monthly),
  daily: (startDate, endDate) => {
    const filtered = realisticData.yearly.daily.filter((day) => {
      const date = new Date(day.date);
      const start = startDate ? new Date(startDate) : new Date("2024-04-01");
      const end = endDate ? new Date(endDate) : new Date();
      return date >= start && date <= end;
    });
    return Promise.resolve(filtered);
  },
  summary: () => Promise.resolve(realisticData.yearly.summary),
};

// ------------ Expenses & Accounts -------------
export const dummyAccountsApi = {
  expenses: () => Promise.resolve(realisticData.yearly.expenses),
  expensesByCategory: () => {
    const categories = {};
    realisticData.yearly.expenses.forEach((expense) => {
      if (!categories[expense.category]) {
        categories[expense.category] = 0;
      }
      categories[expense.category] += expense.amount;
    });
    return Promise.resolve(
      Object.entries(categories).map(([name, total]) => ({
        category: name,
        total,
      }))
    );
  },
  profitLoss: () => {
    const totalRevenue = realisticData.yearly.summary.totalRevenue;
    const totalExpenses = realisticData.yearly.summary.totalExpenses;
    const netProfit = totalRevenue - totalExpenses;
    const grossMargin =
      ((totalRevenue - totalRevenue * 0.16) / totalRevenue) * 100; // 16% COGS

    return Promise.resolve({
      revenue: totalRevenue,
      expenses: totalExpenses,
      netProfit,
      grossMargin,
      netMargin: (netProfit / totalRevenue) * 100,
    });
  },
};

export function isDummyMode() {
  const result = import.meta.env.VITE_USE_DUMMY === "1";
  console.log(
    "isDummyMode check - VITE_USE_DUMMY:",
    import.meta.env.VITE_USE_DUMMY,
    "result:",
    result
  );
  return result;
}
