const API_URL = import.meta.env?.VITE_API_URL || "http://localhost:5000/api";
async function j(res) {
  if (!res.ok) throw new Error("API error");
  return res.json();
}

export async function listSales() {
  return j(await fetch(`${API_URL}/sales`));
}

export async function createSale(data) {
  const res = await fetch(`${API_URL}/sales`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return j(res);
}

export async function salesSummary(params = {}) {
  const q = new URLSearchParams(params).toString();
  return j(await fetch(`${API_URL}/sales/summary${q ? `?${q}` : ""}`));
}
