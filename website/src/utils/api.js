import localProducts from "./products";

// Vite exposes environment variables on `import.meta.env`. In the browser
// `process` is not defined, so we must avoid using `process.env` here.
const API_URL = import.meta.env?.VITE_API_URL || "http://localhost:5000/api";

export async function fetchProducts() {
  try {
    const res = await fetch(`${API_URL}/products`, { timeout: 3000 });
    if (!res.ok) throw new Error("API error");
    return res.json();
  } catch (err) {
    // Fallback to bundled product list for frontend confirmation
    return localProducts;
  }
}

export async function fetchTestimonials() {
  try {
    const res = await fetch(`${API_URL}/testimonials`);
    if (!res.ok) throw new Error("API error");
    return res.json();
  } catch (err) {
    return [];
  }
}

// Add more API functions as needed
export async function submitTestimonial({
  content,
  userId,
  imageFile,
  videoFile,
}) {
  const form = new FormData();
  form.append("content", content);
  if (userId) form.append("userId", userId);
  if (imageFile) form.append("image", imageFile);
  if (videoFile) form.append("video", videoFile);
  const res = await fetch(`${API_URL}/testimonials`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error("Failed to submit testimonial");
  return res.json();
}
