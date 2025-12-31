"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Minus, Plus, Star, Trash2 } from "lucide-react";
import Image from "next/image";
export function CartItem({
  product,
  updateQuantity,
  removeItem
}) {
  return <Card>
      <CardContent className="p-6">
        <div className="flex gap-4">
          <div className="w-24 h-24 relative overflow-hidden rounded-lg bg-muted flex-shrink-0">
            <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="text-xs capitalize">
                    {product.category}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {product.brand}
                  </Badge>
                </div>
                <h3 className="font-semibold text-lg line-clamp-2">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{product.rating}</span>
                  </div>
                  <Badge className="bg-primary text-xs">
                    Score: {product.score}
                  </Badge>
                </div>
              </div>

              <Button variant="ghost" size="sm" onClick={() => removeItem(product.id)} className="text-destructive hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center border rounded-lg">
                  <Button variant="ghost" size="sm" onClick={() => updateQuantity(product.id, product.quantity - 1)} disabled={product.quantity <= 1} className="h-8 w-8 p-0">
                    <Minus className="w-3 h-3" />
                  </Button>
                  <Input type="number" value={product.quantity} onChange={e => updateQuantity(product.id, Number.parseInt(e.target.value) || 1)} className="w-16 h-8 text-center border-0 focus-visible:ring-0" min="1" />
                  <Button variant="ghost" size="sm" onClick={() => updateQuantity(product.id, product.quantity + 1)} className="h-8 w-8 p-0">
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">
                  ${product.price} each
                </span>
              </div>

              <div className="text-right">
                <div className="text-lg font-bold">
                  ${(product.price * product.quantity).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>;
}