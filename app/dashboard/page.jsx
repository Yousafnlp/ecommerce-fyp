import { UserDashboard } from "@/components/dashboard/user-dashboard";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default async function DashboardPage({ searchParams }) {
  const params = await searchParams;
  return (
    <ProtectedRoute>
      <UserDashboard initialTab={params.tab || "overview"} />
    </ProtectedRoute>
  );
}
