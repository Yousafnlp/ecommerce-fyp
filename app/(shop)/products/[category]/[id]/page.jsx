import { cache } from "react";
import { Database } from "@/lib/database";
import { notFound } from "next/navigation";
import { ProductBreadcrumb } from "@/components/products/product-breadcrumb";
import { ProductImages } from "@/components/products/product-images";
import { ProductInfo } from "@/components/products/product-info";
import { ProductSpecifications } from "@/components/products/product-specifications";
import { RelatedProducts } from "@/components/products/related-products";
import { ProductActions } from "@/components/products/product-action";

// Cached per-request so generateMetadata and the page share one lookup.
const getProduct = cache((id) => Database.getProductById(id));

async function resolveProduct(category, id) {
  const product = await getProduct(id);
  if (!product || product.category !== category) {
    notFound();
  }
  return product;
}

export async function generateMetadata({ params }) {
  const { category, id } = await params;
  // notFound() here runs before the streamed response begins, so missing or
  // mismatched products get a real HTTP 404 instead of a soft-404 (200).
  const product = await resolveProduct(category, id);
  return { title: product.name };
}

export default async function ProductPage({ params }) {
  const { category, id } = await params;
  const product = await resolveProduct(category, id);

  const relatedProducts = await Database.getProducts({
    category: product.category,
  });
  const filteredRelated = relatedProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductBreadcrumb category={category} productName={product.name} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <ProductImages
          name={product.name}
          mainImage={product.image}
          images={product.images}
          productId={product.id}
        />
        <div className="space-y-6">
          <ProductInfo {...product} />
          <ProductActions product={product} />
        </div>
      </div>
      <ProductSpecifications specifications={product.specifications} />
      <RelatedProducts products={filteredRelated} />
    </div>
  );
}
