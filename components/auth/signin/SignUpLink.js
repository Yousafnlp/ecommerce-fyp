import Link from "next/link";
export function SignUpLink() {
  return <div className="text-center">
      <p className="text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/auth/signup" className="text-primary hover:underline font-medium">
          Sign up for free
        </Link>
      </p>
    </div>;
}