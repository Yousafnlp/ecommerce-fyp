import { UsersManager } from "@/components/admin/users-manager";

export const metadata = {
  title: "Users · Admin · SpecSmart",
  description: "Manage accounts, roles and status.",
};

export default function AdminUsersPage() {
  return <UsersManager />;
}
