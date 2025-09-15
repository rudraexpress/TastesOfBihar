import React, { useEffect, useState } from "react";
import {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
} from "../api/products";

// Reuse dashboard styling classes
export default function Products({ openSignal }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    imageUrl: "",
    localImage: "",
  });
  const [uploading, setUploading] = useState(false);

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    return (
      !q ||
      p.name?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    );
  });

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listProducts();
      setProducts(data);
    } catch (e) {
      setError(e.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // When openSignal changes (incremented), open add modal (fresh form)
  useEffect(() => {
    if (openSignal === undefined) return;
    if (openSignal > 0) {
      // open empty add form
      setEditing(null);
      setForm({
        name: "",
        description: "",
        price: "",
        stock: "",
        imageUrl: "",
        localImage: "",
      });
      setModalOpen(true);
    }
  }, [openSignal]);

  const openAdd = () => {
    setEditing(null);
    setForm({
      name: "",
      description: "",
      price: "",
      stock: "",
      imageUrl: "",
      localImage: "",
    });
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name || "",
      description: p.description || "",
      price: p.price || "",
      stock: p.stock || "",
      imageUrl: p.imageUrl || "",
      localImage: p.localImage || "",
    });
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price || 0),
        stock: parseInt(form.stock || 0, 10),
      };
      if (editing) await updateProduct(editing.id, payload);
      else await createProduct(payload);
      setModalOpen(false);
      await load();
    } catch (err) {
      alert(err.message || "Save failed");
    }
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete product: ${p.name}?`)) return;
    try {
      await deleteProduct(p.id);
      await load();
    } catch (err) {
      alert(err.message || "Delete failed");
    }
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const up = await uploadImage(file);
      setForm((f) => ({ ...f, imageUrl: up.url, localImage: up.filename }));
    } catch (err) {
      alert(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="product-admin">
      <h1>Products</h1>
      <div className="filter" style={{ marginTop: "1rem" }}>
        <div className="input">
          <input
            type="text"
            placeholder="Search products"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="inputquerry"
            style={{ minWidth: "220px" }}
          />
          <button onClick={openAdd}>
            <span className="material-symbols-sharp">add</span>&nbsp;Add Product
          </button>
        </div>
      </div>

      {loading && <p>Loading...</p>}
      {error && (
        <p className="danger" style={{ marginTop: "1rem" }}>
          {error}
        </p>
      )}

      <div className="customer-info" style={{ marginTop: "1.5rem" }}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Image</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td style={{ textAlign: "left", maxWidth: "220px" }}>
                  {p.name}
                </td>
                <td>₹{p.price}</td>
                <td>{p.stock}</td>
                <td>
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      style={{
                        width: "48px",
                        height: "48px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        margin: "0 auto",
                      }}
                    />
                  ) : (
                    "-"
                  )}
                </td>
                <td>
                  <button
                    onClick={() => openEdit(p)}
                    style={{
                      background: "var(--color-light)",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      marginRight: "6px",
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p)}
                    style={{
                      background: "var(--color-danger)",
                      color: "white",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!filtered.length && !loading && (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    textAlign: "center",
                    color: "var(--color-danger)",
                    fontWeight: "600",
                    padding: "2rem",
                  }}
                >
                  No database connected - 0 products
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div
          className="product-modal"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "var(--color-white)",
              padding: "2rem",
              borderRadius: "1rem",
              width: "min(640px, 92%)",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "var(--box-shadow)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <h2 style={{ margin: 0 }}>
                {editing ? "Edit Product" : "Add Product"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                style={{
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: "1.2rem",
                }}
              >
                ✕
              </button>
            </div>
            <form
              onSubmit={handleSubmit}
              className="product-form"
              style={{ display: "grid", gap: "1rem" }}
            >
              <div>
                <label>Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                />
              </div>
              <div>
                <label>Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>
              <div style={{ display: "flex", gap: "1rem" }}>
                <div style={{ flex: 1 }}>
                  <label>Price (₹)</label>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={handleChange}
                    required
                    style={inputStyle}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Stock</label>
                  <input
                    name="stock"
                    type="number"
                    value={form.stock}
                    onChange={handleChange}
                    required
                    style={inputStyle}
                  />
                </div>
              </div>
              <div>
                <label>Image URL</label>
                <input
                  name="imageUrl"
                  value={form.imageUrl}
                  onChange={handleChange}
                  placeholder="/assets/uploads/..."
                  style={inputStyle}
                />
              </div>
              <div>
                <label>Upload Image</label>
                <input type="file" accept="image/*" onChange={handleFile} />
                {uploading && (
                  <small className="text-muted">Uploading...</small>
                )}
                {form.imageUrl && (
                  <div style={{ marginTop: "0.5rem" }}>
                    <img
                      src={form.imageUrl}
                      alt="preview"
                      style={{
                        width: "120px",
                        height: "120px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                  </div>
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "0.8rem",
                  marginTop: "0.5rem",
                }}
              >
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{
                    background: "var(--color-light)",
                    padding: "0.6rem 1.4rem",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: "var(--color-primary)",
                    color: "white",
                    padding: "0.6rem 1.4rem",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  {editing ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "0.6rem 0.9rem",
  borderRadius: "8px",
  background: "var(--color-light)",
  color: "var(--color-dark)",
  border: "2px solid transparent",
};
