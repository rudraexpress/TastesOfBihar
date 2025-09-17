import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Blogs = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetch("/api/blogs")
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        setPosts(data || []);
      })
      .catch(() => setPosts([]))
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, []);

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto text-center mb-8">
        <h1 className="text-3xl font-extrabold text-yellow-900">Our Blog</h1>
        <p className="text-gray-600 mt-2">
          Latest updates, recipes and product news.
        </p>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading posts…</p>
      ) : posts.length === 0 ? (
        <p className="text-center text-gray-500">No posts yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((p) => (
            <article
              key={p.id || p.slug}
              className="bg-white rounded-2xl shadow p-4"
            >
              {p.coverImage ? (
                <img
                  src={p.coverImage}
                  alt={p.title}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
              ) : null}
              <h2 className="text-lg font-semibold text-yellow-900">
                {p.title}
              </h2>
              <p className="text-sm text-gray-600 mt-2">{p.summary}</p>
              <div className="mt-4">
                <Link
                  to={`/blog/${p.slug || p.id}`}
                  className="inline-block text-yellow-900 font-medium hover:underline"
                >
                  Read post →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default Blogs;
