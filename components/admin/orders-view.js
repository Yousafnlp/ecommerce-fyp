"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Search } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { formatPrice } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/admin/stat-card";
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

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

const STATUS_VARIANT = {
  Placed: "default",
  Shipped: "secondary",
  Delivered: "outline",
};

export function OrdersView() {
  const [summary, setSummary] = useState(null);
  const [orderedProducts, setOrderedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const [summaryData, orderedData] = await Promise.all([
        apiClient.getAdminOrderSummary(),
        apiClient.getAdminOrderedProducts(),
      ]);
      setSummary(summaryData);
      setOrderedProducts(orderedData || []);
    } catch (err) {
      setLoadError(err.message || "Could not load orders.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const visibleItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return orderedProducts;
    return orderedProducts.filter((item) =>
      [
        item.orderId,
        item.customerName,
        item.customerEmail,
        item.name,
        item.brand,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [orderedProducts, search]);

  return (
    <>
      <AdminPageHeader
        title="Orders"
        description="Every order customers have placed, with a live revenue summary. Order records are stored with each customer account."
      />

      {summary ? (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total orders" value={summary.totalOrders} />
          <StatCard label="Items sold" value={summary.totalItems} />
          <StatCard label="Revenue" value={formatPrice(summary.totalRevenue)} />
          <StatCard label="Customers with orders" value={summary.totalCustomers} />
        </div>
      ) : null}

      <div className="mb-4">
        <div className="relative max-w-md">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            className="pl-9"
            placeholder="Search by order ID, customer or product…"
            aria-label="Search orders"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <AdminLoading label="Loading orders…" />
      ) : loadError ? (
        <AdminErrorState message={loadError} onRetry={loadOrders} />
      ) : (
        <AdminTable ariaLabel="Ordered products">
          <AdminTableHead>
            <AdminTableHeader>Order</AdminTableHeader>
            <AdminTableHeader>Date</AdminTableHeader>
            <AdminTableHeader>Customer</AdminTableHeader>
            <AdminTableHeader>Product</AdminTableHeader>
            <AdminTableHeader>Qty</AdminTableHeader>
            <AdminTableHeader>Price</AdminTableHeader>
            <AdminTableHeader>Status</AdminTableHeader>
          </AdminTableHead>
          <AdminTableBody>
            {visibleItems.length === 0 ? (
              <AdminTableEmpty colSpan={7}>
                {orderedProducts.length === 0
                  ? "No orders have been placed yet. They will appear here as soon as customers check out."
                  : "No order lines match your search."}
              </AdminTableEmpty>
            ) : (
              visibleItems.map((item) => (
                <AdminTableRow key={`${item.orderId}-${item.productId}`}>
                  <AdminTableCell className="font-mono text-xs whitespace-nowrap">
                    {item.orderId}
                  </AdminTableCell>
                  <AdminTableCell className="whitespace-nowrap text-muted-foreground">
                    {formatDate(item.orderedAt)}
                  </AdminTableCell>
                  <AdminTableCell>
                    <p className="font-medium">{item.customerName || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">{item.customerEmail}</p>
                  </AdminTableCell>
                  <AdminTableCell>
                    <div className="flex items-center gap-2 min-w-[160px]">
                      <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded border border-border bg-muted">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt=""
                          fill
                          sizes="32px"
                          className="object-cover"
                        />
                      </div>
                      <span className="truncate max-w-[220px]">{item.name}</span>
                    </div>
                  </AdminTableCell>
                  <AdminTableCell>{item.quantity}</AdminTableCell>
                  <AdminTableCell className="whitespace-nowrap font-medium">
                    {formatPrice(item.price)}
                  </AdminTableCell>
                  <AdminTableCell>
                    <Badge variant={STATUS_VARIANT[item.orderStatus] || "outline"}>
                      {item.orderStatus}
                    </Badge>
                  </AdminTableCell>
                </AdminTableRow>
              ))
            )}
          </AdminTableBody>
        </AdminTable>
      )}

      {!isLoading && !loadError && visibleItems.length > 0 ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Showing {visibleItems.length} of {orderedProducts.length} order lines.
        </p>
      ) : null}
    </>
  );
}
