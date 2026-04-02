import { Card, CardContent } from "@/components/ui/card";
import { Heart, Package, Star, TrendingUp } from "lucide-react";
export function QuickStats({
  wishlistCount = 0,
  orderCount = 0,
  totalSpent = 0,
  totalItems = 0,
  isAdmin = false
}) {
  const stats = [{
    icon: Heart,
    label: isAdmin ? "Customers" : "Wishlist Items",
    value: wishlistCount
  }, {
    icon: Package,
    label: "Total Orders",
    value: orderCount
  }, {
    icon: Star,
    label: isAdmin ? "Items Ordered" : "Items Bought",
    value: totalItems
  }, {
    icon: TrendingUp,
    label: isAdmin ? "Order Revenue" : "Total Spent",
    value: `$${Number(totalSpent).toFixed(2)}`
  }];
  return <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {stats.map(({
      icon: Icon,
      label,
      value
    }) => <Card key={label}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
            </div>
          </CardContent>
        </Card>)}
    </div>;
}
