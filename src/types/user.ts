export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  aadObjectId: string;
  tenantId: string;
  isActive: boolean;
  fullName: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  deletedAt: string | null;
}

export interface CurrentUserInfo {
  aadObjectId: string;
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  preferredUsername: string;
  name: string;
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

export interface RegisterUserRequest {
  aadObjectId: string;
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface UpdateUserStatusRequest {
  isActive: boolean;
}

export interface ApiError {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
}
