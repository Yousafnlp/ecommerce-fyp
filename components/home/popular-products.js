import { Database } from "@/lib/database";
import { PopularGrid } from "./popular-grid";

const PopularProducts = async () => {
  const popularProducts = await Database.getPopularProducts();
  return <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Popular Choices</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Most reviewed and trusted products by our community
          </p>
        </div>
        <PopularGrid products={popularProducts} />
      </div>
    </section>;
};
export default PopularProducts;
