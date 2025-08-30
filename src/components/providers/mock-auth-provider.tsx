"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user for development
const mockUser: User = {
  id: "mock-user-123",
  name: "John Developer",
  username: "john.developer@company.com",
  email: "john.developer@company.com",
};

export function MockAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user was previously authenticated
    const storedAuth = localStorage.getItem("mock-auth");
    if (storedAuth === "true") {
      setUser(mockUser);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async () => {
    // Simulate Microsoft login flow
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setUser(mockUser);
        setIsAuthenticated(true);
        localStorage.setItem("mock-auth", "true");
        resolve();
      }, 1000); // Simulate network delay
    });
  };

  const logout = async () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("mock-auth");
    window.location.href = "/landing";
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
