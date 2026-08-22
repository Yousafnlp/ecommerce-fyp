import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
export function CategoryBreadcrumb({
  title
}) {
  return <div className="flex items-center gap-2 mb-6">
      <Link href="/products">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          All Products
        </Button>
      </Link>
      <span className="text-muted-foreground">/</span>
      <span className="font-medium">{title}</span>
    </div>;
}