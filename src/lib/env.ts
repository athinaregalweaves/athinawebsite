const rawApiUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();

const fallbackApiUrl =
  (import.meta.env.DEV ? "http://localhost:8080/api" : `${window.location.origin}/api`);

export const API_BASE_URL = (rawApiUrl && rawApiUrl.length > 0 ? rawApiUrl : fallbackApiUrl).replace(/\/+$/, "");

