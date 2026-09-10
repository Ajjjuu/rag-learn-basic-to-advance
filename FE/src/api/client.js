/**
 * Tiny fetch wrapper. Base URL comes from .env (VITE_API_BASE_URL).
 * Use this in your modules: `import { api } from "../api/client";`
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8420";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

export const api = {
  baseUrl: BASE_URL,
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: "DELETE" }),
};
