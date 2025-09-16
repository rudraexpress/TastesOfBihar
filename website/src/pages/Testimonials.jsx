import React, { useEffect, useState, useContext, useRef } from "react";
import { fetchTestimonials, submitTestimonial } from "../utils/api";
import Testimonial from "../components/Testimonial";
import { AuthContext } from "../context/AuthContext";

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const load = () => fetchTestimonials().then(setTestimonials);
  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!content.trim()) {
      setError("Please write something about your experience.");
      return;
    }
    try {
      setSubmitting(true);
      const created = await submitTestimonial({
        content: content.trim(),
        userId: user?.id,
        imageFile,
        videoFile,
        rating,
      });
      setTestimonials((prev) => [created, ...prev]);
      setContent("");
      setImageFile(null);
      setVideoFile(null);
      setRating(0);
      if (imageInputRef.current) imageInputRef.current.value = "";
      if (videoInputRef.current) videoInputRef.current.value = "";
    } catch (err) {
      setError(err.message || "Failed to submit testimonial");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="grid lg:grid-cols-5 gap-10">
        <div className="lg:col-span-2 order-2 lg:order-1 space-y-6">
          <div className="bg-gradient-to-br from-yellow-800 to-yellow-600 text-yellow-50 rounded-xl p-6 shadow-md">
            <h1 className="text-2xl font-extrabold tracking-tight mb-2">
              Share Your Experience
            </h1>
            <p className="text-yellow-100 text-sm leading-relaxed mb-4">
              We love hearing authentic stories. Add a short message and
              optionally a photo or a quick video clip (MP4/WebM) showing your
              unboxing or tasting moment.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-yellow-50 mb-2">
                  Your rating
                </label>
                <div
                  role="radiogroup"
                  aria-label="Rating"
                  className="flex items-center gap-2"
                >
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button
                      key={i}
                      type="button"
                      aria-pressed={rating === i}
                      aria-label={`${i} star${i > 1 ? "s" : ""}`}
                      title={`${i} star${i > 1 ? "s" : ""}`}
                      onClick={() => setRating(i)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setRating(i);
                        }
                      }}
                      className={`p-1 rounded ${
                        rating >= i ? "text-yellow-400" : "text-yellow-200"
                      } hover:text-yellow-400 focus:outline-none`}
                    >
                      <svg
                        className="w-5 h-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.955a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.955c.3.921-.755 1.688-1.54 1.118L10 13.347l-3.487 2.674c-.784.57-1.839-.197-1.54-1.118l1.287-3.955a1 1 0 00-.364-1.118L2.526 9.382c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.955z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Describe the taste, freshness, packaging, or your nostalgia..."
                  rows={5}
                  className="w-full rounded-md border border-yellow-900/30 bg-white/90 p-3 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-yellow-600"
                  maxLength={800}
                  disabled={submitting}
                />
                <div className="flex justify-between mt-1 text-[11px] text-yellow-50/80">
                  <span>{content.length}/800</span>
                  {!user && (
                    <span className="italic">(Optional login for avatar)</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <label className="text-xs font-semibold uppercase tracking-wide text-yellow-100">
                    Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    ref={imageInputRef}
                    onChange={(e) => setImageFile(e.target.files[0] || null)}
                    disabled={submitting}
                    className="text-xs text-yellow-50 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-medium file:bg-yellow-100 file:text-yellow-900 hover:file:bg-white"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-xs font-semibold uppercase tracking-wide text-yellow-100">
                    Video
                  </label>
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/ogg"
                    ref={videoInputRef}
                    onChange={(e) => setVideoFile(e.target.files[0] || null)}
                    disabled={submitting}
                    className="text-xs text-yellow-50 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-medium file:bg-yellow-100 file:text-yellow-900 hover:file:bg-white"
                  />
                </div>
                {(imageFile || videoFile) && (
                  <div className="bg-yellow-950/20 border border-yellow-900/30 rounded p-3 flex flex-col gap-2">
                    <p className="text-[11px] uppercase tracking-wide text-yellow-50/70 font-semibold">
                      Media Preview
                    </p>
                    {imageFile && (
                      <img
                        src={URL.createObjectURL(imageFile)}
                        alt="preview"
                        className="w-full h-40 object-cover rounded"
                      />
                    )}
                    {videoFile && (
                      <video
                        src={URL.createObjectURL(videoFile)}
                        className="w-full h-52 object-cover rounded"
                        controls
                      />
                    )}
                  </div>
                )}
              </div>
              {error && (
                <div className="text-xs text-red-200 bg-red-900/40 border border-red-400/30 p-2 rounded">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-white text-yellow-900 px-4 py-2 text-sm font-semibold shadow hover:bg-yellow-50 disabled:opacity-60 disabled:cursor-not-allowed w-full"
              >
                {submitting ? "Submitting..." : "Submit Testimonial"}
              </button>
              <p className="text-[10px] text-yellow-200 mt-2 leading-relaxed">
                By submitting you agree we may display your text and media on
                this site. Media is optional. Keep videos under 25MB.
              </p>
            </form>
          </div>
          <div className="rounded-lg bg-white/60 p-4 text-xs text-gray-700 shadow">
            <h2 className="font-semibold mb-2 text-yellow-900 text-sm">
              Why Share?
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Help others find authentic Bihar flavors</li>
              <li>We use feedback to improve packaging & freshness</li>
              <li>Inspire nostalgia & cultural connection</li>
            </ul>
          </div>
        </div>
        <div className="lg:col-span-3 order-1 lg:order-2">
          <h1 className="text-3xl font-extrabold tracking-tight mb-6 text-yellow-900">
            Voices from Our Community
          </h1>
          <div className="grid sm:grid-cols-2 gap-6">
            {testimonials.map((testimonial) => (
              <Testimonial
                key={testimonial.id || testimonial._id}
                testimonial={testimonial}
              />
            ))}
            {testimonials.length === 0 && (
              <div className="col-span-full text-center py-16 bg-white/60 rounded-lg ring-1 ring-yellow-900/10">
                <p className="text-yellow-900 font-medium">
                  No testimonials yet. Be the first to share your taste story!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
