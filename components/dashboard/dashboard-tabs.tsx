"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OverviewTab from "./tabs/overview-tab";
import OrdersTab from "./tabs/orders-tab";
import WishlistTab from "./tabs/wishlist-tab";
import SettingsTab from "./tabs/settings-tab";
import type { User } from "@/lib/types";

export function DashboardTabs({ user }: { user: User }) {
  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="orders">Orders</TabsTrigger>
        <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <OverviewTab />
      </TabsContent>

      <TabsContent value="orders">
        <OrdersTab />
      </TabsContent>

      <TabsContent value="wishlist">
        <WishlistTab />
      </TabsContent>

      <TabsContent value="settings">
        <SettingsTab user={user} />
      </TabsContent>
    </Tabs>
  );
}
