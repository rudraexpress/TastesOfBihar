// Dummy data removed. All data should come from backend/database.
// Realistic Fixed Dummy Data for Taste of Bihar - Full Financial Year
// Based on actual Thekua business parameters and recipe costs

// ============= BUSINESS MODEL =============
export const BUSINESS_CONFIG = {
  // Raw material costs (Rs per unit)
  rawMaterials: {
    maida: { price: 60, unit: "kg" },
    cinnamon: { price: 4000, unit: "kg" },
    ghee: { price: 740, unit: "kg" },
    suji: { price: 80, unit: "kg" },
    coconut: { price: 300, unit: "kg" },
    refinedOil: { price: 170, unit: "L" },
    sugar: { price: 45, unit: "kg" },
  },

  // Recipe for 5kg Thekua production
  recipe: {
    maida: 2.5, // kg
    suji: 0.75, // kg
    coconut: 0.4, // kg
    sugar: 1.5, // kg
    refinedOil: 1, // L
    ghee: 0.3, // kg
    yields: 5, // kg of Thekua
  },

  // Operational costs
  operations: {
    packaging: 30, // Rs per order (up to 500g)
    shippingSmall: 100, // Rs per order (up to 500g)
    shippingLarge: 200, // Rs per order (above 500g)
    laborPerKg: 25, // Rs per kg for production labor
    utilitiesPerKg: 15, // Rs per kg for utilities
  },

  // Product variants
  products: {
    "thekua-250g": {
      id: 1,
      name: "Thekua — Coconut Magic 250g",
      weight: 0.25,
      price: 299,
      cost: 39.48, // Rs (raw materials only)
      packaging: 30, // Rs
      shipping: 100, // Rs (standard shipping)
      totalCost: 169.48, // Raw materials + packaging + shipping
      margin: 129.52, // Rs (299 - 169.48)
      marginPercent: 43.3, // Updated margin percentage
      sku: "TH-CM-250",
    },
    "thekua-500g": {
      id: 2,
      name: "Thekua — Coconut Magic 500g",
      weight: 0.5,
      price: 499,
      cost: 78.95, // Rs (raw materials only)
      packaging: 30, // Rs
      shipping: 100, // Rs (up to 500g uses standard shipping)
      totalCost: 208.95, // Raw materials + packaging + shipping
      margin: 290.05, // Rs (499 - 208.95)
      marginPercent: 58.1, // Updated margin percentage
      sku: "TH-CM-500",
    },
  },
};

// ============= DATE UTILITIES =============
const today = new Date("2025-09-15"); // Fixed reference date
const startOfYear = new Date("2024-04-01"); // Financial year start (Apr 1, 2024)
const endOfYear = new Date("2025-03-31"); // Financial year end (Mar 31, 2025)

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function getMonthName(date) {
  return date.toLocaleDateString("en-IN", { month: "long" });
}

// ============= SEASONAL PATTERNS =============
// Bihar festivals and seasons affecting sales
const SEASONAL_FACTORS = {
  // Month-wise multipliers for base sales
  monthly: {
    April: 1.0, // Start of FY
    May: 0.9, // Summer heat
    June: 0.8, // Very hot
    July: 1.1, // Monsoon festivals
    August: 1.3, // Raksha Bandhan, Krishna Janmashtami
    September: 1.2, // Ganesh Chaturthi
    October: 1.5, // Durga Puja, Diwali season
    November: 1.6, // Diwali, Kali Puja, Bhai Dooj
    December: 1.4, // Winter wedding season
    January: 1.2, // Makar Sankranti
    February: 1.1, // Saraswati Puja
    March: 1.0, // End of FY
  },

  // Special festival days with extra boost
  festivals: [
    { date: "2024-08-19", name: "Raksha Bandhan", boost: 2.0 },
    { date: "2024-08-26", name: "Krishna Janmashtami", boost: 1.8 },
    { date: "2024-10-11", name: "Durga Puja Start", boost: 2.2 },
    { date: "2024-11-01", name: "Diwali", boost: 3.0 },
    { date: "2024-11-03", name: "Bhai Dooj", boost: 1.9 },
    { date: "2025-01-14", name: "Makar Sankranti", boost: 1.7 },
    { date: "2025-02-22", name: "Saraswati Puja", boost: 1.6 },
  ],
};

