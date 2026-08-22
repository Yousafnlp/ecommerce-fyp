"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
export function ProductBreadcrumb({
  category,
  productName
}) {
  return <div className="flex items-center gap-2 mb-6">
      <Link href="/products">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Products
        </Button>
      </Link>
      <span className="text-muted-foreground">/</span>
      <Link href={`/products/${category}`}>
        <Button variant="ghost" size="sm" className="capitalize">
          {category}s
        </Button>
      </Link>
      <span className="text-muted-foreground">/</span>
      <span className="font-medium truncate">{productName}</span>
    </div>;
}