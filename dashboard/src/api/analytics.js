// All dummy mode logic has been removed. The following code uses real backend endpoints.
let API_BASE = import.meta.env.VITE_API_BASE || "";
if (!API_BASE) {
  API_BASE = `${window.location.origin.replace(/:\d+$/, ":5000")}/api`;
}
if (/^\/api/.test(API_BASE)) {
  API_BASE = window.location.origin + API_BASE;
}

function buildRangeParams(range) {
  if (!range) return "";
  const p = new URLSearchParams();
  if (range.from) p.set("from", range.from);
  if (range.to) p.set("to", range.to);
  const s = p.toString();
  return s ? `?${s}` : "";
}

async function get(path, range, extraParams) {
  let qs = buildRangeParams(range);
  if (extraParams) {
    const ep = new URLSearchParams(extraParams);
    qs += qs ? `&${ep.toString()}` : `?${ep.toString()}`;
  }
  const url = `${API_BASE}/analytics/${path}${qs}`;
  let res;
  try {
    res = await fetch(url);
    if (!res.ok) throw new Error();
  } catch (e) {
    if (!/localhost:5000/.test(API_BASE)) {
      try {
        const retry = url.replace(API_BASE, "http://localhost:5000/api");
        res = await fetch(retry);
        if (!res.ok) throw new Error();
      } catch (e2) {
        console.warn("API fetch failed for path:", path);
        throw new Error("Failed to fetch");
      }
    } else {
      console.warn("API fetch failed for path:", path);
      throw new Error("Failed to fetch");
    }
  }
  return res.json();
}

export const fetchSummary = (range) => get("summary", range);
export const fetchDaily = (range) => get("daily", range);
export const fetchStatusDistribution = (range) =>
  get("status-distribution", range);
export const fetchTopCustomers = (range, limit = 5) =>
  get("top-customers", range, { limit });
export const fetchLowInventory = (threshold = 10) =>
  get("inventory-low", null, { threshold });

export function exportToCsv(filename, rows) {
  if (!rows || !rows.length) return;
  const headers = Object.keys(rows[0]);
  const escape = (v) => {
    if (v == null) return "";
    const s = String(v);
    if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  };
  const csv = [headers.map(escape).join(",")]
    .concat(rows.map((r) => headers.map((h) => escape(r[h])).join(",")))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
