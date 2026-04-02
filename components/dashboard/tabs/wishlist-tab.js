import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import React from "react";
const WishlistTab = ({
  products = []
}) => {
  return <Card>
      <CardHeader>
        <CardTitle>Your Wishlist</CardTitle>
        <CardDescription>Products you want to buy later</CardDescription>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? <p className="text-muted-foreground">
            Your liked products will appear here.
          </p> : <div className="space-y-4">
            {products.map(product => <Link key={product.id} href={`/products/${product.category}/${product.id}`} className="flex items-center gap-4 rounded-lg border p-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-muted">
                  <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">{product.brand}</p>
                </div>
                <Badge>Score {product.score}</Badge>
              </Link>)}
          </div>}
      </CardContent>
    </Card>;
};
export default WishlistTab;
