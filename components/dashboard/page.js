import { UserDashboard } from "@/components/dashboard/user-dashboard";
import { ProtectedRoute } from "@/components/auth/protected-route";
export default function DashboardPage() {
  return <ProtectedRoute>
      <UserDashboard />
    </ProtectedRoute>;
}