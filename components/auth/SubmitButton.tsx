"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SubmitButtonProps {
  isLoading: boolean;
  defaultText: string; // e.g. "Sign In", "Create Account"
  loadingText?: string; // e.g. "Signing In...", "Creating Account..."
}

export function SubmitButton({
  isLoading,
  defaultText,
  loadingText,
}: SubmitButtonProps) {
  return (
    <Button type="submit" className="w-full" disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText ?? "Processing..."}
        </>
      ) : (
        defaultText
      )}
    </Button>
  );
}
