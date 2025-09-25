import { Button } from "@/components/ui/button";
import Link from "next/link";

export function BackToHome() {
  return (
    <div className="text-center">
      <Link href="/">
        <Button variant="ghost" size="sm">
          ← Back to Home
        </Button>
      </Link>
    </div>
  );
}
