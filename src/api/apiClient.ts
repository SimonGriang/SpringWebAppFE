// Custom event fired when refresh fails — AuthProvider listens to this
// and triggers a logout without needing a direct reference to the context
export const AUTH_LOGOUT_EVENT = "auth:logout";

function dispatchLogout() {
  window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));
}

// Tracks whether a refresh is already in progress to avoid parallel refresh calls
let refreshPromise: Promise<string | null> | null = null;

async function tryRefreshToken(): Promise<string | null> {
  // If a refresh is already running, wait for it instead of starting a new one
  if (refreshPromise) return refreshPromise;

  refreshPromise = fetch("/backend/api/auth/refresh", {
    method: "POST",
    credentials: "include", // Required — sends the httpOnly cookie automatically
  })
    .then(async (res) => {
      if (!res.ok) return null;
      const data = await res.json();
      return data.accessToken as string;
    })
    .catch(() => null)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

export const createApiClient = (
  getToken: () => string | null,
  onNewToken?: (token: string) => void
) => {
  return async (url: string, options: RequestInit = {}): Promise<any> => {
    const token = getToken();

    const buildHeaders = (t: string | null): Headers => {
      const headers = new Headers(options.headers);
      if (!(options.body instanceof FormData)) {
        headers.set("Content-Type", "application/json");
      }
      if (t) headers.set("Authorization", `Bearer ${t}`);
      return headers;
    };

    // ── First attempt ────────────────────────────────────────────────────────
    const response = await fetch(url, {
      ...options,
      headers: buildHeaders(token),
    });

    if (response.ok) {
      // Detect binary responses by the response Content-Type, not the request Accept header
      const responseType = response.headers.get("Content-Type") ?? "";
      if (responseType.includes("application/octet-stream") ||
          responseType.includes("image/")) {
        return response.blob();
      }
      // Empty responses (e.g. 204 No Content) must not be parsed as JSON
      if (!responseType.includes("application/json")) return null;
      return response.json();
    }

    // ── Handle 401 — attempt silent refresh ──────────────────────────────────
    if (response.status === 401) {
      const newToken = await tryRefreshToken();

      if (!newToken) {
        // Refresh failed — session is over, trigger logout
        dispatchLogout();
        throw new Error("Session expired. Please log in again.");
      }

      // Notify AuthProvider about the new token so it updates its state
      onNewToken?.(newToken);

      // Retry the original request with the new token
      const retryResponse = await fetch(url, {
        ...options,
        headers: buildHeaders(newToken),
      });

      if (!retryResponse.ok) {
        if (retryResponse.status === 401) {
          dispatchLogout();
          throw new Error("Session expired. Please log in again.");
        }
        throw new Error(`API Error ${retryResponse.status}`);
      }

      const retryType = retryResponse.headers.get("Content-Type") ?? "";
      if (retryType.includes("application/octet-stream") ||
          retryType.includes("image/")) {
        return retryResponse.blob();
      }
      if (!retryType.includes("application/json")) return null;
      return retryResponse.json();
    }

    throw new Error(`API Error ${response.status}`);
  };
};