"use client";

import { useAuth } from "@/lib/auth-context";
import { AuthenticatedHeader } from "../layout/authenticated-header";
import { WelcomeSection } from "./welcome-section";
import { QuickStats } from "./quick-stats";
import { DashboardTabs } from "./dashboard-tabs";
export function UserDashboard() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <div className="min-h-screen bg-background">
      <AuthenticatedHeader />
      <div className="container mx-auto px-4 py-8">
        <WelcomeSection name={user.name} avatar={user.avatar} />
        <QuickStats />
        <DashboardTabs user={user} />
      </div>
    </div>
  );
}
