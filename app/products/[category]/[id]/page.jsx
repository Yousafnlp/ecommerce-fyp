import { Database } from "@/lib/database";
import { notFound } from "next/navigation";
import { AuthenticatedHeader } from "@/components/layout/authenticated-header";
import { ProductBreadcrumb } from "@/components/products/category/product/product-breadcrum";
import { ProductImages } from "@/components/products/category/product/product-images";
import { ProductInfo } from "@/components/products/category/product/product-info";
import { ProductSpecifications } from "@/components/products/category/product/product-specifications";
import { RelatedProducts } from "@/components/products/category/product/relateed-products";
import { ProductActions } from "@/components/products/category/product/product-action";

export default async function ProductPage({ params }) {
  const { category, id } = await params;
  const product = await Database.getProductById(id);

  if (!product || product.category !== category) {
    notFound();
  }

  const relatedProducts = await Database.getProducts({
    category: product.category,
  });
  const filteredRelated = relatedProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <AuthenticatedHeader />
      <div className="container mx-auto px-4 py-8">
        <ProductBreadcrumb category={category} productName={product.name} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <ProductImages
            name={product.name}
            mainImage={product.image}
            images={product.images}
          />
          <div className="space-y-6">
            <ProductInfo {...product} />
            <ProductActions product={product} />
          </div>
        </div>
        <ProductSpecifications specifications={product.specifications} />
        <RelatedProducts products={filteredRelated} />
      </div>
    </div>
  );
}
