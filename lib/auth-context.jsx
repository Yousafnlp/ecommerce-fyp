"use client";
import { useAppDispatch, useAppSelector } from "./redux";
import {
  signIn,
  signUp,
  signOut,
  updateProfile,
} from "@/store/slices/authSlice";

export function AuthProvider({ children }) {
  // no-op provider for compatibility
  return children;
}

export function useAuth() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const isLoading = useAppSelector((s) => s.auth.isLoading);

  return {
    user,
    isLoading,
    signIn: (email) => dispatch(signIn(email)).unwrap(),
    signUp: (payload) => dispatch(signUp(payload)).unwrap(),
    signOut: () => dispatch(signOut()).unwrap(),
    updateProfile: (data) => dispatch(updateProfile(data)),
  };
}
