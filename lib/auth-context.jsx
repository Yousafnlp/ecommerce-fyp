"use client";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock authentication - replace with real auth service
  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem("specsmart_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("specsmart_user");
      }
    }
    setIsLoading(false);
  }, []);

  const signIn = async (email) => {
    setIsLoading(true);
    // Mock authentication - replace with real API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // For demo purposes, accept any email/password combination
    const mockUser = {
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

  const signUp = async (name, email) => {
    setIsLoading(true);
    // Mock registration - replace with real API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const mockUser = {
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

  const updateProfile = async (data) => {
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
