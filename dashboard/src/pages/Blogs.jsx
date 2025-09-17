import React, { useEffect, useMemo, useState } from "react";
import RichTextEditor from "../components/RichTextEditor.jsx";

// Small inline preview components for layout choices (with small variant)
const HeroPreview = ({ small = false }) =>
  small ? (
    <div
      style={{
        height: 90,
        width: "100%",
        background: "rgba(0,0,0,0.08)",
        borderRadius: 6,
      }}
    />
  ) : (
    <div style={{ padding: 12 }}>
      <div
        style={{ height: 140, background: "rgba(0,0,0,0.08)", borderRadius: 6 }}
      />
      <h4 style={{ margin: "12px 0 6px" }}>Hero layout</h4>
    </div>
  );

const MediaLeftPreview = ({ small = false }) =>
  small ? (
    <div
      style={{
        display: "flex",
        gap: 8,
        alignItems: "center",
        width: "100%",
        height: 90,
      }}
    >
      <div
        style={{
          width: 70,
          height: 54,
          background: "rgba(0,0,0,0.08)",
          borderRadius: 6,
        }}
      />
      <div style={{ flex: 1 }}>
        <div
          style={{
            height: 10,
            background: "rgba(0,0,0,0.08)",
            borderRadius: 4,
            marginBottom: 6,
            width: "70%",
          }}
        />
        <div
          style={{
            height: 10,
            background: "rgba(0,0,0,0.08)",
            borderRadius: 4,
            width: "50%",
          }}
        />
      </div>
    </div>
  ) : (
    <div
      style={{ display: "flex", gap: 12, alignItems: "center", padding: 12 }}
    >
      <div
        style={{
          width: 160,
          height: 100,
          background: "rgba(0,0,0,0.08)",
          borderRadius: 6,
        }}
      />
      <div>
        <h4 style={{ margin: "0 0 6px" }}>Media left</h4>
        <div
          style={{
            height: 10,
            background: "rgba(0,0,0,0.08)",
            borderRadius: 4,
            marginBottom: 6,
            width: 220,
          }}
        />
        <div
          style={{
            height: 10,
            background: "rgba(0,0,0,0.08)",
            borderRadius: 4,
            width: 160,
          }}
        />
      </div>
    </div>
  );

