import { ProductSuggestionCard } from "./ProductSuggestionCard";

export function ProductSuggestionGrid({ products }: { products: any[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {products.map((p) => (
        <ProductSuggestionCard
          key={p.id}
          id={p.id}
          name={p.name}
          brand={p.brand}
          price={p.price}
        />
      ))}
    </div>
  );
}
