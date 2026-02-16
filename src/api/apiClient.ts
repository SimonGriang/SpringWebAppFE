export const createApiClient = (getToken: () => string | null) => {
  return async (url: string, options: RequestInit = {}) => {
    const token = getToken();

    const headers = new Headers(options.headers);

    if (!(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error("API Error");
    }

    if (headers.get("Accept") === "application/octet-stream") {
      return response.blob();
    }

    return response.json();
  };
};
