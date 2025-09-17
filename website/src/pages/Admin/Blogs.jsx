import React, { useEffect, useState } from "react";
import BlogEditor from "../../components/admin/BlogEditor";

const AdminBlogs = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    let mounted = true;
    fetch("/api/blogs", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => mounted && setPosts(data || []))
      .catch(() => mounted && setPosts([]));
    return () => (mounted = false);
  }, []);

  const handleSaved = (newPost) => {
    setPosts((p) => [newPost, ...p]);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-yellow-900 mb-6">Manage Blogs</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <BlogEditor onSave={handleSaved} />
        </div>
        <aside className="space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="font-semibold">Existing posts</h2>
            <ul className="mt-2 space-y-2">
              {posts.map((p) => (
                <li key={p.id || p.slug} className="text-sm text-gray-700">
                  {p.title}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="font-semibold">Tips</h2>
            <p className="text-sm text-gray-600">
              You can paste Instagram embed HTML into the Reel field to show
              customer reels.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AdminBlogs;
