"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/lib/redux";
import { initAuth } from "@/store/slices/authSlice";

export function AuthBootstrap() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(initAuth());
  }, [dispatch]);

  return null;
}