const GridPreview = ({ small = false }) =>
  small ? (
    <div style={{ padding: 8, width: "100%" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div
          style={{
            height: 46,
            background: "rgba(0,0,0,0.08)",
            borderRadius: 6,
          }}
        />
        <div
          style={{
            height: 46,
            background: "rgba(0,0,0,0.08)",
            borderRadius: 6,
          }}
        />
      </div>
    </div>
  ) : (
    <div style={{ padding: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div
          style={{
            height: 90,
            background: "rgba(0,0,0,0.08)",
            borderRadius: 6,
          }}
        />
        <div
          style={{
            height: 90,
            background: "rgba(0,0,0,0.08)",
            borderRadius: 6,
          }}
        />
      </div>
      <h4 style={{ margin: "12px 0 6px" }}>Grid</h4>
    </div>
  );

// Layout selection modal component
function LayoutSelectModal({
  open,
  onClose,
  layouts,
  selectedLayout,
  onSelect,
}) {
  if (!open) return null;
  const selected = layouts.find((l) => l.id === selectedLayout) || layouts[0];
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="layout-modal-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 12,
      }}
    >
      <div
        style={{
          background: "var(--color-white)",
          borderRadius: 16,
          padding: 24,
          width: "min(820px, 96vw)",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "var(--box-shadow)",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <h2 id="layout-modal-title" style={{ margin: 0 }}>
            Select Layout
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              cursor: "pointer",
              fontSize: "1.2rem",
              color: "var(--color-dark)",
            }}
          >
            ✕
          </button>
        </div>
        <div
          style={{
            marginBottom: 18,
            borderRadius: 8,
            background: "var(--color-light)",
            padding: 18,
          }}
        >
          <strong style={{ display: "block", marginBottom: 10 }}>
            {selected.label}
          </strong>
          <div
            style={{
              borderRadius: 8,
              overflow: "hidden",
              background: "var(--color-white)",
              padding: 12,
            }}
          >
            <selected.PreviewComponent small={false} />
          </div>
        </div>
        <div
          style={{
            display: "flex",
            overflowX: "auto",
            gap: 16,
            paddingBottom: 4,
          }}
        >
          {layouts.map((l) => {
            const isSelected = l.id === selectedLayout;
            return (
              <div
                key={l.id}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(l.id);
                  }
                }}
                onClick={() => onSelect(l.id)}
                style={{
                  width: 180,
                  flex: "0 0 auto",
                  border: "1px solid rgba(0,0,0,0.12)",
                  outline: isSelected
                    ? "2px solid var(--color-primary)"
                    : "2px solid transparent",
                  borderRadius: 10,
                  cursor: "pointer",
                  background: isSelected
                    ? "var(--color-primary-fade)"
                    : "var(--color-light)",
                  transition: "outline-color 120ms ease, box-shadow 120ms ease",
                }}
              >
                <div style={{ padding: 10 }}>
                  <div
                    style={{
                      height: 110,
                      borderRadius: 8,
                      background: "var(--color-white)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    <l.PreviewComponent small />
                  </div>
                  <div
                    style={{ textAlign: "center", marginTop: 8, fontSize: 13 }}
                  >
                    {l.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BlogsPage() {
  // Local state
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [modalOpen, setModalOpen] = useState(false);
  const [layoutModalOpen, setLayoutModalOpen] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState("hero");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [embeds, setEmbeds] = useState([]);
  const [mediaFiles, setMediaFiles] = useState([]);

  const layouts = useMemo(
    () => [
      { id: "hero", label: "Hero", PreviewComponent: HeroPreview },
      {
        id: "media-left",
        label: "Media Left",
        PreviewComponent: MediaLeftPreview,
      },
      { id: "grid", label: "Grid", PreviewComponent: GridPreview },
    ],
    []
  );

  // Optional: fetch posts (safe-guard against missing backend)
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/blogs");
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        if (!ignore) setPosts(Array.isArray(data) ? data : []);
      } catch (e) {
        // Silently ignore if backend isn't ready
        if (!ignore) setPosts([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  function handleDelete(id) {
    if (!window.confirm("Delete this post?")) return;
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  function handleMediaChange(e) {
    const files = Array.from(e.target.files || []);
    setMediaFiles(files);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      // Simulate save locally (replace with API later)
      const newPost = {
        id: Date.now(),
        title,
        slug:
          slug ||
          title
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, ""),
        layout: selectedLayout,
      };
      setPosts((prev) => [newPost, ...prev]);
      setModalOpen(false);
      // Reset form
      setTitle("");
      setSlug("");
      setSummary("");
      setContent("");
      setEmbeds([]);
      setMediaFiles([]);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div id="blogs-section">
      <h1>Blogs</h1>
      <div className="filter" style={{ marginTop: "1rem" }}>
        <div className="input">
          <input
            type="text"
            placeholder="Search posts"
            className="inputquerry"
          />
          <button
            onClick={(e) => {
              e.preventDefault();
              setModalOpen(true);
            }}
          >
            <span className="material-symbols-sharp">add</span>&nbsp;Add Post
          </button>
        </div>
      </div>
      <div className="customer-info" style={{ marginTop: "1.5rem" }}>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Slug</th>
              <th>Layout</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4}>Loading…</td>
              </tr>
            ) : posts.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  style={{ textAlign: "center", padding: "2rem" }}
                >
                  No posts yet.
                </td>
              </tr>
            ) : (
              posts.map((p) => (
                <tr key={p.id}>
                  <td style={{ textAlign: "left", maxWidth: "240px" }}>
                    {p.title}
                  </td>
                  <td>{p.slug}</td>
                  <td>{p.layout || "-"}</td>
                  <td>
                    <button
                      onClick={() => (window.location.href = `/blog/${p.slug}`)}
                      style={{ marginRight: 8 }}
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      style={{
                        background: "var(--color-danger)",
                        color: "white",
                        padding: "4px 8px",
                        borderRadius: 6,
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Blog modal */}
      {modalOpen && (
        <div
          id="dashboard-add-blog-form"
          className="product-modal"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "var(--color-white)",
              padding: "1.2rem",
              borderRadius: "1rem",
              width: "min(1200px, 98%)",
              maxHeight: "98vh",
              boxShadow: "var(--box-shadow)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.6rem",
              }}
            >
              <h2 style={{ margin: 0 }}>Create Post</h2>
              <button
                onClick={() => setModalOpen(false)}
                style={{
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: "1.2rem",
                  color: "var(--color-dark)",
                }}
              >
                ✕
              </button>
            </div>
            <div
              style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}
            >
              {/* Form column */}
              <form
                onSubmit={handleSave}
                style={{
                  display: "grid",
                  gap: "0.8rem",
                  flex: 1,
                  minWidth: 420,
                  maxHeight: "70vh",
                  overflowY: "auto",
                  paddingRight: 8,
                }}
              >
                <div>
                  <label
                    style={{
                      fontWeight: 600,
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    Title
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      padding: "0.6rem 0.9rem",
                      borderRadius: "8px",
                      background: "var(--color-light)",
                      color: "var(--color-dark)",
                      border: "2px solid transparent",
                    }}
                  />
                </div>
                <div style={{ display: "flex", gap: "0.6rem" }}>
                  <div style={{ flex: 1 }}>
                    <label
                      style={{
                        fontWeight: 600,
                        display: "block",
                        marginBottom: 6,
                      }}
                    >
                      Slug
                    </label>
                    <input
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.6rem 0.9rem",
                        borderRadius: "8px",
                        background: "var(--color-light)",
                        color: "var(--color-dark)",
                        border: "2px solid transparent",
                      }}
                    />
                  </div>
                  <div style={{ width: 220 }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: 8,
                        fontWeight: 600,
                      }}
                    >
                      Layout
                    </label>
                    <button
                      type="button"
                      onClick={() => setLayoutModalOpen(true)}
                      style={{
                        width: "100%",
                        padding: "0.5rem 0",
                        borderRadius: 8,
                        background: "var(--color-light)",
                        color: "var(--color-dark)",
                        border: "1px solid var(--color-light)",
                        cursor: "pointer",
                        marginBottom: 8,
                      }}
                    >
                      {layouts.find((l) => l.id === selectedLayout)?.label ||
                        "Choose layout"}
                    </button>
                    <div
                      style={{
                        marginTop: 8,
                        color: "var(--color-light)",
                        fontSize: 12,
                      }}
                    >
                      Pick a layout for how this post displays on the public
                      site.
                    </div>
                  </div>
                </div>
                <div>
                  <label
                    style={{
                      fontWeight: 600,
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    Summary
                  </label>
                  <textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "0.6rem 0.9rem",
                      borderRadius: "8px",
                      border: "2px solid transparent",
                      background: "var(--color-light)",
                      color: "var(--color-dark)",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontWeight: 600,
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    Content (WYSIWYG)
                  </label>
                  <div
                    style={{
                      marginTop: 6,
                      marginBottom: 6,
                      color: "var(--color-light)",
                      fontSize: 12,
                    }}
                  >
                    Use the editor for rich text — bold, italic and links. The
                    content is saved as HTML.
                  </div>
                  <RichTextEditor
                    value={content}
                    onChange={(html) => setContent(html)}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontWeight: 600,
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    Embeds (one per line)
                  </label>
                  <textarea
                    value={embeds.join("\n")}
                    onChange={(e) => setEmbeds(e.target.value.split("\n"))}
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "0.6rem 0.9rem",
                      borderRadius: "8px",
                      border: "2px solid transparent",
                      background: "var(--color-light)",
                      color: "var(--color-dark)",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontWeight: 600,
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    Media files
                  </label>
                  <div
                    style={{
                      display: "flex",
                      gap: "0.6rem",
                      alignItems: "center",
                    }}
                  >
                    <input
                      id="blog-media-input"
                      type="file"
                      multiple
                      onChange={handleMediaChange}
                      style={{ display: "none" }}
                    />
                    <label
                      htmlFor="blog-media-input"
                      style={{
                        padding: "0.6rem 1.2rem",
                        background: "var(--color-primary)",
                        color: "var(--color-white)",
                        borderRadius: "8px",
                        cursor: "pointer",
                      }}
                    >
                      Choose files
                    </label>
                    <div
                      style={{
                        color: "var(--color-light)",
                        fontSize: "0.9rem",
                      }}
                    >
                      {mediaFiles && mediaFiles.length
                        ? `${mediaFiles.length} file(s) selected`
                        : "No files selected"}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "0.6rem",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className=""
                    style={{
                      padding: "0.6rem 1.4rem",
                      background: "var(--color-light)",
                      color: "var(--color-dark)",
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
                    {saving ? "Saving..." : "Create post"}
                  </button>
                </div>
              </form>
              {/* Preview column */}
              <aside
                style={{
                  width: 300,
                  borderLeft: "1px solid rgba(0,0,0,0.06)",
                  paddingLeft: "1rem",
                  maxHeight: "70vh",
                  overflowY: "auto",
                }}
              >
                <h3 style={{ marginTop: 0, marginBottom: 12 }}>Preview</h3>
                <div
                  style={{
                    borderRadius: 8,
                    overflow: "hidden",
                    background: "var(--color-light)",
                    padding: 8,
                  }}
                >
                  {selectedLayout === "hero" && (
                    <div style={{ padding: 12 }}>
                      <div
                        style={{
                          height: 120,
                          background: "rgba(0,0,0,0.08)",
                          borderRadius: 6,
                        }}
                      />
                      <h4 style={{ margin: "12px 0 6px" }}>
                        {title || "Post title"}
                      </h4>
                      <div
                        style={{ color: "var(--color-light)", fontSize: 13 }}
                      >
                        {summary ||
                          (content
                            ? content.replace(/<[^>]+>/g, "").slice(0, 80) +
                              (content.length > 80 ? "…" : "")
                            : "Short summary of the post will appear here.")}
                      </div>
                    </div>
                  )}
                  {selectedLayout === "media-left" && (
                    <div style={{ display: "flex", gap: 8, padding: 12 }}>
                      <div
                        style={{
                          width: 120,
                          height: 80,
                          background: "rgba(0,0,0,0.08)",
                          borderRadius: 6,
                        }}
                      />
                      <div>
                        <h4 style={{ margin: "0 0 6px" }}>
                          {title || "Post title"}
                        </h4>
                        <div
                          style={{ color: "var(--color-light)", fontSize: 13 }}
                        >
                          {summary ||
                            (content
                              ? content.replace(/<[^>]+>/g, "").slice(0, 80) +
                                (content.length > 80 ? "…" : "")
                              : "Summary text")}
                        </div>
                      </div>
                    </div>
                  )}
                  {selectedLayout === "grid" && (
                    <div style={{ padding: 10 }}>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            height: 72,
                            background: "rgba(0,0,0,0.08)",
                            borderRadius: 6,
                          }}
                        />
                        <div
                          style={{
                            height: 72,
                            background: "rgba(0,0,0,0.08)",
                            borderRadius: 6,
                          }}
                        />
                      </div>
                      <h4 style={{ margin: "12px 0 6px" }}>
                        {title || "Post title"}
                      </h4>
                    </div>
                  )}
                </div>
                <div
                  style={{
                    marginTop: 10,
                    color: "var(--color-light)",
                    fontSize: 13,
                  }}
                >
                  This preview is a simplified representation. The actual post
                  will follow the selected layout on the website.
                </div>
              </aside>
            </div>
          </div>
        </div>
      )}

      {/* Layout selection modal */}
      <LayoutSelectModal
        open={layoutModalOpen}
        onClose={() => setLayoutModalOpen(false)}
        layouts={layouts}
        selectedLayout={selectedLayout}
        onSelect={(id) => {
          setSelectedLayout(id);
          setLayoutModalOpen(false);
        }}
      />
    </div>
  );
}

export default BlogsPage;
