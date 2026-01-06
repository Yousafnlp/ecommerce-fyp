"use client";
import { useDispatch, useSelector } from "react-redux";

export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

// Convenience re-exports
export { default as store } from "@/store";
