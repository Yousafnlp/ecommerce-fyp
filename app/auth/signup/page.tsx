import { SignUpForm } from "@/components/auth/signup-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold">S</span>
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-foreground">SpecSmart</h1>
              <p className="text-xs text-muted-foreground">
                Smarter Choices. Sharper Tech
              </p>
            </div>
          </Link>
        </div>

        {/* Sign Up Form */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Create Your Account</CardTitle>
            <CardDescription>
              Join SpecSmart to get AI-powered product recommendations and smart
              comparisons
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignUpForm />
          </CardContent>
        </Card>

        {/* Sign In Link */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/auth/signin"
              className="text-primary hover:underline font-medium"
            >
              Sign in here
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <Link href="/">
            <Button variant="ghost" size="sm">
              ← Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
