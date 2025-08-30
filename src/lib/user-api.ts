import { getAuthHeaders } from "@/lib/auth";
import {
  User,
  UpdateCurrentUserRequest,
  UpdateUserStatusRequest,
  UserStats,
} from "@/types/user";
import { isDebugEnabled } from "@/lib/dev-utils";
import { logger } from "@/lib/logger";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://localhost:7022";

// Helper function to make authenticated requests
async function makeAuthenticatedRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = getAuthHeaders();

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = {
          message: `HTTP ${response.status}: ${response.statusText}`,
        };
      }
      throw new Error(errorData.message || "Request failed");
    }

    // Handle empty responses
    const text = await response.text();
    if (!text) {
      return {} as T;
    }

    try {
      return JSON.parse(text) as T;
    } catch {
      return text as unknown as T;
    }
  } catch (error) {
    logger.error("API request failed:", error);
    throw error;
  }
}

export const userApi = {
  /**
   * Get current user profile - this now uses the auth API's /me endpoint
   * The auth provider already handles this, but keeping for compatibility
   */
  async getCurrentUser(): Promise<User> {
    return makeAuthenticatedRequest<User>("/api/auth/me");
  },

  /**
   * Update current user profile
   */
  async updateCurrentUser(userData: UpdateCurrentUserRequest): Promise<User> {
    return makeAuthenticatedRequest<User>("/api/users/me", {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  },

  /**
   * Get user by ID (Admin function)
   * Note: This requires proper admin permissions on the backend
   */
  async getUserById(id: string): Promise<User> {
    return makeAuthenticatedRequest<User>(`/api/users/${id}`);
  },

  /**
   * Update user status (Admin function)
   * Note: This requires proper admin permissions on the backend
   */
  async updateUserStatus(
    id: string,
    statusData: UpdateUserStatusRequest
  ): Promise<User> {
    return makeAuthenticatedRequest<User>(`/api/users/${id}/status`, {
      method: "PUT",
      body: JSON.stringify(statusData),
    });
  },

  /**
   * Soft delete user (Admin function)
   * Note: This requires proper admin permissions on the backend
   */
  async deleteUser(id: string): Promise<void> {
    return makeAuthenticatedRequest<void>(`/api/users/${id}`, {
      method: "DELETE",
    });
  },

  /**
   * Permanently delete user (Admin function)
   * Note: This requires proper admin permissions on the backend
   */
  async permanentDeleteUser(id: string): Promise<void> {
    return makeAuthenticatedRequest<void>(`/api/users/${id}/permanent`, {
      method: "DELETE",
    });
  },

  /**
   * Get user statistics
   */
  async getUserStats(tenantId?: string): Promise<UserStats> {
    const url = tenantId
      ? `/api/users/stats?tenantId=${encodeURIComponent(tenantId)}`
      : `/api/users/stats`;

    return makeAuthenticatedRequest<UserStats>(url);
  },
};
