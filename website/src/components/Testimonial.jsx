import React from "react";

const Testimonial = ({ testimonial }) => {
  const name =
    testimonial.user?.name || testimonial.userName || "Anonymous Customer";
  const avatar = testimonial.avatarUrl || testimonial.user?.avatar;
  const dateStr = new Date(
    testimonial.createdAt || Date.now()
  ).toLocaleDateString();
  return (
    <article className="relative overflow-hidden rounded-xl bg-white/70 backdrop-blur shadow-md ring-1 ring-yellow-900/10 hover:shadow-lg transition flex flex-col">
      <div className="p-5 flex flex-col gap-4 flex-1">
        <header className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-yellow-800 to-yellow-600 text-white flex items-center justify-center overflow-hidden ring-2 ring-yellow-900/30">
            {avatar ? (
              <img
                src={avatar}
                alt={name}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <span className="font-semibold text-sm">
                {name
                  .split(/\s+/)
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join("")}
              </span>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-yellow-900 text-sm">
              {name}
            </span>
            <span className="text-[11px] uppercase tracking-wide text-yellow-700/70">
              {dateStr}
            </span>
          </div>
        </header>
        {testimonial.rating ? (
          <div className="flex items-center gap-1" aria-hidden>
            {Array.from({ length: 5 }).map((_, idx) => (
              <svg
                key={idx}
                className={`w-4 h-4 ${
                  idx < testimonial.rating
                    ? "text-yellow-400"
                    : "text-yellow-200"
                }`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.955a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.955c.3.921-.755 1.688-1.54 1.118L10 13.347l-3.487 2.674c-.784.57-1.839-.197-1.54-1.118l1.287-3.955a1 1 0 00-.364-1.118L2.526 9.382c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.955z" />
              </svg>
            ))}
          </div>
        ) : null}
        <p className="text-sm leading-relaxed text-gray-800">
          “{testimonial.content}”
        </p>
        {(testimonial.imageUrl || testimonial.videoUrl) && (
          <div className="rounded-lg overflow-hidden border border-yellow-900/10 bg-black/5">
            {testimonial.imageUrl && (
              <img
                src={testimonial.imageUrl}
                alt="testimonial media"
                className="w-full h-56 object-cover"
                loading="lazy"
              />
            )}
            {testimonial.videoUrl && (
              <video
                className="w-full h-64 object-cover"
                controls
                preload="metadata"
                poster={testimonial.imageUrl || undefined}
              >
                <source src={testimonial.videoUrl} />
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        )}
      </div>
      <div className="px-5 py-2 bg-gradient-to-r from-yellow-800 to-yellow-600 text-[11px] text-yellow-50 tracking-wide uppercase font-medium flex items-center justify-end gap-2">
        <span>Verified Taste of Bihar Customer</span>
      </div>
    </article>
  );
};

export default Testimonial;
