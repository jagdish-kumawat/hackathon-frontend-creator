export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  roles: string[];
  tenantId: string | null;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiresAt: string;
  user: User;
}

export interface LoginRequest {
  username: string;
  password: string;
  tenantId?: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  tenantId?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  deletedUsers: number;
}

export interface UpdateCurrentUserRequest {
  firstName: string;
  lastName: string;
}

export interface UpdateUserStatusRequest {
  isActive: boolean;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface AvailabilityResponse {
  isAvailable: boolean;
}
