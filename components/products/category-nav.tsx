import Link from "next/link";
import { Button } from "@/components/ui/button";

interface CategoryNavProps {
  categories: string[];
  activeCategory?: string;
}

export function CategoryNav({ categories, activeCategory }: CategoryNavProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-2">
        <Link href="/products">
          <Button variant={!activeCategory ? "default" : "outline"} size="sm">
            All Categories
          </Button>
        </Link>
        {categories.map((category) => (
          <Link key={category} href={`/products?category=${category}`}>
            <Button
              variant={activeCategory === category ? "default" : "outline"}
              size="sm"
              className="capitalize"
            >
              {category}s
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
}
