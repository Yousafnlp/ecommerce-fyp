"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { Button } from "@/components/ui/button";

/**
 * Client-side gate for every /admin page. Real authorization is enforced
 * server-side by `requireAdmin` on each API call; this only shapes the UI.
 */
export function AdminGuard({ children }) {
  const user = useAppSelector((state) => state.auth.user);
  const isLoading = useAppSelector((state) => state.auth.isLoading);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/signin");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center" role="status">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" aria-hidden="true" />
          <p className="text-muted-foreground">Checking access…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div
          className="max-w-md w-full rounded-xl border border-border bg-card p-8 text-center shadow-sm"
          role="alert"
        >
          <ShieldAlert className="w-10 h-10 mx-auto mb-4 text-destructive" aria-hidden="true" />
          <h1 className="text-xl font-bold mb-2">Admin access required</h1>
          <p className="text-sm text-muted-foreground mb-6">
            You are signed in as{" "}
            <span className="font-medium text-foreground">{user.email}</span>, which is not an
            administrator account. Ask an existing admin to promote your account.
          </p>
          <Button asChild variant="outline">
            <Link href="/">Back to store</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
