import keycloak from "../auth/keycloak";

const envBase = import.meta.env.VITE_API_BASE_URL;

export const BASE_URL =
  envBase && envBase.trim() !== ""
    ? envBase.replace(/\/$/, "")
    : window.location.origin;

async function parseJson(res) {
  const text = await res.text();

  if (text && text.trim().startsWith("<")) {
    if (!res.ok) {
      throw new Error("No autorizado o sesión expirada. Vuelve a iniciar sesión.");
    }
    throw new Error("Respuesta inválida del servidor (HTML en vez de JSON).");
  }

  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new Error("Respuesta inválida del servidor (no es JSON).");
  }

  if (!res.ok) {
    const msg = data?.message || data || `Error ${res.status}`;
    throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
  }

  return data;
}

export function resolvePhotoUrl(url, fallback = "https://via.placeholder.com/300") {
  if (!url) return fallback;
  return url.startsWith("/") ? `${BASE_URL}${url}` : url;
}

export async function apiFetch(path, { token, ...options } = {}) {
  const headers = {
    ...(options.headers || {}),
    Accept: "application/json",
  };

  if (!(options.body instanceof FormData)) {
    if (options.body && typeof options.body !== "string") {
      headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(options.body);
    } else if (options.body && typeof options.body === "string") {
      headers["Content-Type"] = "application/json";
    }
  }

  // Renovar el token Keycloak si está a punto de expirar
  if (keycloak.authenticated) {
    await keycloak.updateToken(30).catch(() => {});
  }

  // Usar token explícito o, si no, el de Keycloak
  const authToken = token || keycloak.token;
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  return parseJson(res);
}
