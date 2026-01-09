"use client";

import { useAppDispatch, useAppSelector } from "@/lib/redux";
import { signOut } from "@/store/slices/authSlice";
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
  Menu as Hamburger,
  LogIn,
  Rocket,
} from "lucide-react";
import { selectTotalItems } from "@/store/slices/cartSlice";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeMenuItem } from "../theme/theme-toggle-dropdown";
import { ThemeToggleButton } from "../theme/theme-toggle-button";
export function AuthenticatedHeader() {
  const dispatch = useAppDispatch();
  const totalItems = useAppSelector(selectTotalItems);
  const user = useAppSelector((s) => s.auth.user);
  const router = useRouter();
  const handleSignOut = async () => {
    await dispatch(signOut());
    router.push("/");
  };
  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">SpecSmart</h1>
              <p className="text-xs text-muted-foreground">
                Smarter Choices. Sharper Tech
              </p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/products"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Products
            </Link>
            <Link
              href="/search"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Search
            </Link>
            <Link
              href="/advisor"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              AI Advisor
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link href="/cart">
                  <Button
                    variant="outline"
                    size="sm"
                    className="relative bg-transparent"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />

                    {totalItems > 0 && (
                      <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {totalItems}
                      </span>
                    )}
                  </Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
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
                  <DropdownMenuContent className="w-56" align="end" forceMount>
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
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard?tab=settings">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <ThemeMenuItem />
                    </DropdownMenuItem>
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
                      <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {totalItems}
                      </span>
                    )}
                  </Button>
                </Link>

                <div className="hidden lg:flex items-center gap-2">
                  <ThemeToggleButton />
                  <Link href="/auth/signin">
                    <Button variant="outline" size="sm">
                      Sign In
                    </Button>
                  </Link>
                </div>
                <Link href="/auth/signup">
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

                    <DropdownMenuContent
                      className="w-56"
                      align="end"
                      forceMount
                    >
                      <DropdownMenuItem asChild>
                        <Link href="/auth/signin">
                          <LogIn className="mr-2 h-4 w-4" />
                          Sign In
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/auth/signup">
                          <Rocket className="mr-2 h-4 w-4" /> Get Started
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <ThemeMenuItem />
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
