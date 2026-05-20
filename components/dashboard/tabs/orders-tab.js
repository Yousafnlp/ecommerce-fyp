import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import React from "react";
import { formatPrice } from "@/lib/utils";
const OrdersTab = ({
  orders = [],
  adminOrders = [],
  user,
  adminSummary = {
    totalOrders: 0,
    totalItems: 0,
    totalRevenue: 0,
    totalCustomers: 0
  }
}) => {
  const customerSpent = orders.reduce((sum, order) => sum + (Number(order.totals?.total) || 0), 0);
  const customerItems = orders.reduce((sum, order) => sum + (order.items || []).reduce((acc, item) => acc + (Number(item.quantity) || 0), 0), 0);
  return <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{user?.role === "admin" ? adminSummary.totalOrders : orders.length}</CardTitle>
            <CardDescription>Total Orders</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{user?.role === "admin" ? adminSummary.totalItems : customerItems}</CardTitle>
            <CardDescription>Total Items</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{formatPrice(user?.role === "admin" ? adminSummary.totalRevenue : customerSpent)}</CardTitle>
            <CardDescription>{user?.role === "admin" ? "Total Revenue" : "Total Spent"}</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card>
      <CardHeader>
        <CardTitle>Order History</CardTitle>
        <CardDescription>Track and manage your orders</CardDescription>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? <p className="text-muted-foreground">
            You haven&apos;t placed any orders yet.
          </p> : <div className="space-y-4">
            {orders.map(order => <div key={order.id} className="rounded-lg border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{order.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Badge>{order.status}</Badge>
                </div>
                <div className="space-y-2">
                  {order.items.map(item => <div key={`${order.id}-${item.productId}`} className="flex items-center justify-between text-sm">
                      <span>
                        {item.name} x {item.quantity}
                      </span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>)}
                </div>
                <div className="mt-3 text-right font-semibold">
                  Total: {formatPrice(order.totals?.total || 0)}
                </div>
              </div>)}
          </div>}
      </CardContent>
    </Card>

      {user?.role === "admin" && <Card>
          <CardHeader>
            <CardTitle>Admin Ordered Products</CardTitle>
            <CardDescription>All products sold across customer orders</CardDescription>
          </CardHeader>
          <CardContent>
            {adminOrders.length === 0 ? <p className="text-muted-foreground">No ordered products found yet.</p> : <div className="space-y-3">
                {adminOrders.map((item, index) => <div key={`${item.orderId}-${item.productId}-${index}`} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-muted-foreground">
                        {item.customerName} • {item.customerEmail}
                      </p>
                    </div>
                    <div className="text-right">
                      <p>x{item.quantity}</p>
                      <p className="text-muted-foreground">{item.orderId}</p>
                    </div>
                  </div>)}
              </div>}
          </CardContent>
        </Card>}
    </div>;
};
export default OrdersTab;
