"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { ProductForm } from "@/components/admin/product-form";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoading,
} from "@/components/admin/admin-states";

/** Loads the product to edit and hands it to the shared form. */
export function ProductEditPage({ productId }) {
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const loadProduct = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const data = await apiClient.getProductById(productId);
      setProduct(data);
    } catch (err) {
      setLoadError(err.message || "Could not load this product.");
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="gap-1.5 -mb-4">
        <Link href="/admin/products">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to products
        </Link>
      </Button>

      {isLoading ? (
        <AdminLoading label="Loading product…" />
      ) : loadError ? (
        <AdminErrorState message={loadError} onRetry={loadProduct} />
      ) : !product ? (
        <AdminEmptyState
          title="Product not found"
          description="It may have been deleted. Head back to the product list to see what's available."
          action={
            <Button asChild size="sm">
              <Link href="/admin/products">Back to products</Link>
            </Button>
          }
        />
      ) : (
        <ProductForm product={product} />
      )}
    </div>
  );
}
