// Base URL for the URL Shortener backend.
// - In dev, defaults to "/api" which vite.config.js proxies to http://localhost:8001
// - In production, set VITE_API_BASE_URL to your deployed backend origin
//   e.g. VITE_API_BASE_URL=https://your-backend.onrender.com
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function parseJsonSafe(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function createShortLink(url) {
  let res;
  try {
    res = await fetch(`${BASE_URL}/url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
  } catch {
    throw new ApiError("Can't reach the counter. Is the backend running?", 0);
  }

  const data = await parseJsonSafe(res);

  if (!res.ok) {
    throw new ApiError(data?.message || "That link was rejected.", res.status);
  }
  return data.data; // { shortId, redirectURL, visitHistory, createdAt, ... }
}

export async function getAnalytics(shortId) {
  let res;
  try {
    res = await fetch(`${BASE_URL}/url/analytics/${shortId}`);
  } catch {
    throw new ApiError("Can't reach the counter. Is the backend running?", 0);
  }

  const data = await parseJsonSafe(res);

  if (!res.ok) {
    throw new ApiError(data?.message || "No record of that ticket.", res.status);
  }
  return data; // { totalClicks, analytics: [{timestamp}] }
}

export function redirectUrlFor(shortId) {
  // Direct top-level navigation — the browser follows the 302 itself,
  // so this never needs CORS regardless of BASE_URL.
  const origin = BASE_URL.startsWith("http")
    ? BASE_URL
    : `${window.location.origin}${BASE_URL}`;
  return `${origin}/${shortId}`;
}

export { ApiError };
