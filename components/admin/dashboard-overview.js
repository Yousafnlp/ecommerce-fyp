"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  DollarSign,
  Package,
  PackagePlus,
  ShoppingCart,
  Users,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/admin/stat-card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminErrorState, AdminLoading } from "@/components/admin/admin-states";

const QUICK_ACTIONS = [
  {
    href: "/admin/products/new",
    title: "Add a product",
    description: "Create a new catalog item with specs, pricing and imagery.",
    icon: PackagePlus,
  },
  {
    href: "/admin/orders",
    title: "Review orders",
    description: "See what customers bought and how much revenue came in.",
    icon: ShoppingCart,
  },
  {
    href: "/admin/users",
    title: "Manage users",
    description: "Promote admins, disable or remove accounts.",
    icon: Users,
  },
];

export function DashboardOverview() {
  const [data, setData] = useState({
    productCount: null,
    outOfStockCount: null,
    userStats: null,
    orderSummary: null,
    recentProducts: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      // Each source fails independently — a broken endpoint should not blank
      // the whole dashboard.
      const [products, userStats, orderSummary] = await Promise.allSettled([
        apiClient.getProducts({ sortBy: "newest", sortOrder: "desc" }),
        apiClient.getAdminUserStats(),
        apiClient.getAdminOrderSummary(),
      ]);

      const productList = products.status === "fulfilled" ? products.value || [] : [];
      setData({
        productCount: productList.length,
        outOfStockCount: productList.filter((product) => !product.inStock).length,
        recentProducts: productList.slice(0, 5),
        userStats: userStats.status === "fulfilled" ? userStats.value : null,
        orderSummary: orderSummary.status === "fulfilled" ? orderSummary.value : null,
      });

      if (products.status === "rejected") {
        setLoadError("Some dashboard data could not be loaded.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description="A quick health check of your store. Use the sections on the left to manage products, orders and users."
        actions={
          <Button asChild variant="outline">
            <Link href="/">
              View storefront
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <AdminLoading label="Loading store stats…" />
      ) : (
        <>
          {loadError ? (
            <div className="mb-6">
              <AdminErrorState message={loadError} onRetry={loadDashboard} />
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Products"
              value={data.productCount ?? "—"}
              hint={
                data.outOfStockCount
                  ? `${data.outOfStockCount} out of stock`
                  : "All items in stock"
              }
              icon={Package}
              href="/admin/products"
            />
            <StatCard
              label="Users"
              value={data.userStats ? data.userStats.totalUsers : "—"}
              hint={
                data.userStats
                  ? `${data.userStats.totalAdmins} admin${data.userStats.totalAdmins === 1 ? "" : "s"} · ${data.userStats.activeUsers} active`
                  : undefined
              }
              icon={Users}
              href="/admin/users"
            />
            <StatCard
              label="Orders"
              value={data.orderSummary ? data.orderSummary.totalOrders : "—"}
              hint={
                data.orderSummary
                  ? `${data.orderSummary.totalCustomers} customer${data.orderSummary.totalCustomers === 1 ? "" : "s"} with orders`
                  : undefined
              }
              icon={ShoppingCart}
              href="/admin/orders"
            />
            <StatCard
              label="Revenue"
              value={data.orderSummary ? formatPrice(data.orderSummary.totalRevenue) : "—"}
              hint="All-time total"
              icon={DollarSign}
              href="/admin/orders"
            />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-5">
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Recently added products</CardTitle>
                <CardDescription>
                  The newest catalog items. Open any product to edit its details.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.recentProducts.length === 0 ? (
                  <p className="py-4 text-sm text-muted-foreground">
                    No products yet — create your first one.
                  </p>
                ) : (
                  data.recentProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">{product.name}</p>
                        <p className="text-xs capitalize text-muted-foreground">
                          {product.brand} · {product.category}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <span className="text-sm font-semibold">
                          {formatPrice(product.price)}
                        </span>
                        <Button asChild variant="outline" size="sm">
                          <Link
                            href={`/admin/products/${encodeURIComponent(product.id)}/edit`}
                            aria-label={`Edit ${product.name}`}
                          >
                            Edit
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))
                )}
                <Button asChild variant="ghost" size="sm" className="mt-2 gap-1">
                  <Link href="/admin/products">
                    Go to all products
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Quick actions</CardTitle>
                <CardDescription>Common tasks, one click away.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {QUICK_ACTIONS.map(({ href, title, description, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="group flex items-start gap-3 rounded-lg border border-border px-3 py-3 transition-colors hover:border-primary/40 hover:bg-accent/40 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Icon
                      className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    <span>
                      <span className="block text-sm font-medium group-hover:text-primary">
                        {title}
                      </span>
                      <span className="block text-xs text-muted-foreground">{description}</span>
                    </span>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </>
  );
}
