import { DashboardOverview } from "@/components/admin/dashboard-overview";

export const metadata = {
  title: "Dashboard · Admin · SpecSmart",
  description: "Store overview with product, user, order and revenue stats.",
};

export default function AdminDashboardPage() {
  return <DashboardOverview />;
}
