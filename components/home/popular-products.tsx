import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Database } from "@/lib/database";
import { Star } from "lucide-react";
const PopularProducts = async () => {
  const popularProducts = await Database.getPopularProducts();
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Popular Choices</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Most reviewed and trusted products by our community
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularProducts.map((product) => (
            <Card
              key={product.id}
              className="group hover:shadow-lg transition-all duration-300"
            >
              <CardHeader className="p-4">
                <div className="flex gap-4">
                  <div className="w-20 h-20 relative overflow-hidden rounded-lg bg-muted flex-shrink-0">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base line-clamp-2 mb-1">
                      {product.name}
                    </CardTitle>
                    <CardDescription className="text-sm mb-2">
                      {product.brand}
                    </CardDescription>
                    <div className="flex items-center gap-2">
                      {/* <Badge variant="secondary" className="text-xs">
                          Score: {product.score}
                        </Badge> */}
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs">{product.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold">${product.price}</div>
                  {/* <Link href={`/compare?products=${product.id}`}>
                      <Button size="sm" variant="outline">
                        Compare
                      </Button>
                    </Link> */}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularProducts;
