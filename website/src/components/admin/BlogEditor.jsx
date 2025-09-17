import React, { useState } from "react";

const BlogEditor = ({ onSave }) => {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [embeds, setEmbeds] = useState([""]);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [saving, setSaving] = useState(false);

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files || []);
    setMediaFiles(files);
  };

  const handleEmbedChange = (index, value) => {
    setEmbeds((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  const addEmbedField = () => setEmbeds((p) => [...p, ""]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("slug", slug);
      fd.append("summary", summary);
      fd.append("content", content);
      fd.append("embeds", JSON.stringify(embeds.filter(Boolean)));
      mediaFiles.forEach((f, i) => fd.append("media", f));

      const res = await fetch("/api/blogs", {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      const data = await res.json();
      if (onSave) onSave(data);
    } catch (err) {
      console.error(err);
      alert("Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white p-6 rounded-lg shadow"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Slug (optional)
        </label>
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Summary
        </label>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Content (HTML or Markdown)
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          className="mt-1 block w-full rounded-md border-gray-300"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Embed URLs / HTML (YouTube, Instagram, or raw embed)
        </label>
        {embeds.map((val, i) => (
          <input
            key={i}
            value={val}
            onChange={(e) => handleEmbedChange(i, e.target.value)}
            placeholder={
              i === 0
                ? "https://youtu.be/... or <iframe>...</iframe>"
                : "Add another embed..."
            }
            className="mt-1 block w-full rounded-md border-gray-300 mb-2"
          />
        ))}
        <button
          type="button"
          onClick={addEmbedField}
          className="text-sm text-yellow-900"
        >
          + Add another embed
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Media files (images or videos) — you can select multiple
        </label>
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleMediaChange}
          className="mt-1 block w-full"
        />
        {mediaFiles.length > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            {mediaFiles.length} file(s) selected
          </div>
        )}
      </div>

      <div className="flex items-center justify-end">
        <button
          disabled={saving}
          type="submit"
          className="px-4 py-2 bg-yellow-900 text-white rounded-md"
        >
          {saving ? "Saving…" : "Save post"}
        </button>
      </div>
    </form>
  );
};

export default BlogEditor;
