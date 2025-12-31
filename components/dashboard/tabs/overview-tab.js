import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
const OverviewTab = () => {
  return <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Your latest purchases</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">iPhone 15 Pro</p>
                <p className="text-sm text-muted-foreground">Order #12345</p>
              </div>
              <Badge>Delivered</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">MacBook Pro 14&quot;</p>
                <p className="text-sm text-muted-foreground">Order #12344</p>
              </div>
              <Badge variant="secondary">Shipped</Badge>
            </div>
          </div>
          <Link href="/dashboard/orders">
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
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-12 h-12 bg-muted rounded-lg" />
              <div className="flex-1">
                <p className="font-medium">Samsung Galaxy S24</p>
                <p className="text-sm text-muted-foreground">$899</p>
              </div>
              {/* <Badge>Score: 94</Badge> */}
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-12 h-12 bg-muted rounded-lg" />
              <div className="flex-1">
                <p className="font-medium">Sony WH-1000XM5</p>
                <p className="text-sm text-muted-foreground">$399</p>
              </div>
              {/* <Badge>Score: 89</Badge> */}
            </div>
          </div>
          <Link href="/products">
            <Button variant="outline" className="w-full mt-4 bg-transparent">
              Browse Products
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>;
};
export default OverviewTab;