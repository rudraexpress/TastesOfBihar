import React, { useState } from "react";
import bgImg from "../assets/product-images/—Pngtree—vintage bamboo pad traditional weave_13398025.jpg";
import Map from "../components/Map";
import logoSrc from "../assets/product-images/Logo.png";

const ContactUs = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [sending, setSending] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Invalid email";
    if (!form.message.trim()) e.message = "Message is required";
    return e;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;

    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setStatus({
          type: "success",
          message: "Message sent — we'll get back to you soon.",
        });
        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        // fallback to mailto if backend endpoint not available
        const mailto = `mailto:hello@tastesofbihar.com?subject=${encodeURIComponent(
          form.subject || "Contact from website"
        )}&body=${encodeURIComponent(
          `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`
        )}`;
        window.location.href = mailto;
      }
    } catch (err) {
      const mailto = `mailto:hello@tastesofbihar.com?subject=${encodeURIComponent(
        form.subject || "Contact from website"
      )}&body=${encodeURIComponent(
        `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`
      )}`;
      window.location.href = mailto;
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="relative min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${bgImg})` }}
    >
      {/* subtle top and bottom tint so foreground text is readable on bright images */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/50 pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-12 pb-12">
        <h1 className="text-3xl font-bold mb-2 text-white drop-shadow-lg">
          Contact Us
        </h1>
        <p className="mb-6 text-white/90">
          Have a question or order inquiry? Fill the form below and we'll
          respond within 24-48 hours.
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 bg-white/40 backdrop-blur-md text-black p-6 rounded-lg border border-white/25 shadow-lg"
          style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}
        >
          {status && (
            <div
              className={`p-3 rounded ${
                status.type === "success"
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              {status.message}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full bg-white/60 backdrop-blur-sm border border-white/30 rounded px-3 py-2 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-700"
            />
            {errors.name && (
              <div className="text-red-600 text-sm mt-1">{errors.name}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full bg-white/60 backdrop-blur-sm border border-white/30 rounded px-3 py-2 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-700"
            />
            {errors.email && (
              <div className="text-red-600 text-sm mt-1">{errors.email}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Subject (optional)
            </label>
            <input
              name="subject"
              value={form.subject}
              onChange={handleChange}
              className="w-full bg-white/60 backdrop-blur-sm border border-white/30 rounded px-3 py-2 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows={6}
              className="w-full bg-white/60 backdrop-blur-sm border border-white/30 rounded px-3 py-2 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-700"
            />
            {errors.message && (
              <div className="text-red-600 text-sm mt-1">{errors.message}</div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              disabled={sending}
              type="submit"
              className="bg-yellow-900 text-white px-4 py-2 rounded-md hover:bg-yellow-800 disabled:opacity-60"
            >
              {sending ? "Sending..." : "Send Message"}
            </button>

            <a
              href="mailto:hello@tastesofbihar.com"
              className="text-sm text-yellow-200 hover:underline"
            >
              Or email us directly
            </a>
          </div>
        </form>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
          <div className="p-4 rounded-lg bg-white text-yellow-900 border border-yellow-200 shadow flex items-start gap-4">
            <div className="mt-1">
              <svg
                className="w-6 h-6 text-yellow-900"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden
              >
                <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold">Email</h3>
              <a
                href="mailto:hello@tastesofbihar.com"
                className="mt-1 block text-sm text-yellow-700 break-words whitespace-normal"
              >
                hello@tastesofbihar.com
              </a>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-white text-yellow-900 border border-yellow-200 shadow flex items-start gap-4">
            <div className="mt-1">
              <svg
                className="w-6 h-6 text-yellow-900"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.09 4.18 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.72c.12.95.38 1.87.76 2.74a2 2 0 0 1-.45 2.11L8.91 9.91a15.05 15.05 0 0 0 6 6l1.33-1.33a2 2 0 0 1 2.11-.45c.87.38 1.79.64 2.74.76A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold">Phone</h3>
              <a
                href="tel:+919876543210"
                className="mt-1 block text-sm text-yellow-700"
              >
                +91 98765 43210
              </a>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-white text-yellow-900 border border-yellow-200 shadow flex items-start gap-4">
            <div className="mt-1">
              <svg
                className="w-6 h-6 text-yellow-900"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1112 6a2.5 2.5 0 010 5.5z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold">Address</h3>
              <p className="mt-1 text-sm text-yellow-700">
                Patna, Bihar, India
              </p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-white text-yellow-900 border border-yellow-200 shadow flex items-start gap-4">
            <div className="mt-1">
              <div
                className="h-8 w-8 flex items-center justify-center"
                style={{ backgroundColor: "#25D366", borderRadius: "9999px" }}
              >
                <svg
                  className="w-4 h-4 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.09 4.18 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.72c.12.95.38 1.87.76 2.74a2 2 0 0 1-.45 2.11L8.91 9.91a15.05 15.05 0 0 0 6 6l1.33-1.33a2 2 0 0 1 2.11-.45c.87.38 1.79.64 2.74.76A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="font-semibold">WhatsApp</h3>
              <a
                href={`https://wa.me/919876543210?text=${encodeURIComponent(
                  "Hello Tastes of Bihar! I have a question about your products."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block text-sm text-yellow-700"
              >
                Chat with us
              </a>
            </div>
          </div>
        </div>

        {/* Map showing office location */}
        <Map address="Patna, Bihar, India" height={320} />
      </div>
    </div>
  );
};

export default ContactUs;