// ============= CUSTOMER PROFILES =============
const CUSTOMERS = [
  {
    id: 1,
    name: "Sunita Devi",
    location: "Patna",
    type: "regular",
    preferredProduct: "thekua-500g",
    avgOrderFreq: 15, // days
    avgOrderValue: 1200,
    loyalty: 0.9,
  },
  {
    id: 2,
    name: "Rakesh Kumar",
    location: "Muzaffarpur",
    type: "bulk",
    preferredProduct: "both",
    avgOrderFreq: 7,
    avgOrderValue: 2500,
    loyalty: 0.85,
  },
  {
    id: 3,
    name: "Priya Singh",
    location: "Darbhanga",
    type: "festival",
    preferredProduct: "thekua-250g",
    avgOrderFreq: 30,
    avgOrderValue: 800,
    loyalty: 0.7,
  },
  {
    id: 4,
    name: "Geeta Sharma",
    location: "Gaya",
    type: "regular",
    preferredProduct: "thekua-500g",
    avgOrderFreq: 12,
    avgOrderValue: 1500,
    loyalty: 0.8,
  },
  {
    id: 5,
    name: "Anil Verma",
    location: "Bhagalpur",
    type: "occasional",
    preferredProduct: "thekua-250g",
    avgOrderFreq: 45,
    avgOrderValue: 600,
    loyalty: 0.6,
  },
  {
    id: 6,
    name: "Vikram Patel",
    location: "Purnia",
    type: "regular",
    preferredProduct: "both",
    avgOrderFreq: 20,
    avgOrderValue: 1000,
    loyalty: 0.75,
  },
  {
    id: 7,
    name: "Meera Jha",
    location: "Sitamarhi",
    type: "bulk",
    preferredProduct: "thekua-500g",
    avgOrderFreq: 10,
    avgOrderValue: 2000,
    loyalty: 0.9,
  },
  {
    id: 8,
    name: "Ramesh Yadav",
    location: "Saharsa",
    type: "festival",
    preferredProduct: "both",
    avgOrderFreq: 35,
    avgOrderValue: 1200,
    loyalty: 0.65,
  },
];

