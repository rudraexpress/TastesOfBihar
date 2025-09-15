// Central place to configure where the public website lives.
// You can override via environment variable VITE_PUBLIC_SITE_URL when running/building with Vite.
// Examples:
//   PowerShell: $env:VITE_PUBLIC_SITE_URL="http://localhost:5174"; npm run dev
//   Bash: VITE_PUBLIC_SITE_URL="https://tasteofbihar.com" npm run build
export const PUBLIC_SITE_URL =
  import.meta?.env?.VITE_PUBLIC_SITE_URL || "http://localhost:5173"; // adjust default if needed

// Dummy mode helper (used in API modules). Prefer using import { isDummyMode } from data/dummyData,
// but expose here for quick debugging in components if ever needed.
export const USE_DUMMY = import.meta?.env?.VITE_USE_DUMMY === "1";
