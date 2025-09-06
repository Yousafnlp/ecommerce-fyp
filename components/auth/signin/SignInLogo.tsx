import Link from "next/link";

export function SignInLogo() {
  return (
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
  );
}
