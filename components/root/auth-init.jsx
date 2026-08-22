"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { initAuth } from "@/store/slices/auth-slice";
import { syncCart } from "@/store/slices/cart-slice";

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
