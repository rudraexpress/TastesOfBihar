import React, { useEffect, useState } from "react";
import { fetchProducts } from "../utils/api";
import ProductCard from "../components/ProductCard";
import InfiniteMovingCards from "../components/InfiniteMovingCards";
import heroLocal from "../assets/product-images/HeroBG.mp4";
import productImg from "../assets/product-images/Logo.png";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [videoUrl, setVideoUrl] = useState(null);

  useEffect(() => {
    fetchProducts().then(setProducts);
  }, []);

  useEffect(() => {
    let mounted = true;

    const candidates = [
      // Prefer the local import (Vite will resolve this to a hashed URL in dev/build)
      heroLocal,
      "/assets/HeroBG.mp4",
      "/HeroBG.mp4",
      `${window.location.origin}/assets/HeroBG.mp4`,
      "http://localhost:5000/assets/HeroBG.mp4",
      "http://127.0.0.1:5000/assets/HeroBG.mp4",
    ];

    const fetchWithTimeout = (url, options = {}, timeout = 3000) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      return fetch(url, { ...options, signal: controller.signal }).finally(() =>
        clearTimeout(id)
      );
    };

    async function findVideo() {
      for (const url of candidates) {
        try {
          const res = await fetchWithTimeout(url, { method: "HEAD" }, 2500);
          if (!mounted) return;
          if (res && res.ok) {
            setVideoUrl(url);
            console.info("Hero video found at:", url);
            return;
          }
        } catch (err) {
          // ignore and try next
        }
      }
      if (mounted) {
        console.warn("Hero video not found at any candidate locations.");
        setVideoUrl(null);
      }
    }

    findVideo();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      <section className="relative h-screen md:h-[80vh] flex items-center">
        {/* Background video */}
        {videoUrl ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={productImg}
            className="absolute inset-0 w-full h-full object-cover z-0"
            style={{
              // Remove transform/will-change from the video element so it
              // doesn't interfere with overlay compositing. Overlays will
              // be promoted instead.
              backfaceVisibility: "hidden",
            }}
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        ) : (
          <div className="absolute inset-0 z-0">
            <img
              src={productImg}
              alt="Thekua"
              className="w-full h-full object-cover"
              style={{
                transform: "translateZ(0)",
                backfaceVisibility: "hidden",
              }}
            />
          </div>
        )}

        {/* Dev helper: small notice when video isn't available */}
        {!videoUrl && (
          <div className="absolute top-4 right-4 z-20 bg-yellow-100 text-yellow-900 px-3 py-2 rounded shadow">
            Hero video not found. To enable: run backend or copy `HeroBG.mp4` to
            `website/public`.
          </div>
        )}

        <div className="container mx-auto px-4 z-20 relative">
          <div className="max-w-3xl text-center mx-auto text-white py-24">
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-4">
              Tastes of Bihar
            </h1>
            <p className="text-lg md:text-xl text-yellow-100 mb-8">
              Bringing the authentic flavors of Bihar straight to your home. Try
              our signature Thekua — made traditionally with premium
              ingredients.
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="#products"
                className="inline-block bg-yellow-400 text-yellow-900 font-semibold px-6 py-3 rounded-lg shadow-lg"
              >
                Shop Thekua
              </a>
              <a
                href="/about"
                className="inline-block bg-transparent border border-yellow-300 text-yellow-300 px-6 py-3 rounded-lg"
              >
                Learn more
              </a>
            </div>
          </div>
        </div>

        {/* Mobile fallback: show a poster image when video cannot autoplay */}
        <div className="md:hidden absolute inset-0 z-0">
          <img
            src={productImg}
            alt="Thekua"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      <main className="container mx-auto py-12 px-4">
        <h2 className="text-2xl font-bold mb-6 text-center" id="products">
          Featured Products
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id || product._id} product={product} />
          ))}
        </div>
        {/* Testimonial section: infinite moving highlighted comments */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-center">
            What people are saying
          </h2>
          <InfiniteMovingCards speed={25} />
        </section>
      </main>
    </div>
  );
};

export default Home;
