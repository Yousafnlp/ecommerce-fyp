"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
export function CompareBreadcrumb() {
  return <div className="flex items-center gap-2 mb-6">
      <Link href="/products">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Products
        </Button>
      </Link>
      <span className="text-muted-foreground">/</span>
      <span className="font-medium">Compare</span>
    </div>;
}