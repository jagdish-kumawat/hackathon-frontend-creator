import {
  User,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
  ChangePasswordRequest,
  LogoutRequest,
  AvailabilityResponse,
  ApiError,
} from "@/types/user";

// Auth configuration
const AUTH_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "https://localhost:7022",
  endpoints: {
    login: "/api/auth/login",
    register: "/api/auth/register",
    refresh: "/api/auth/refresh",
    logout: "/api/auth/logout",
    logoutAll: "/api/auth/logout-all",
    changePassword: "/api/auth/change-password",
    me: "/api/auth/me",
    checkUsername: "/api/auth/check-username",
    checkEmail: "/api/auth/check-email",
  },
  tokenKey: "accessToken",
  refreshTokenKey: "refreshToken",
} as const;

// Token management
export class TokenManager {
  static getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(AUTH_CONFIG.tokenKey);
  }

  static setToken(token: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(AUTH_CONFIG.tokenKey, token);
  }

  static getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(AUTH_CONFIG.refreshTokenKey);
  }

  static setRefreshToken(refreshToken: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(AUTH_CONFIG.refreshTokenKey, refreshToken);
  }

  static clearTokens(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(AUTH_CONFIG.tokenKey);
    localStorage.removeItem(AUTH_CONFIG.refreshTokenKey);
  }

  static setTokens(authResponse: AuthResponse): void {
    this.setToken(authResponse.token);
    this.setRefreshToken(authResponse.refreshToken);
  }
}

// HTTP client with automatic token refresh
class AuthClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = AUTH_CONFIG.baseUrl;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = TokenManager.getToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (
      token &&
      !endpoint.includes("/refresh") &&
      !endpoint.includes("/login") &&
      !endpoint.includes("/register")
    ) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle token expiration with automatic refresh
      if (response.status === 401 && token) {
        const refreshToken = TokenManager.getRefreshToken();
        if (refreshToken && !endpoint.includes("/refresh")) {
          try {
            await this.refreshToken({ refreshToken });
            // Retry the original request with new token
            const newToken = TokenManager.getToken();
            if (newToken) {
              headers.Authorization = `Bearer ${newToken}`;
              const retryResponse = await fetch(url, {
                ...options,
                headers,
              });
              return this.handleResponse<T>(retryResponse);
            }
          } catch (refreshError) {
            TokenManager.clearTokens();
            throw new Error("Session expired. Please login again.");
          }
        } else {
          TokenManager.clearTokens();
          throw new Error("Session expired. Please login again.");
        }
      }

      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error occurred");
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorData: ApiError;
      try {
        errorData = await response.json();
      } catch {
        errorData = {
          message: `HTTP ${response.status}: ${response.statusText}`,
        };
      }
      throw new Error(errorData.message || "An error occurred");
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
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.makeRequest<AuthResponse>(
      AUTH_CONFIG.endpoints.login,
      {
        method: "POST",
        body: JSON.stringify(credentials),
      }
    );
    TokenManager.setTokens(response);
    return response;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await this.makeRequest<AuthResponse>(
      AUTH_CONFIG.endpoints.register,
      {
        method: "POST",
        body: JSON.stringify(userData),
      }
    );
    TokenManager.setTokens(response);
    return response;
  }

  async refreshToken(request: RefreshTokenRequest): Promise<AuthResponse> {
    const response = await this.makeRequest<AuthResponse>(
      AUTH_CONFIG.endpoints.refresh,
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
    TokenManager.setTokens(response);
    return response;
  }

  async logout(request: LogoutRequest): Promise<{ message: string }> {
    const response = await this.makeRequest<{ message: string }>(
      AUTH_CONFIG.endpoints.logout,
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
    TokenManager.clearTokens();
    return response;
  }

  async logoutAll(): Promise<{ message: string }> {
    const response = await this.makeRequest<{ message: string }>(
      AUTH_CONFIG.endpoints.logoutAll,
      {
        method: "POST",
      }
    );
    TokenManager.clearTokens();
    return response;
  }

  async changePassword(
    request: ChangePasswordRequest
  ): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>(
      AUTH_CONFIG.endpoints.changePassword,
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
  }

  async getCurrentUser(): Promise<User> {
    return this.makeRequest<User>(AUTH_CONFIG.endpoints.me);
  }

  async checkUsernameAvailability(
    username: string
  ): Promise<AvailabilityResponse> {
    return this.makeRequest<AvailabilityResponse>(
      `${AUTH_CONFIG.endpoints.checkUsername}/${encodeURIComponent(username)}`
    );
  }

  async checkEmailAvailability(email: string): Promise<AvailabilityResponse> {
    return this.makeRequest<AvailabilityResponse>(
      `${AUTH_CONFIG.endpoints.checkEmail}/${encodeURIComponent(email)}`
    );
  }
}

export const authClient = new AuthClient();

// Authentication utilities
export const isAuthenticated = (): boolean => {
  return TokenManager.getToken() !== null;
};

export const getAuthHeaders = (): Record<string, string> => {
  const token = TokenManager.getToken();
  return token
    ? {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    : {
        "Content-Type": "application/json",
      };
};
