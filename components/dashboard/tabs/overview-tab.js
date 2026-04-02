import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
const OverviewTab = ({
  orders = [],
  wishlistProducts = [],
  user,
  adminOrders = [],
  adminSummary = {
    totalOrders: 0,
    totalItems: 0,
    totalRevenue: 0,
    totalCustomers: 0
  }
}) => {
  const recentOrders = orders.slice(0, 2);
  const recommended = wishlistProducts.slice(0, 2);
  return <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Your latest purchases</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentOrders.length === 0 ? <p className="text-sm text-muted-foreground">No orders yet.</p> : recentOrders.map(order => <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{order.items[0]?.name || "Order"}</p>
                    <p className="text-sm text-muted-foreground">{order.id}</p>
                  </div>
                  <Badge>{order.status}</Badge>
                </div>)}
          </div>
          <Link href="/dashboard?tab=orders">
            <Button variant="outline" className="w-full mt-4 bg-transparent">
              View All Orders
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended for You</CardTitle>
          <CardDescription>Based on your preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommended.length === 0 ? <p className="text-sm text-muted-foreground">Like products to build recommendations.</p> : recommended.map(product => <div key={product.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-12 h-12 bg-muted rounded-lg" />
                  <div className="flex-1">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">${product.price}</p>
                  </div>
                  <Badge>Score: {product.score}</Badge>
                </div>)}
          </div>
          <Link href="/products">
            <Button variant="outline" className="w-full mt-4 bg-transparent">
              Browse Products
            </Button>
          </Link>
        </CardContent>
      </Card>

      {user?.role === "admin" && <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Admin Snapshot</CardTitle>
            <CardDescription>
              {adminSummary.totalOrders} total orders across {adminSummary.totalCustomers} customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {adminOrders.slice(0, 4).map((item, index) => <div key={`${item.orderId}-${item.productId}-${index}`} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.customerEmail}</p>
                  </div>
                  <Badge>x{item.quantity}</Badge>
                </div>)}
            </div>
          </CardContent>
        </Card>}
    </div>;
};
export default OverviewTab;
