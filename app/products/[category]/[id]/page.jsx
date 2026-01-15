"use client";
import { AuthenticatedHeader } from "@/components/layout/authenticated-header";
import { ProductActions } from "@/components/products/category/product/product-action";
import { ProductBreadcrumb } from "@/components/products/category/product/product-breadcrum";
import { ProductImages } from "@/components/products/category/product/product-images";
import { ProductInfo } from "@/components/products/category/product/product-info";
import { ProductSpecifications } from "@/components/products/category/product/product-specifications";
import { RelatedProducts } from "@/components/products/category/product/relateed-products";
import { useGetProductById, useGetProducts } from "@/lib/hooks/products";

export default function ProductPage({ params }) {
  const { data: product, isLoading: loadingProduct } = useGetProductById(
    params?.id
  );
  const { data: relatedProducts, isLoading: loadingRelated } = useGetProducts({
    category: params?.category,
  });

  if (loadingProduct || loadingRelated) {
    return <p className="text-center mt-20">Loading...</p>;
  }

  if (!product) {
    return <p className="text-center mt-20">Product not found</p>;
  }

  const filteredRelated = relatedProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <AuthenticatedHeader />
      <div className="container mx-auto px-4 py-8">
        <ProductBreadcrumb
          category={params?.category}
          productName={product.name}
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <ProductImages
            name={product.name}
            mainImage={product.image}
            images={product.images}
          />
          <div className="space-y-6">
            <ProductInfo {...product} />
            <ProductActions inStock={product.inStock} product={product} />
          </div>
        </div>
        <ProductSpecifications specifications={product.specifications} />
        <RelatedProducts products={filteredRelated} />
      </div>
    </div>
  );
}
