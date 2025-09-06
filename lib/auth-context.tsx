"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "./types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock authentication - replace with real auth service
  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem("specsmart_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem("specsmart_user");
      }
    }
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);

    // Mock authentication - replace with real API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // For demo purposes, accept any email/password combination
    const mockUser: User = {
      id: "1",
      email,
      name: email.split("@")[0],
      preferences: {
        favoriteCategories: [],
        priceRange: { min: 0, max: 5000 },
        preferredBrands: [],
        notifications: true,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setUser(mockUser);
    localStorage.setItem("specsmart_user", JSON.stringify(mockUser));
    setIsLoading(false);
  };

  const signUp = async (name: string, email: string, password: string) => {
    setIsLoading(true);

    // Mock registration - replace with real API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name,
      preferences: {
        favoriteCategories: [],
        priceRange: { min: 0, max: 5000 },
        preferredBrands: [],
        notifications: true,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setUser(mockUser);
    localStorage.setItem("specsmart_user", JSON.stringify(mockUser));
    setIsLoading(false);
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem("specsmart_user");
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;

    const updatedUser = { ...user, ...data, updatedAt: new Date() };
    setUser(updatedUser);
    localStorage.setItem("specsmart_user", JSON.stringify(updatedUser));
  };

  const value = {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    updateProfile,
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