// ============= GENERATE YEARLY DATA =============
function generateYearlyData() {
  const dailyData = [];
  const monthlyData = [];
  const orders = [];
  const expenses = [];
  let orderIdCounter = 1001;
  let currentStock = {
    "thekua-250g": 500,
    "thekua-500g": 300,
    rawMaterials: {
      maida: 100,
      suji: 50,
      coconut: 80,
      sugar: 75,
      refinedOil: 30,
      ghee: 25,
    },
  };

  // Generate daily data for the financial year
  let currentDate = new Date(startOfYear);

  while (currentDate <= endOfYear) {
    const monthName = getMonthName(currentDate);
    const seasonalMultiplier = SEASONAL_FACTORS.monthly[monthName] || 1.0;

    // Check for festival boost
    const dateStr = formatDate(currentDate);
    const festival = SEASONAL_FACTORS.festivals.find((f) => f.date === dateStr);
    const festivalBoost = festival ? festival.boost : 1.0;

    // Base daily sales (growing over the year)
    const dayOfYear = Math.floor(
      (currentDate - startOfYear) / (1000 * 60 * 60 * 24)
    );
    const growthFactor = 1 + (dayOfYear / 365) * 0.25; // 25% annual growth

    const baseDailySales = 8; // Base 8 orders per day
    const dailyOrders = Math.round(
      baseDailySales * seasonalMultiplier * festivalBoost * growthFactor
    );

    let dailyRevenue = 0;
    let dailyOrdersCount = 0;

    // Generate orders for this day
    for (let i = 0; i < dailyOrders; i++) {
      // Select random customer weighted by loyalty
      const customer = CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)];

      // Determine products in order
      const orderItems = [];
      let orderTotal = 0;
      let totalWeight = 0; // Track total weight for shipping calculation

      if (customer.preferredProduct === "both" || Math.random() < 0.3) {
        // Mix of both products
        const qty250 = Math.ceil(Math.random() * 3);
        const qty500 = Math.ceil(Math.random() * 2);

        orderItems.push({
          productId: 1,
          name: BUSINESS_CONFIG.products["thekua-250g"].name,
          quantity: qty250,
          weight: BUSINESS_CONFIG.products["thekua-250g"].weight,
          price: BUSINESS_CONFIG.products["thekua-250g"].price,
          total: qty250 * BUSINESS_CONFIG.products["thekua-250g"].price,
        });

        orderItems.push({
          productId: 2,
          name: BUSINESS_CONFIG.products["thekua-500g"].name,
          quantity: qty500,
          weight: BUSINESS_CONFIG.products["thekua-500g"].weight,
          price: BUSINESS_CONFIG.products["thekua-500g"].price,
          total: qty500 * BUSINESS_CONFIG.products["thekua-500g"].price,
        });

        totalWeight = qty250 * 0.25 + qty500 * 0.5;
        orderTotal = orderItems.reduce((sum, item) => sum + item.total, 0);
      } else if (customer.preferredProduct === "thekua-500g") {
        const qty = Math.ceil(Math.random() * 4);
        orderItems.push({
          productId: 2,
          name: BUSINESS_CONFIG.products["thekua-500g"].name,
          quantity: qty,
          weight: BUSINESS_CONFIG.products["thekua-500g"].weight,
          price: BUSINESS_CONFIG.products["thekua-500g"].price,
          total: qty * BUSINESS_CONFIG.products["thekua-500g"].price,
        });
        totalWeight = qty * 0.5;
        orderTotal = orderItems[0].total;
      } else {
        const qty = Math.ceil(Math.random() * 5);
        orderItems.push({
          productId: 1,
          name: BUSINESS_CONFIG.products["thekua-250g"].name,
          quantity: qty,
          weight: BUSINESS_CONFIG.products["thekua-250g"].weight,
          price: BUSINESS_CONFIG.products["thekua-250g"].price,
          total: qty * BUSINESS_CONFIG.products["thekua-250g"].price,
        });
        totalWeight = qty * 0.25;
        orderTotal = orderItems[0].total;
      }

      // Calculate shipping and packaging costs
      const packagingCost = BUSINESS_CONFIG.operations.packaging; // ₹30 per order
      const shippingCost =
        totalWeight > 0.5
          ? BUSINESS_CONFIG.operations.shippingLarge // ₹200 for >500g
          : BUSINESS_CONFIG.operations.shippingSmall; // ₹100 for ≤500g

      const finalOrderTotal = orderTotal + packagingCost + shippingCost;

      // Determine order status
      let status = "delivered";
      if (currentDate > addDays(today, -7))
        status = Math.random() < 0.3 ? "pending" : "shipped";
      if (currentDate > addDays(today, -3))
        status = Math.random() < 0.5 ? "pending" : "shipped";
      if (currentDate > today) status = "pending";

      // Create order with shipping and packaging details
      orders.push({
        id: orderIdCounter++,
        customerId: customer.id,
        customerName: customer.name,
        items: orderItems,
        subtotal: orderTotal,
        packagingCost: packagingCost,
        shippingCost: shippingCost,
        total: finalOrderTotal,
        totalWeight: totalWeight,
        status: status,
        date: formatDate(currentDate),
        createdAt: currentDate.toISOString(),
      });

      dailyRevenue += finalOrderTotal;
      dailyOrdersCount++;
    }

    // Calculate daily expenses based on actual order composition
    let dailyRawMaterialCost = 0;
    let dailyPackagingCost = 0;
    let dailyShippingCost = 0;
    let dailyOperationalCost = 0;

    // Calculate costs from today's orders
    const todaysOrders = orders.filter(
      (order) => order.date === formatDate(currentDate)
    );
    todaysOrders.forEach((order) => {
      // Raw material costs based on items
      order.items.forEach((item) => {
        const productKey = item.productId === 1 ? "thekua-250g" : "thekua-500g";
        const rawMaterialCostPerUnit =
          BUSINESS_CONFIG.products[productKey].cost;
        dailyRawMaterialCost += rawMaterialCostPerUnit * item.quantity;
      });

      // Packaging and shipping costs (already calculated per order)
      dailyPackagingCost += order.packagingCost;
      dailyShippingCost += order.shippingCost;
    });

    // Operational costs (labor, utilities, rent, etc.)
    dailyOperationalCost = dailyRevenue * 0.08; // 8% for other operational expenses

    const dailyTotalExpenses =
      dailyRawMaterialCost +
      dailyPackagingCost +
      dailyShippingCost +
      dailyOperationalCost;

    // Store daily data with detailed cost breakdown
    dailyData.push({
      date: formatDate(currentDate),
      revenue: dailyRevenue,
      orders: dailyOrdersCount,
      expenses: dailyTotalExpenses,
      rawMaterialCost: dailyRawMaterialCost,
      packagingCost: dailyPackagingCost,
      shippingCost: dailyShippingCost,
      operationalCost: dailyOperationalCost,
      profit: dailyRevenue - dailyTotalExpenses,
      festival: festival ? festival.name : null,
    });

    // Add detailed expense records
    if (dailyRawMaterialCost > 0) {
      expenses.push({
        id: expenses.length + 1,
        date: formatDate(currentDate),
        category: "Raw Materials",
        amount: dailyRawMaterialCost,
        description: "Daily raw material costs (Maida, Ghee, Coconut, etc.)",
      });
    }

    if (dailyPackagingCost > 0) {
      expenses.push({
        id: expenses.length + 1,
        date: formatDate(currentDate),
        category: "Packaging",
        amount: dailyPackagingCost,
        description: "Daily packaging costs",
      });
    }

    if (dailyShippingCost > 0) {
      expenses.push({
        id: expenses.length + 1,
        date: formatDate(currentDate),
        category: "Shipping",
        amount: dailyShippingCost,
        description: "Daily shipping and delivery costs",
      });
    }

    if (dailyOperationalCost > 0) {
      expenses.push({
        id: expenses.length + 1,
        date: formatDate(currentDate),
        category: "Operations",
        amount: dailyOperationalCost,
        description: "Daily operational expenses (labor, utilities, rent)",
      });
    }

    currentDate = addDays(currentDate, 1);
  }

  // Generate monthly summaries
  const months = {};
  dailyData.forEach((day) => {
    const month = day.date.substring(0, 7); // YYYY-MM
    if (!months[month]) {
      months[month] = {
        month,
        revenue: 0,
        orders: 0,
        expenses: 0,
        profit: 0,
        days: 0,
      };
    }
    months[month].revenue += day.revenue;
    months[month].orders += day.orders;
    months[month].expenses += day.expenses;
    months[month].profit += day.profit;
    months[month].days++;
  });

  Object.values(months).forEach((month) => {
    monthlyData.push(month);
  });

  return { dailyData, monthlyData, orders, expenses };
}

