const API_URL = import.meta.env?.VITE_API_URL || "http://localhost:5000/api";

async function j(res) {
  if (!res.ok) throw new Error("API error");
  return res.json();
}

export async function listMaterials() {
  return j(await fetch(`${API_URL}/inventory/materials`));
}
export async function createMaterial(data) {
  return j(
    await fetch(`${API_URL}/inventory/materials`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
  );
}
export async function updateMaterial(id, data) {
  return j(
    await fetch(`${API_URL}/inventory/materials/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
  );
}
export async function deleteMaterial(id) {
  return j(
    await fetch(`${API_URL}/inventory/materials/${id}`, { method: "DELETE" })
  );
}

export async function getRecipe(productId) {
  return j(await fetch(`${API_URL}/inventory/products/${productId}/recipe`));
}
export async function saveRecipe(productId, items) {
  return j(
    await fetch(`${API_URL}/inventory/products/${productId}/recipe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    })
  );
}

export async function produce(body) {
  return j(
    await fetch(`${API_URL}/inventory/produce`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
  );
}

export async function lowStock() {
  return j(await fetch(`${API_URL}/inventory/materials-low-stock`));
}

export async function listWastage() {
  return j(await fetch(`${API_URL}/inventory/wastage`));
}

export async function recordWastage(data) {
  return j(
    await fetch(`${API_URL}/inventory/wastage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
  );
}
