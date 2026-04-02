"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OverviewTab from "./tabs/overview-tab";
import OrdersTab from "./tabs/orders-tab";
import WishlistTab from "./tabs/wishlist-tab";
import SettingsTab from "./tabs/settings-tab";
export function DashboardTabs({
  user,
  commerce,
  adminOrders,
  adminSummary,
  initialTab = "overview"
}) {
  return <Tabs defaultValue={initialTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="orders">Orders</TabsTrigger>
        <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <OverviewTab orders={commerce.orders} wishlistProducts={commerce.wishlistProducts} user={user} adminOrders={adminOrders} adminSummary={adminSummary} />
      </TabsContent>

      <TabsContent value="orders">
        <OrdersTab orders={commerce.orders} adminOrders={adminOrders} user={user} adminSummary={adminSummary} />
      </TabsContent>

      <TabsContent value="wishlist">
        <WishlistTab products={commerce.wishlistProducts} />
      </TabsContent>

      <TabsContent value="settings">
        <SettingsTab user={user} />
      </TabsContent>
    </Tabs>;
}
