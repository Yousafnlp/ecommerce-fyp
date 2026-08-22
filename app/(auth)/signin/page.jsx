import { BackToHome } from "@/components/auth/signin/back-to-home";
import { SignInCard } from "@/components/auth/signin/sign-in-card";
import { SignInLogo } from "@/components/auth/signin/sign-in-logo";
import { SignUpLink } from "@/components/auth/signin/sign-up-link";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <SignInLogo />
        <SignInCard />
        <SignUpLink />
        <BackToHome />
      </div>
    </div>
  );
}