// Generate the data
const yearlyData = generateYearlyData();

// ============= EXPORTS =============
export const realisticData = {
  // Current period (last 30 days) for dashboard
  current: {
    daily: yearlyData.dailyData.slice(-30),
    summary: {
      totalRevenue: yearlyData.dailyData
        .slice(-30)
        .reduce((sum, day) => sum + day.revenue, 0),
      totalOrders: yearlyData.dailyData
        .slice(-30)
        .reduce((sum, day) => sum + day.orders, 0),
      totalExpenses: yearlyData.dailyData
        .slice(-30)
        .reduce((sum, day) => sum + day.expenses, 0),
      totalProfit: yearlyData.dailyData
        .slice(-30)
        .reduce((sum, day) => sum + day.profit, 0),
      avgDailyRevenue:
        yearlyData.dailyData
          .slice(-30)
          .reduce((sum, day) => sum + day.revenue, 0) / 30,
      avgDailyOrders:
        yearlyData.dailyData
          .slice(-30)
          .reduce((sum, day) => sum + day.orders, 0) / 30,
    },
  },

  // Full year data
  yearly: {
    daily: yearlyData.dailyData,
    monthly: yearlyData.monthlyData,
    orders: yearlyData.orders,
    expenses: yearlyData.expenses,
    summary: {
      totalRevenue: yearlyData.dailyData.reduce(
        (sum, day) => sum + day.revenue,
        0
      ),
      totalOrders: yearlyData.dailyData.reduce(
        (sum, day) => sum + day.orders,
        0
      ),
      totalExpenses: yearlyData.dailyData.reduce(
        (sum, day) => sum + day.expenses,
        0
      ),
      totalProfit: yearlyData.dailyData.reduce(
        (sum, day) => sum + day.profit,
        0
      ),
    },
  },

  // Products
  products: Object.values(BUSINESS_CONFIG.products),

  // Customers
  customers: CUSTOMERS,

  // Raw materials inventory
  rawMaterials: Object.entries(BUSINESS_CONFIG.rawMaterials).map(
    ([name, data], index) => ({
      id: index + 1,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      currentStock: Math.floor(20 + Math.random() * 50),
      minStock: 10,
      maxStock: 100,
      unit: data.unit,
      pricePerUnit: data.price,
      supplier: "Local Supplier",
      lastOrdered: formatDate(addDays(today, -Math.floor(Math.random() * 30))),
    })
  ),
};

