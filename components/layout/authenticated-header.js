"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { signOut } from "@/store/slices/auth-slice";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Zap,
  User,
  Settings,
  LogOut,
  ShoppingCart,
  Shield,
  Menu as Hamburger,
  LogIn,
  Rocket,
  GitCompare,
} from "lucide-react";
import { selectTotalItems } from "@/store/slices/cart-slice";
import { selectCompareCount } from "@/store/slices/compare-slice";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeMenuItem } from "../theme/theme-toggle-dropdown";
import { ThemeToggleButton } from "../theme/theme-toggle-button";
export function AuthenticatedHeader() {
  const dispatch = useAppDispatch();
  const totalItems = useAppSelector(selectTotalItems);
  const compareCount = useAppSelector(selectCompareCount);
  const user = useAppSelector((s) => s.auth.user);
  const router = useRouter();

  // Auth state (user, cart count) only exists on the client, so the header
  // would render a different tree on the server (logged out) than on the
  // client (logged in), causing a React hydration error. Rendering a stable
  // placeholder until the client mounts keeps both trees identical.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    await dispatch(signOut());
    router.push("/");
  };
  return (
    <header className="border-b border-border/60 bg-background/70 backdrop-blur-xl sticky top-0 z-50 supports-[backdrop-filter]:bg-background/60">
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-brand opacity-40" />
      <div className="container mx-auto px-4 py-3.5">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-brand rounded-xl flex items-center justify-center shadow-[var(--shadow-glow)] transition-transform duration-200 group-hover:scale-105">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground leading-tight">SpecSmart</h1>
              <p className="text-[11px] text-muted-foreground leading-tight">
                Smarter Choices. Sharper Tech
              </p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1.5">
            <Link
              href="/products"
              className="text-sm font-medium px-3.5 py-2 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Products
            </Link>
            <Link
              href="/search"
              className="text-sm font-medium px-3.5 py-2 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Search
            </Link>
            <Link
              href="/compare"
              className="relative text-sm font-medium px-3.5 py-2 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Compare
              {compareCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-brand text-white text-[10px] font-semibold rounded-full min-w-4 h-4 px-1 flex items-center justify-center shadow-[var(--shadow-card)] animate-scale-in">
                  {compareCount}
                </span>
              )}
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            {mounted ? (
              user ? (
                <>
                  <Link href="/cart">
                    <Button
                      variant="outline"
                      size="sm"
                      className="relative bg-transparent"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />

                      {totalItems > 0 && (
                        <span className="absolute -top-2 -right-2 bg-gradient-brand text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-[var(--shadow-card)] animate-scale-in">
                          {totalItems}
                        </span>
                      )}
                    </Button>
                  </Link>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-8 w-8 rounded-full ring-2 ring-transparent transition-all hover:ring-ring/40"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={user.avatar || "/placeholder.svg"}
                            alt={user.name}
                          />
                          <AvatarFallback>
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                      <div className="flex items-center justify-start gap-2 p-2">
                        <div className="flex flex-col space-y-1 leading-none">
                          <p className="font-medium">{user.name}</p>
                          <p className="w-[200px] truncate text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard">
                          <User className="mr-2 h-4 w-4" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      {user.role === "admin" ? (
                        <DropdownMenuItem asChild>
                          <Link href="/admin">
                            <Shield className="mr-2 h-4 w-4" />
                            Admin Panel
                          </Link>
                        </DropdownMenuItem>
                      ) : null}
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard?tab=settings">
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      <ThemeMenuItem />
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Link href="/cart">
                    <Button
                      variant="outline"
                      size="sm"
                      className="relative bg-transparent"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />

                      {totalItems > 0 && (
                        <span className="absolute -top-2 -right-2 bg-gradient-brand text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-[var(--shadow-card)] animate-scale-in">
                          {totalItems}
                        </span>
                      )}
                    </Button>
                  </Link>

                  <div className="hidden lg:flex items-center gap-2">
                    <ThemeToggleButton />
                    <Link href="/signin">
                      <Button variant="outline" size="sm">
                        Sign In
                      </Button>
                    </Link>
                  </div>
                  <Link href="/signup">
                    <Button size="sm">Get Started</Button>
                  </Link>

                  <div className="flex lg:hidden items-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          aria-label="Menu"
                        >
                          <Hamburger className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent className="w-56" align="end">
                        <DropdownMenuItem asChild>
                          <Link href="/signin">
                            <LogIn className="mr-2 h-4 w-4" />
                            Sign In
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/compare">
                            <GitCompare className="mr-2 h-4 w-4" />
                            Compare
                            {compareCount > 0 ? ` (${compareCount})` : ""}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/signup">
                            <Rocket className="mr-2 h-4 w-4" /> Get Started
                          </Link>
                        </DropdownMenuItem>
                        <ThemeMenuItem />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </>
              )
            ) : (
              // Stable placeholder rendered on both the server and the first
              // client render — prevents hydration mismatches from auth state.
              <div className="flex items-center gap-2">
                <Link href="/cart">
                  <Button
                    variant="outline"
                    size="sm"
                    className="relative bg-transparent"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                  </Button>
                </Link>
                <div className="h-8 w-8 rounded-full" aria-hidden="true" />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
