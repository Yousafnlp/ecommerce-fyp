"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
export function ProtectedRoute({
  children
}) {
  const {
    user,
    isLoading
  } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/signin");
    }
  }, [user, isLoading, router]);
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>;
  }
  if (!user) {
    return null;
  }
  return <>{children}</>;
}