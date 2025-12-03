export type UserType = "citizen" | "collector" | "kabadiwala" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  phone_number: string;
  user_type: UserType;
  is_active: boolean;
  is_verified: boolean;
  is_sponsor: boolean;
  reputation_score: number;
  total_transactions: number;
  created_at: string;
  updated_at: string;
  location?: {
    type: string;
    coordinates: [number, number];
  } | null;
}

export interface AuthResponse {
  access_token: string;
  token_type: string; // "bearer"
  user: AuthUser;
}

export interface RegisterPayload {
  email: string;
  full_name: string;
  password: string;
  phone_number: string;
  user_type: UserType;
}

export interface LoginPayload {
  email: string;
  password: string;
}
