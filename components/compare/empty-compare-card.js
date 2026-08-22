import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

/**
 * True empty state: nothing is rendered as if it were in the queue.
 * Suggestions intentionally omitted — an empty comparison shows exactly that.
 */
export function EmptyCompareCard() {
  return (
    <Card className="text-center">
      <CardHeader className="pb-4">
        <CardTitle>No Products Selected</CardTitle>
        <CardDescription>
          Choose products to compare their specifications and features
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link href="/products">
          <Button>Browse All Products</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
