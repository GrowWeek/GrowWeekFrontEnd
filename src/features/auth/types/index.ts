import { ApiResponse } from "@/features/todo/types"; // Reuse common response type or move it to shared

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface User {
  userId: number;
  email: string;
  name: string;
  roles: string[];
}

export interface LoginResponse {
  userId: number;
  email: string;
  name: string;
  token: string;
  refreshToken: string;
}

export type AuthResponse = ApiResponse<LoginResponse>;
export type UserResponse = ApiResponse<User>;

