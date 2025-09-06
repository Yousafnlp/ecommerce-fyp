import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React from "react";

const WishlistTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Wishlist</CardTitle>
        <CardDescription>Products you want to buy later</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Your wishlist items will be displayed here.
        </p>
      </CardContent>
    </Card>
  );
};

export default WishlistTab;
