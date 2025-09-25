import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React from "react";

const OrdersTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order History</CardTitle>
        <CardDescription>Track and manage your orders</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Order history will be displayed here.
        </p>
      </CardContent>
    </Card>
  );
};

export default OrdersTab;
