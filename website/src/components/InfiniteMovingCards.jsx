import React, { useEffect, useRef, useState } from "react";
import testimonials from "../data/testimonials";

// rAF-driven infinite scroller with pixel-perfect seamless wrap.
// Props:
//  - speed: pixels per second scroll rate (default 60)
//  - pauseOnHover: boolean (default true)
//  - gradient: boolean to show side fades (default true)
// Implementation details:
//  * Duplicates testimonial list once (A A) enabling continuous shift.
//  * Maintains floating position (pos) in pixels; when pos >= halfWidth subtract halfWidth.
//  * Waits for images (future proof) & next frame before measuring to avoid jump.
const InfiniteMovingCards = ({
  speed = 60,
  pauseOnHover = true,
  gradient = true,
}) => {
  const highlighted = testimonials.filter((t) => t.highlight);
  if (!highlighted.length) return null;
  const items = [...highlighted];

  // We'll compute how many repetitions we need (>= (containerWidth / singleCycleWidth) + 2)
  // but before first measure we render a reasonable minimum (4x) to avoid initial blank.
  const [repeat, setRepeat] = useState(4); // will be recalculated after mount
  const list = Array.from({ length: repeat }, () => items).flat();

  const trackRef = useRef(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    let mounted = true;
    let rafId = null;
    const state = {
      cycleWidth: 0,
      pos: 0,
      lastTime: performance.now(),
      pxPerMs: 0,
    };

    const waitForImages = (el) => {
      const imgs = Array.from(el.querySelectorAll("img"));
      if (!imgs.length) return Promise.resolve();
      const pending = imgs.filter((i) => !i.complete || i.naturalWidth === 0);
      if (!pending.length) return Promise.resolve();
      return new Promise((res) => {
        let left = pending.length;
        const done = () => {
          if (--left <= 0) res();
        };
        pending.forEach((img) => {
          img.addEventListener("load", done, { once: true });
          img.addEventListener("error", done, { once: true });
        });
        setTimeout(res, 1200); // safety
      });
    };

    const measure = async () => {
      const track = trackRef.current;
      if (!track) return;
      await waitForImages(track);
      const containerWidth = track.parentElement?.clientWidth || 0;
      // Determine width of one logical cycle (the first N items) by inspecting first occurrence of items.
      // We'll approximate by dividing total scrollWidth by current repeat count.
      const scrollW = track.scrollWidth;
      const singleCycleWidth = scrollW / repeat;
      // Number of cycles needed so that while one cycle is leaving left side, there is at least
      // one full additional cycle plus one buffer visible to the right.
      let neededRepeats = 2; // minimum for seamless
      if (singleCycleWidth > 0) {
        const visibleNeeded = containerWidth / singleCycleWidth;
        neededRepeats = Math.ceil(visibleNeeded) + 2; // +2 buffer cycles
      }
      if (neededRepeats !== repeat) {
        // Update repeat count; will trigger re-run of effect (items.length stable) and re-measure next tick.
        setRepeat(neededRepeats);
        return; // exit now; next render will re-measure with correct width
      }
      state.cycleWidth = singleCycleWidth || 1;
      state.pxPerMs = speed / 1000;
      state.pos = 0;
      state.lastTime = performance.now();
      track.style.transform = "translate3d(0,0,0)";
      track.style.willChange = "transform";
    };

    const loop = (t) => {
      if (!mounted) return;
      if (paused) {
        state.lastTime = t;
        rafId = requestAnimationFrame(loop);
        return;
      }
      const dt = t - state.lastTime;
      state.lastTime = t;
      state.pos += state.pxPerMs * dt;
      if (state.pos >= state.cycleWidth) {
        state.pos -= state.cycleWidth;
      }
      const x = -state.pos;
      if (trackRef.current)
        trackRef.current.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
      rafId = requestAnimationFrame(loop);
    };

    const start = async () => {
      await measure();
      rafId = requestAnimationFrame(loop);
    };
    start();

    const onResize = () => {
      clearTimeout(onResize._t);
      onResize._t = setTimeout(() => measure(), 150);
    };
    window.addEventListener("resize", onResize);
    return () => {
      mounted = false;
      window.removeEventListener("resize", onResize);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [speed, paused, items.length, repeat]);

  const hoverHandlers = pauseOnHover
    ? {
        onMouseEnter: () => setPaused(true),
        onMouseLeave: () => setPaused(false),
        onFocus: () => setPaused(true),
        onBlur: () => setPaused(false),
      }
    : {};

  return (
    <div
      className="overflow-hidden py-8 relative select-none"
      role="region"
      aria-label="Customer testimonials"
    >
      {gradient && (
        <>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white to-transparent" />
        </>
      )}
      <div
        ref={trackRef}
        {...hoverHandlers}
        className="flex flex-nowrap gap-6"
        aria-hidden="false"
      >
        {list.map((t, i) => (
          <blockquote
            key={`${t.id}-${i}`}
            className="flex-none w-72 bg-white/90 rounded-xl p-4 shadow shadow-gray-200 border border-gray-100"
          >
            <p className="text-gray-800 leading-relaxed">“{t.text}”</p>
            <footer className="mt-3 text-sm text-gray-600">— {t.name}</footer>
          </blockquote>
        ))}
      </div>
      <style>{`
        @media (prefers-reduced-motion: reduce) { .flex[aria-hidden='false'] { transform: none !important; } }
      `}</style>
    </div>
  );
};

export default InfiniteMovingCards;
