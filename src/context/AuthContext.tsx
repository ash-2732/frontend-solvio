"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AuthUser, AuthResponse, RegisterPayload, LoginPayload } from "@/types/auth";
import { registerUser, loginUser, logoutUser } from "@/lib/authApi";
import { toast } from "react-hot-toast";

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<{ success: boolean; userType: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "auth";

function persistAuth(data: { token: string; user: AuthUser }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

function readPersisted(): { token: string; user: AuthUser } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Hydrate from localStorage on mount
  useEffect(() => {
    const persisted = readPersisted();
    if (persisted) {
      setUser(persisted.user);
      setToken(persisted.token);
    }
    setLoading(false);
  }, []);

  const handleAuthSuccess = useCallback((res: AuthResponse) => {
    setUser(res.user);
    setToken(res.access_token);
    persistAuth({ token: res.access_token, user: res.user });
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await loginUser({ email, password } as LoginPayload);
      handleAuthSuccess(res);
      
      // Check if user is a collector without location set
      if (res.user.user_type === "collector") {
        // Check if collector has location
        const collectorHasLocation = res.user.location !== null && res.user.location !== undefined;
        
        if (!collectorHasLocation) {
          // Redirect to confirmation page to set location
          router.push("/confirmation");
          return;
        }
      }
      
      // For other users or collectors with location, go to home
      router.push("/");
    } catch (e: any) {
      const msg = e?.message || "Login failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    setLoading(true);
    setError(null);
    try {
      await registerUser(payload);
      
      // All users redirect to login after registration
      router.push("/login");
      toast.success("Registration successful! Please login.");
      return { success: true, userType: payload.user_type };
    } catch (e: any) {
      const msg = e?.message || "Registration failed";
      setError(msg);
      toast.error(msg);
      return { success: false, userType: payload.user_type };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    const currentToken = token;
    // Attempt backend logout (best-effort)
    if (currentToken) {
      await logoutUser(currentToken);
    }
    setUser(null);
    setToken(null);
    setError(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    toast.success("Logged out");
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
