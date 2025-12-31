"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
export const ProductSuggestionCard = ({
  id,
  name,
  brand,
  price
}) => {
  return <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-muted rounded-lg flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{name}</h3>
            <p className="text-sm text-muted-foreground">{brand}</p>
            <p className="text-sm font-medium">${price}</p>
          </div>
          <Link href={`/compare?products=${id}`}>
            <Button size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>;
};