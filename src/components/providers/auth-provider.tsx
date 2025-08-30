"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  PublicClientApplication,
  EventType,
  EventMessage,
  AuthenticationResult,
  AccountInfo,
} from "@azure/msal-browser";
import { msalInstance, loginRequest } from "@/lib/auth";

interface AuthContextType {
  isAuthenticated: boolean;
  user: AccountInfo | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize MSAL
    msalInstance.initialize().then(() => {
      // Check if user is already signed in
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        setUser(accounts[0]);
        setIsAuthenticated(true);
      }
      setLoading(false);
    });

    // Set up event callback
    const callbackId = msalInstance.addEventCallback((event: EventMessage) => {
      if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
        const payload = event.payload as AuthenticationResult;
        setUser(payload.account);
        setIsAuthenticated(true);
      }
    });

    return () => {
      if (callbackId) {
        msalInstance.removeEventCallback(callbackId);
      }
    };
  }, []);

  const login = async () => {
    try {
      const response = await msalInstance.loginPopup(loginRequest);
      setUser(response.account);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const logout = async () => {
    try {
      await msalInstance.logoutPopup();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    loading,
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
