"use client";

import { useEffect, useState } from "react";
import { useAppSelector } from "@/lib/redux";
import { Database } from "@/lib/database";
import { AuthenticatedHeader } from "../layout/authenticated-header";
import { WelcomeSection } from "./welcome-section";
import { QuickStats } from "./quick-stats";
import { DashboardTabs } from "./dashboard-tabs";
export function UserDashboard({
  initialTab = "overview"
}) {
  const user = useAppSelector((s) => s.auth.user);
  const [commerce, setCommerce] = useState({
    cart: [],
    wishlist: [],
    orders: [],
    cartProducts: [],
    wishlistProducts: [],
    orderedProducts: [],
  });
  const [adminOrders, setAdminOrders] = useState([]);
  const [adminSummary, setAdminSummary] = useState({
    totalOrders: 0,
    totalItems: 0,
    totalRevenue: 0,
    totalCustomers: 0,
  });

  useEffect(() => {
    if (!user) return;

    Database.getCommerceData().then(setCommerce);
    if (user.role === "admin") {
      Database.getAdminOrderedProducts().then(setAdminOrders);
      Database.getAdminOrderSummary().then(setAdminSummary);
    }
  }, [user]);

  if (!user) return null;
  return (
    <div className="min-h-screen bg-background">
      <AuthenticatedHeader />
      <div className="container mx-auto px-4 py-8">
        <WelcomeSection name={user.name} avatar={user.avatar} />
        <QuickStats
          wishlistCount={user.role === "admin" ? adminSummary.totalCustomers : commerce.wishlist.length}
          orderCount={user.role === "admin" ? adminSummary.totalOrders : commerce.orders.length}
          totalSpent={user.role === "admin"
            ? adminSummary.totalRevenue
            : commerce.orders.reduce(
                (sum, order) => sum + (order.totals?.total || 0),
                0
              )}
          totalItems={user.role === "admin" ? adminSummary.totalItems : commerce.orders.reduce((sum, order) => sum + (order.items?.length || 0), 0)}
          isAdmin={user.role === "admin"}
        />
        <DashboardTabs
          user={user}
          commerce={commerce}
          adminOrders={adminOrders}
          adminSummary={adminSummary}
          initialTab={initialTab}
        />
      </div>
    </div>
  );
}
