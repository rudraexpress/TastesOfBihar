import React from "react";
import logoSrc from "../assets/product-images/Logo.png";

const services = [
  {
    id: "authentic",
    title: "Authentic Recipes",
    body: "Traditional Thekua & sweets made using old family recipes and premium ingredients.",
    icon: (
      <svg
        className="w-8 h-8 text-yellow-900"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M12 2v6" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d="M6 8v6a6 6 0 0012 0V8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "handmade",
    title: "Handmade & Small Batch",
    body: "Carefully prepared in small batches to keep the flavour and texture intact.",
    icon: (
      <svg
        className="w-8 h-8 text-yellow-900"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path
          d="M4 7h16M4 12h16M4 17h16"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "quality",
    title: "Quality Ingredients",
    body: "We source high-quality flours, ghee and jaggery — nothing artificial.",
    icon: (
      <svg
        className="w-8 h-8 text-yellow-900"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path
          d="M12 3l2 5h5l-4 3 1 5-4-3-4 3 1-5-4-3h5z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

const Services = () => {
  return (
    <section className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto text-center mb-8">
        <div className="inline-flex items-center justify-center bg-white rounded-md p-2 shadow-sm mb-4">
          <img src={logoSrc} alt="Tastes of Bihar" className="h-10 w-auto" />
        </div>
        <h2 className="text-3xl font-extrabold text-yellow-900">
          Our Services
        </h2>
        <p className="text-gray-600 mt-2">
          From handcrafted Thekua to packaged snacks — we bring Bihar's flavours
          to your doorstep.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {services.map((s) => (
          <div
            key={s.id}
            className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-start gap-4 hover:shadow-2xl transition-shadow"
          >
            <div className="inline-flex items-center justify-center bg-yellow-100 rounded-lg p-3">
              {s.icon}
            </div>
            <h3 className="text-lg font-semibold text-yellow-900">{s.title}</h3>
            <p className="text-sm text-gray-600 flex-1">{s.body}</p>
            {/* Learn more link removed per design request */}
          </div>
        ))}
      </div>
    </section>
  );
};

export default Services;
