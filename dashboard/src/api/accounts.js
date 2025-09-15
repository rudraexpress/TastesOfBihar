const API_URL = import.meta.env?.VITE_API_URL || "http://localhost:5000/api";
async function j(res) {
  if (!res.ok) throw new Error("API error");
  return res.json();
}

export async function listPurchases() {
  return j(await fetch(`${API_URL}/accounts/purchases`));
}
export async function createPurchase(form) {
  const res = await fetch(`${API_URL}/accounts/purchases`, {
    method: "POST",
    body: form,
  });
  return j(res);
}

export async function listExpenses() {
  return j(await fetch(`${API_URL}/accounts/expenses`));
}
export async function createExpense(form) {
  const res = await fetch(`${API_URL}/accounts/expenses`, {
    method: "POST",
    body: form,
  });
  return j(res);
}

export async function accountsSummary() {
  return j(await fetch(`${API_URL}/accounts/summary`));
}

export async function balanceSheet(params = {}) {
  const qs = new URLSearchParams();
  if (params.start) qs.set("start", params.start);
  if (params.end) qs.set("end", params.end);
  const url = `${API_URL}/accounts/balance-sheet${
    qs.toString() ? `?${qs.toString()}` : ""
  }`;
  return j(await fetch(url));
}

export async function profitLoss(params = {}) {
  const qs = new URLSearchParams();
  if (params.start) qs.set("start", params.start);
  if (params.end) qs.set("end", params.end);
  const url = `${API_URL}/accounts/profit-loss${
    qs.toString() ? `?${qs.toString()}` : ""
  }`;
  return j(await fetch(url));
}

export async function exportAccounts(type) {
  const res = await fetch(
    `${API_URL}/accounts/export?type=${encodeURIComponent(type)}`
  );
  if (!res.ok) throw new Error("Export failed");
  const blob = await res.blob();
  return blob; // caller will download
}
