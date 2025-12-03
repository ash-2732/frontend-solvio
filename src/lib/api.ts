import { API_BASE_URL, DEFAULT_HEADERS, ApiErrorShape } from "./config";

interface RequestOptions extends RequestInit {
  auth?: boolean;
  token?: string | null;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;

  console.log("API Request:", { url, auth: options.auth, hasToken: !!options.token });

  const headers: Record<string, string> = {
    ...(DEFAULT_HEADERS as Record<string, string>),
    ...(options.headers as Record<string, string> || {}),
  };

  // Add ngrok-skip-browser-warning header to bypass ngrok interstitial page
  if (API_BASE_URL.includes("ngrok")) {
    headers["ngrok-skip-browser-warning"] = "true";
  }

  if (options.auth && options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log("API Response:", { status: response.status, statusText: response.statusText, ok: response.ok });

    const contentType = response.headers.get("content-type");
    let body: any = null;
    
    try {
      if (contentType && contentType.includes("application/json")) {
        body = await response.json();
      } else {
        body = await response.text();
      }
    } catch (parseError) {
      console.error("Failed to parse response body:", parseError);
      body = null;
    }

    if (!response.ok) {
      const messageCandidate = body?.message || body?.detail || response.statusText || "Request failed";
      const error: ApiErrorShape = {
        status: response.status,
        message: typeof messageCandidate === "string" ? messageCandidate : "Request failed",
        details: body,
      };
      console.error("API Error:", error);
      console.error("Full response body:", body);
      throw error;
    }

    return body as T;
  } catch (error: any) {
    // Handle network errors or fetch failures
    if (error.status) {
      // Already an API error, rethrow
      throw error;
    }
    
    // Network error or other fetch failure
    console.error("Network or fetch error:", error);
    const networkError: ApiErrorShape = {
      status: 0,
      message: error.message || "Network error - please check your connection",
      details: { originalError: error.toString() },
    };
    throw networkError;
  }
}
