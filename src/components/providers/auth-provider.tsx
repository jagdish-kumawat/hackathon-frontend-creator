"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { authClient, TokenManager, isAuthenticated } from "@/lib/auth";
import {
  User,
  LoginRequest,
  RegisterRequest,
  ChangePasswordRequest,
} from "@/types/user";

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  changePassword: (request: ChangePasswordRequest) => Promise<void>;
  checkUsernameAvailability: (username: string) => Promise<boolean>;
  checkEmailAvailability: (email: string) => Promise<boolean>;
  loading: boolean;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUserProfile = useCallback(async () => {
    if (!isAuthenticated()) {
      setUser(null);
      return;
    }

    try {
      const profile = await authClient.getCurrentUser();
      setUser(profile);
    } catch (error) {
      console.error("Failed to load user profile:", error);
      setUser(null);
      TokenManager.clearTokens();
      setIsAuth(false);
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (isAuthenticated()) {
          setIsAuth(true);
          await refreshUserProfile();
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        TokenManager.clearTokens();
        setIsAuth(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [refreshUserProfile]);

  const login = async (credentials: LoginRequest) => {
    try {
      const authResponse = await authClient.login(credentials);
      setUser(authResponse.user);
      setIsAuth(true);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      const authResponse = await authClient.register(userData);
      setUser(authResponse.user);
      setIsAuth(true);
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const refreshToken = TokenManager.getRefreshToken();
      if (refreshToken) {
        await authClient.logout({ refreshToken });
      }
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      TokenManager.clearTokens();
      setUser(null);
      setIsAuth(false);
    }
  };

  const logoutAll = async () => {
    try {
      await authClient.logoutAll();
    } catch (error) {
      console.error("Logout all request failed:", error);
    } finally {
      TokenManager.clearTokens();
      setUser(null);
      setIsAuth(false);
    }
  };

  const changePassword = async (request: ChangePasswordRequest) => {
    await authClient.changePassword(request);
  };

  const checkUsernameAvailability = async (
    username: string
  ): Promise<boolean> => {
    const response = await authClient.checkUsernameAvailability(username);
    return response.isAvailable;
  };

  const checkEmailAvailability = async (email: string): Promise<boolean> => {
    const response = await authClient.checkEmailAvailability(email);
    return response.isAvailable;
  };

  const value = {
    isAuthenticated: isAuth,
    user,
    login,
    register,
    logout,
    logoutAll,
    changePassword,
    checkUsernameAvailability,
    checkEmailAvailability,
    loading,
    refreshUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
