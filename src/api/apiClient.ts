export const createApiClient = (getToken: () => string | null) => {
  return async (url: string, options: RequestInit = {}) => {
    const token = getToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>), // Type Assertion notwendig
    };


    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error("API Error");
    }

    return response.json();
  };
};
