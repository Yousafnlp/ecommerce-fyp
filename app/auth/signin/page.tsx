import { SignInForm } from "@/components/auth/signin-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SignInPage() {
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
              <p className="text-xs text-muted-foreground">Smarter Choices. Sharper Tech</p>
            </div>
          </Link>
        </div>

        {/* Sign In Form */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your account to continue shopping and get personalized recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignInForm />
          </CardContent>
        </Card>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-primary hover:underline font-medium">
              Sign up for free
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
  )
}
