"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PackagePlus, Pencil, Search, Trash2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableEmpty,
  AdminTableHead,
  AdminTableHeader,
  AdminTableRow,
} from "@/components/admin/admin-table";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoading,
} from "@/components/admin/admin-states";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

export function ProductsManager() {
  const router = useRouter();
  const toast = useToast();

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Delete flow state: the product pending confirmation + in-flight flag.
  const [pendingDelete, setPendingDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const data = await apiClient.getProducts({ sortBy: "newest", sortOrder: "desc" });
      setProducts(data || []);
    } catch (err) {
      setLoadError(err.message || "Could not load products.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))).sort(),
    [products]
  );

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => {
      if (categoryFilter !== "all" && product.category !== categoryFilter) return false;
      if (!query) return true;
      return (
        product.name?.toLowerCase().includes(query) ||
        product.brand?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query)
      );
    });
  }, [products, search, categoryFilter]);

  const confirmDelete = async () => {
    if (!pendingDelete || isDeleting) return;
    setIsDeleting(true);
    try {
      await apiClient.deleteProduct(pendingDelete.id);
      toast.success(`"${pendingDelete.name}" was deleted.`);
      setPendingDelete(null);
      await loadProducts();
      router.refresh();
    } catch (err) {
      toast.error(err.message || "Failed to delete the product.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Products"
        description="Everything in your catalog. Create new items, edit details and pricing, or remove products that are no longer sold."
        actions={
          <Button asChild>
            <Link href="/admin/products/new">
              <PackagePlus aria-hidden="true" />
              Add product
            </Link>
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            className="pl-9"
            placeholder="Search by name, brand or category…"
            aria-label="Search products"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          aria-label="Filter by category"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <AdminLoading label="Loading products…" />
      ) : loadError ? (
        <AdminErrorState message={loadError} onRetry={loadProducts} />
      ) : (
        <AdminTable ariaLabel="Product catalog">
          <AdminTableHead>
            <AdminTableHeader>Product</AdminTableHeader>
            <AdminTableHeader>Brand</AdminTableHeader>
            <AdminTableHeader>Price</AdminTableHeader>
            <AdminTableHeader>Stock</AdminTableHeader>
            <AdminTableHeader className="text-right">Actions</AdminTableHeader>
          </AdminTableHead>
          <AdminTableBody>
            {visibleProducts.length === 0 ? (
              <AdminTableEmpty colSpan={5}>
                {products.length === 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm">Your catalog is empty.</p>
                    <Button asChild size="sm">
                      <Link href="/admin/products/new">Create your first product</Link>
                    </Button>
                  </div>
                ) : (
                  "No products match your filters."
                )}
              </AdminTableEmpty>
            ) : (
              visibleProducts.map((product) => (
                <AdminTableRow key={product.id}>
                  <AdminTableCell>
                    <div className="flex items-center gap-3 min-w-[220px]">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt=""
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/admin/products/${encodeURIComponent(product.id)}/edit`}
                          className="font-medium hover:text-primary hover:underline outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                        >
                          {product.name}
                        </Link>
                        <p className="text-xs text-muted-foreground capitalize">{product.category}</p>
                      </div>
                    </div>
                  </AdminTableCell>
                  <AdminTableCell>{product.brand}</AdminTableCell>
                  <AdminTableCell className="whitespace-nowrap font-medium">
                    {formatPrice(product.price)}
                  </AdminTableCell>
                  <AdminTableCell>
                    {product.inStock ? (
                      <Badge variant="secondary">In stock</Badge>
                    ) : (
                      <Badge variant="destructive">Out of stock</Badge>
                    )}
                  </AdminTableCell>
                  <AdminTableCell>
                    <div className="flex justify-end gap-1.5">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        aria-label={`Edit ${product.name}`}
                      >
                        <Link href={`/admin/products/${encodeURIComponent(product.id)}/edit`}>
                          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                          Edit
                        </Link>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="gap-1.5"
                        aria-label={`Delete ${product.name}`}
                        onClick={() => setPendingDelete({ id: product.id, name: product.name })}
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        Delete
                      </Button>
                    </div>
                  </AdminTableCell>
                </AdminTableRow>
              ))
            )}
          </AdminTableBody>
        </AdminTable>
      )}

      {!isLoading && !loadError && visibleProducts.length > 0 ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Showing {visibleProducts.length} of {products.length} products.
        </p>
      ) : null}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this product?"
        description={
          pendingDelete ? (
            <>
              You are about to permanently delete{" "}
              <strong>{pendingDelete.name}</strong>. It will disappear from the storefront
              immediately and be removed from every customer’s cart and wishlist. Past orders keep
              their records.
            </>
          ) : null
        }
        confirmLabel="Delete product"
        destructive
        pending={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => !isDeleting && setPendingDelete(null)}
      />
    </>
  );
}
