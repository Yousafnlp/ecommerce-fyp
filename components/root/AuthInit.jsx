"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/redux";
import { initAuth } from "@/store/slices/authSlice";
import { syncCart } from "@/store/slices/cartSlice";

export function AuthBootstrap() {
  const dispatch = useAppDispatch();
  const userId = useAppSelector((state) => state.auth.user?.id);

  useEffect(() => {
    dispatch(initAuth()).finally(() => {
      dispatch(syncCart());
    });
  }, [dispatch]);

  useEffect(() => {
    dispatch(syncCart());
  }, [dispatch, userId]);

  return null;
}
