import { msalInstance, apiRequest } from "@/lib/auth";
import {
  User,
  CurrentUserInfo,
  RegisterUserRequest,
  UpdateCurrentUserRequest,
  UpdateUserStatusRequest,
  UserStats,
} from "@/types/user";
import { isDebugEnabled } from "@/lib/dev-utils";
import { logger } from "@/lib/logger";

const API_BASE_URL =
  process.env.API_BASE_URL || "https://r5thg0j4-7022.inc1.devtunnels.ms";

// Helper function to get access token
async function getAccessToken(): Promise<string> {
  const accounts = msalInstance.getAllAccounts();
  if (accounts.length === 0) {
    throw new Error("No authenticated user found");
  }

  const account = accounts[0];

  try {
    // Try to get token silently first with API scope
    const response = await msalInstance.acquireTokenSilent({
      scopes: apiRequest.scopes,
      account: account,
    });
    return response.accessToken;
  } catch (error) {
    // If silent token acquisition fails, try interactive
    const response = await msalInstance.acquireTokenPopup({
      scopes: apiRequest.scopes,
      account: account,
    });
    return response.accessToken;
  }
}

// Helper function to create auth headers
async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await getAccessToken();
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

// Helper function to handle API responses
async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    let errorData;

    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = {
        status: response.status,
        title: response.statusText,
        detail: errorText,
      };
    }

    throw new Error(
      errorData.detail ||
        errorData.title ||
        `HTTP ${response.status}: ${response.statusText}`
    );
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const userApi = {
  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/users/me`, {
      method: "GET",
      headers,
    });
    return handleApiResponse<User>(response);
  },

  /**
   * Update current user profile
   */
  async updateCurrentUser(userData: UpdateCurrentUserRequest): Promise<User> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/users/me`, {
      method: "PUT",
      headers,
      body: JSON.stringify(userData),
    });
    return handleApiResponse<User>(response);
  },

  /**
   * Register current user (typically called on first login)
   */
  async registerUser(): Promise<User> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/users/register`, {
      method: "POST",
      headers,
    });
    return handleApiResponse<User>(response);
  },

  /**
   * Get current user token information (for debugging - development only)
   */
  async getTokenInfo(): Promise<CurrentUserInfo> {
    if (!isDebugEnabled()) {
      throw new Error(
        "Token info endpoint is only available in development mode"
      );
    }

    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/users/me/token-info`, {
      method: "GET",
      headers,
    });
    return handleApiResponse<CurrentUserInfo>(response);
  },

  /**
   * Get user by ID (Admin function)
   * Note: This requires proper admin permissions on the backend
   */
  async getUserById(id: string): Promise<User> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
      method: "GET",
      headers,
    });
    return handleApiResponse<User>(response);
  },

  /**
   * Update user status (Admin function)
   * Note: This requires proper admin permissions on the backend
   */
  async updateUserStatus(
    id: string,
    statusData: UpdateUserStatusRequest
  ): Promise<User> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/users/${id}/status`, {
      method: "PUT",
      headers,
      body: JSON.stringify(statusData),
    });
    return handleApiResponse<User>(response);
  },

  /**
   * Soft delete user (Admin function)
   * Note: This requires proper admin permissions on the backend
   */
  async deleteUser(id: string): Promise<void> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
      method: "DELETE",
      headers,
    });
    return handleApiResponse<void>(response);
  },

  /**
   * Permanently delete user (Admin function)
   * Note: This requires proper admin permissions on the backend
   */
  async permanentDeleteUser(id: string): Promise<void> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/users/${id}/permanent`, {
      method: "DELETE",
      headers,
    });
    return handleApiResponse<void>(response);
  },

  /**
   * Get user statistics
   */
  async getUserStats(tenantId?: string): Promise<UserStats> {
    const headers = await getAuthHeaders();
    const url = tenantId
      ? `${API_BASE_URL}/api/users/stats?tenantId=${encodeURIComponent(
          tenantId
        )}`
      : `${API_BASE_URL}/api/users/stats`;

    const response = await fetch(url, {
      method: "GET",
      headers,
    });
    return handleApiResponse<UserStats>(response);
  },

  /**
   * Check if current user exists, if not register them
   */
  async ensureUserExists(): Promise<User> {
    try {
      // Try to get current user first
      return await this.getCurrentUser();
    } catch (error) {
      // If user doesn't exist (404 or similar), register them
      logger.info("User not found, registering new user...");
      return await this.registerUser();
    }
  },
};
