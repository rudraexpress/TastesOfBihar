// Product API helper for dashboard
const API_URL = import.meta.env?.VITE_API_URL || "http://localhost:5000/api";

async function json(res) {
  if (!res.ok) throw new Error("API error");
  return res.json();
}

export async function listProducts() {
  const res = await fetch(`${API_URL}/products`);
  return json(res);
}

export async function getProduct(id) {
  const res = await fetch(`${API_URL}/products/${id}`);
  return json(res);
}

export async function createProduct(data) {
  const res = await fetch(`${API_URL}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return json(res);
}

export async function updateProduct(id, data) {
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return json(res);
}

export async function deleteProduct(id) {
  const res = await fetch(`${API_URL}/products/${id}`, { method: "DELETE" });
  return json(res);
}

export async function uploadImage(file) {
  const form = new FormData();
  form.append("image", file);
  const res = await fetch(`${API_URL}/products/upload`, {
    method: "POST",
    body: form,
  });
  return json(res);
}
