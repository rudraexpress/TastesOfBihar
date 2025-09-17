import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetch(`/api/blogs/${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((data) => mounted && setPost(data))
      .catch(() => mounted && setPost(null))
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, [slug]);

  if (loading) return <p className="p-8 text-center">Loading…</p>;
  if (!post) return <p className="p-8 text-center">Post not found.</p>;

  const renderEmbed = (embed) => {
    if (!embed) return null;
    // If it's raw HTML (starts with <), render directly
    if (embed.trim().startsWith("<")) {
      return <div dangerouslySetInnerHTML={{ __html: embed }} />;
    }

    // If it's a YouTube link, convert to iframe
    try {
      const url = new URL(embed);
      if (
        url.hostname.includes("youtube.com") ||
        url.hostname.includes("youtu.be")
      ) {
        let videoId = null;
        if (url.hostname.includes("youtu.be")) {
          videoId = url.pathname.slice(1);
        } else {
          videoId = url.searchParams.get("v");
        }
        if (videoId) {
          return (
            <div className="aspect-w-16 aspect-h-9">
              <iframe
                title={videoId}
                src={`https://www.youtube.com/embed/${videoId}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full rounded-lg"
              />
            </div>
          );
        }
      }
    } catch (err) {
      // ignore URL parse errors
    }

    // Fallback: render as link
    return (
      <p>
        <a
          href={embed}
          target="_blank"
          rel="noreferrer"
          className="text-yellow-900 hover:underline"
        >
          {embed}
        </a>
      </p>
    );
  };

  return (
    <article className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-extrabold text-yellow-900 mb-4">
        {post.title}
      </h1>
      {post.coverImage ? (
        <img
          src={post.coverImage}
          alt={post.title}
          className="w-full rounded-lg mb-6"
        />
      ) : null}

      {/* Render content as HTML (assumes sanitized on server or admin paste) */}
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content || post.summary || "" }}
      />

      {/* Render media array if present */}
      {post.media && post.media.length > 0 && (
        <div className="mt-6 space-y-4">
          {post.media.map((m, i) => (
            <div key={i}>
              {/* Infer type by extension */}
              {/(mp4|webm|ogg)$/i.test(m) ? (
                <video controls src={m} className="w-full rounded-lg" />
              ) : (
                <img
                  src={m}
                  alt={`media-${i}`}
                  className="w-full rounded-lg object-cover"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Render embeds array if provided */}
      {post.embeds && post.embeds.length > 0 && (
        <div className="mt-6 space-y-6">
          {post.embeds.map((e, i) => (
            <div key={i} className="w-full">
              {renderEmbed(e)}
            </div>
          ))}
        </div>
      )}
    </article>
  );
};

export default BlogPost;
