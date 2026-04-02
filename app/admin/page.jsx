import { ProtectedRoute } from "@/components/auth/protected-route";
import { AdminPanel } from "@/components/admin/admin-panel";

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <AdminPanel />
    </ProtectedRoute>
  );
}