// Calculate growth rates for dashboard
const last7Days = yearlyData.dailyData.slice(-7);
const previous7Days = yearlyData.dailyData.slice(-14, -7);

const last7DaysRevenue = last7Days.reduce((sum, day) => sum + day.revenue, 0);
const previous7DaysRevenue = previous7Days.reduce(
  (sum, day) => sum + day.revenue,
  0
);

export const dashboardSummary = {
  totalRevenue: realisticData.current.summary.totalRevenue,
  revenueGrowth:
    previous7DaysRevenue > 0
      ? ((last7DaysRevenue - previous7DaysRevenue) / previous7DaysRevenue) * 100
      : 0,
  totalOrders: realisticData.current.summary.totalOrders,
  avgOrder:
    realisticData.current.summary.totalRevenue /
    realisticData.current.summary.totalOrders,
  estimatedExpenses: realisticData.current.summary.totalExpenses,
  estimatedIncome: realisticData.current.summary.totalProfit,
  pending: yearlyData.orders.filter((o) => o.status === "pending").length,
  shipped: yearlyData.orders.filter((o) => o.status === "shipped").length,
  delivered: yearlyData.orders.filter((o) => o.status === "delivered").length,
  lastUpdated: new Date().toISOString(),
};

console.log("Realistic dummy data generated for Taste of Bihar");
console.log("Financial Year: Apr 2024 - Mar 2025");
console.log(
  "Total Revenue:",
  realisticData.yearly.summary.totalRevenue.toFixed(2)
);
console.log("Total Orders:", realisticData.yearly.summary.totalOrders);
console.log("7-day Growth:", dashboardSummary.revenueGrowth.toFixed(1) + "%");
