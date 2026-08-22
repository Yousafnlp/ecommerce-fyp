"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ShieldCheck,
  ShieldOff,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useAppSelector } from "@/store/hooks";
import { useToast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableEmpty,
  AdminTableHead,
  AdminTableHeader,
  AdminTableRow,
} from "@/components/admin/admin-table";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoading,
} from "@/components/admin/admin-states";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

/**
 * A pending action is { kind, user, title, description, confirmLabel }.
 * kinds: demote | disable | delete — all destructive; promote/enable run directly.
 */
export function UsersManager() {
  const router = useRouter();
  const toast = useToast();
  const currentUser = useAppSelector((state) => state.auth.user);

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Row-level busy flag so a mutation disables only its own controls.
  const [busyUserId, setBusyUserId] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [isActing, setIsActing] = useState(false);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const data = await apiClient.getAdminUsers();
      setUsers(data || []);
    } catch (err) {
      setLoadError(err.message || "Could not load users.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const visibleUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((user) => {
      if (roleFilter !== "all" && user.role !== roleFilter) return false;
      if (statusFilter !== "all" && user.status !== statusFilter) return false;
      if (!query) return true;
      return (
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
      );
    });
  }, [users, search, roleFilter, statusFilter]);

  const isSelf = (user) => user.id === currentUser?.id;

  const executeAction = useCallback(
    async (kind, user) => {
      if (!kind || !user || isActing) return;
      setBusyUserId(user.id);
      setIsActing(true);
      const name = user.name || user.email;

      try {
        if (kind === "promote") await apiClient.updateUserRole(user.id, "admin");
        if (kind === "demote") await apiClient.updateUserRole(user.id, "user");
        if (kind === "enable") await apiClient.updateUserStatus(user.id, "active");
        if (kind === "disable") await apiClient.updateUserStatus(user.id, "disabled");
        if (kind === "delete") await apiClient.deleteUser(user.id);

        toast.success(
          {
            promote: `${name} is now an admin.`,
            demote: `${name} is no longer an admin.`,
            enable: `${name}'s account was re-enabled.`,
            disable: `${name}'s account was disabled.`,
            delete: `${name}'s account was deleted.`,
          }[kind]
        );
        setPendingAction(null);
        await loadUsers();
        router.refresh();
      } catch (err) {
        toast.error(err.message || "The action could not be completed.");
      } finally {
        setIsActing(false);
        setBusyUserId(null);
      }
    },
    [isActing, loadUsers, router, toast]
  );

  /**
   * Destructive kinds open the confirmation dialog first; safe kinds
   * (promote/enable) run immediately.
   */
  const DESTRUCTIVE_ACTIONS = {
    demote: (user) => ({
      title: `Revoke admin access for ${user.name || user.email}?`,
      description: (
        <>
          <strong>{user.name || user.email}</strong> will lose access to this console but keeps
          their customer account.
        </>
      ),
      confirmLabel: "Revoke admin",
    }),
    disable: (user) => ({
      title: `Disable ${user.name || user.email}'s account?`,
      description: (
        <>
          <strong>{user.name || user.email}</strong> will be signed out and blocked from signing
          in until the account is re-enabled.
        </>
      ),
      confirmLabel: "Disable account",
    }),
    delete: (user) => ({
      title: `Delete ${user.name || user.email}'s account?`,
      description: (
        <>
          Permanently delete <strong>{user.name || user.email}</strong> ({user.email})? Their
          order history and cart are removed with the account. This cannot be undone.
        </>
      ),
      confirmLabel: "Delete account",
    }),
  };

  const requestAction = (kind, user) => {
    const destructive = DESTRUCTIVE_ACTIONS[kind];
    if (destructive) {
      setPendingAction({ kind, user, ...destructive(user) });
    } else {
      executeAction(kind, user);
    }
  };

  const renderActionButton = (user, action) => {
    if (isSelf(user)) return null;
    const busy = busyUserId === user.id && isActing;
    const config = {
      promote: { label: "Make admin", icon: ShieldCheck },
      demote: { label: "Revoke admin", icon: ShieldOff },
      disable: { label: "Disable", icon: UserX },
      enable: { label: "Enable", icon: UserCheck },
    }[action];

    const Icon = config.icon;
    return (
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        disabled={busy}
        aria-label={`${config.label} ${user.name || user.email}`}
        onClick={() => requestAction(action, user)}
      >
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {config.label}
      </Button>
    );
  };

  return (
    <>
      <AdminPageHeader
        title="Users"
        description="Every account registered on the store. Promote trusted teammates to admin, disable accounts that misbehave, or remove accounts entirely."
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            className="pl-9"
            placeholder="Search by name or email…"
            aria-label="Search users"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          aria-label="Filter by role"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">All roles</option>
          <option value="admin">Admins</option>
          <option value="user">Customers</option>
        </select>
        <select
          className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          aria-label="Filter by status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="disabled">Disabled</option>
        </select>
      </div>

      {isLoading ? (
        <AdminLoading label="Loading users…" />
      ) : loadError ? (
        <AdminErrorState message={loadError} onRetry={loadUsers} />
      ) : (
        <AdminTable ariaLabel="Registered users">
          <AdminTableHead>
            <AdminTableHeader>User</AdminTableHeader>
            <AdminTableHeader>Role</AdminTableHeader>
            <AdminTableHeader>Status</AdminTableHeader>
            <AdminTableHeader>Orders</AdminTableHeader>
            <AdminTableHeader>Joined</AdminTableHeader>
            <AdminTableHeader className="text-right">Actions</AdminTableHeader>
          </AdminTableHead>
          <AdminTableBody>
            {visibleUsers.length === 0 ? (
              <AdminTableEmpty colSpan={6}>
                No users match your filters.
              </AdminTableEmpty>
            ) : (
              visibleUsers.map((user) => (
                <AdminTableRow key={user.id}>
                  <AdminTableCell>
                    <div className="flex items-center gap-3 min-w-[200px]">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} alt="" />
                        <AvatarFallback>
                          {(user.name || user.email || "?")
                            .split(" ")
                            .map((part) => part[0])
                            .filter(Boolean)
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium truncate max-w-[220px]">
                          {user.name || "Unnamed"}
                          {isSelf(user) ? (
                            <span className="ml-2 text-xs font-normal text-muted-foreground">
                              (you)
                            </span>
                          ) : null}
                        </p>
                        <p className="text-xs text-muted-foreground truncate max-w-[220px]">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </AdminTableCell>
                  <AdminTableCell>
                    <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                      {user.role}
                    </Badge>
                  </AdminTableCell>
                  <AdminTableCell>
                    <Badge variant={user.status === "disabled" ? "destructive" : "outline"}>
                      {user.status}
                    </Badge>
                  </AdminTableCell>
                  <AdminTableCell>{user.orderCount}</AdminTableCell>
                  <AdminTableCell className="whitespace-nowrap">
                    {formatDate(user.createdAt)}
                  </AdminTableCell>
                  <AdminTableCell>
                    {isSelf(user) ? (
                      <p className="text-xs text-muted-foreground text-right">
                        You can’t modify your own account
                      </p>
                    ) : (
                      <div className="flex justify-end gap-1.5">
                        {user.role === "admin"
                          ? renderActionButton(user, "demote")
                          : renderActionButton(user, "promote")}
                        {user.status === "active"
                          ? renderActionButton(user, "disable")
                          : renderActionButton(user, "enable")}
                        <Button
                          variant="destructive"
                          size="sm"
                          className="gap-1.5"
                          disabled={busyUserId === user.id && isActing}
                          aria-label={`Delete ${user.name || user.email}`}
                          onClick={() => requestAction("delete", user)}
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </AdminTableCell>
                </AdminTableRow>
              ))
            )}
          </AdminTableBody>
        </AdminTable>
      )}

      {!isLoading && !loadError && visibleUsers.length > 0 ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Showing {visibleUsers.length} of {users.length} accounts. Passwords are never shown or
          stored in plain form anywhere in this console.
        </p>
      ) : null}

      <ConfirmDialog
        open={Boolean(pendingAction)}
        title={pendingAction?.title || ""}
        description={pendingAction?.description}
        confirmLabel={pendingAction?.confirmLabel}
        destructive
        pending={isActing}
        onConfirm={() => executeAction(pendingAction.kind, pendingAction.user)}
        onCancel={() => {
          if (!isActing) {
            setPendingAction(null);
          }
        }}
      />
    </>
  );
}
