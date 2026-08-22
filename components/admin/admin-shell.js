"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Store,
  Menu,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, description: "Overview and quick stats" },
  { href: "/admin/products", label: "Products", icon: Package, description: "Create, edit and remove catalog items" },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart, description: "Everything customers have ordered" },
  { href: "/admin/users", label: "Users", icon: Users, description: "Accounts, roles and status" },
];

function isActive(pathname, href) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

function NavLinks({ pathname, onNavigate }) {
  return (
    <nav aria-label="Admin sections" className="space-y-1">
      {NAV_ITEMS.map(({ href, label, icon: Icon, description }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "bg-primary/10 text-primary font-semibold"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
            <span>
              <span className="block leading-tight">{label}</span>
              <span className="block text-xs text-muted-foreground leading-tight mt-0.5">
                {description}
              </span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminShell({ children }) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col border-r border-border bg-card/50 z-40">
        <div className="px-5 py-5 border-b border-border">
          <Link href="/admin" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-brand rounded-xl flex items-center justify-center shadow-[var(--shadow-glow)] transition-transform duration-200 group-hover:scale-105">
              <Zap className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <p className="font-bold leading-tight">SpecSmart Admin</p>
              <p className="text-[11px] text-muted-foreground leading-tight">Management console</p>
            </div>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Management
          </p>
          <NavLinks pathname={pathname} />
        </div>
        <div className="border-t border-border p-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Store className="w-4 h-4" aria-hidden="true" />
            View storefront
          </Link>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2 font-bold">
            <div className="w-8 h-8 bg-gradient-brand rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" aria-hidden="true" />
            </div>
            SpecSmart Admin
          </Link>
          <DropdownMenu open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open admin navigation menu">
                <Menu className="w-5 h-5" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
                <DropdownMenuItem key={href} asChild>
                  <Link href={href} aria-current={isActive(pathname, href) ? "page" : undefined}>
                    <Icon className="mr-2 h-4 w-4" aria-hidden="true" />
                    {label}
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem asChild>
                <Link href="/">
                  <Store className="mr-2 h-4 w-4" aria-hidden="true" />
                  View storefront
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="lg:pl-64">
        <div className="container mx-auto max-w-6xl px-4 py-8 lg:px-10">{children}</div>
      </main>
    </div>
  );
}
