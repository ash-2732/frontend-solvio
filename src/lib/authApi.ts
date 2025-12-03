import { apiRequest } from "./api";
import { AuthResponse, RegisterPayload, LoginPayload } from "@/types/auth";

export async function registerUser(payload: RegisterPayload): Promise<AuthResponse> {
  // Backend may or may not return token on register; assume same shape.
  return apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function logoutUser(token: string): Promise<{ success: boolean } | void> {
  // Some backends return no body; handle both.
  try {
    return await apiRequest<{ success: boolean }>("/auth/logout", {
      method: "POST",
      auth: true,
      token,
    });
  } catch (e) {
    // Even if logout fails, we'll clear local state.
    return;
  }
}

export async function getMe(token: string) {
  return apiRequest<import("@/types/auth").AuthUser>("/auth/me", {
    method: "GET",
    auth: true,
    token,
  });
}
