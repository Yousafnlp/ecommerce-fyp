"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BRAND_OPTIONS,
  CATEGORY_OPTIONS,
  CATEGORY_SPEC_FIELDS,
  baseSpecValues,
  buildSpecifications,
  parseSpecifications,
} from "@/components/admin/product-form-config";

const SELECT_CLASS =
  "flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

function emptyForm() {
  return {
    name: "",
    brand: BRAND_OPTIONS.smartphone[0],
    category: "smartphone",
    price: "",
    originalPrice: "",
    image: "",
    images: "",
    description: "",
    features: "",
    rating: "4.5",
    reviewCount: "0",
    inStock: true,
    specifications: { ...baseSpecValues },
  };
}

/** Maps an existing product document into the flat form shape. */
function formFromProduct(product) {
  return {
    name: product.name ?? "",
    brand: product.brand ?? BRAND_OPTIONS.smartphone[0],
    category: CATEGORY_OPTIONS.includes(product.category)
      ? product.category
      : CATEGORY_OPTIONS[0],
    price: product.price != null ? String(product.price) : "",
    originalPrice:
      product.originalPrice != null && product.originalPrice !== undefined
        ? String(product.originalPrice)
        : "",
    image: product.image && product.image !== "/placeholder.svg" ? product.image : "",
    images: Array.isArray(product.images) ? product.images.join(", ") : "",
    description: product.description ?? "",
    features: Array.isArray(product.features) ? product.features.join(", ") : "",
    rating: product.rating != null ? String(product.rating) : "0",
    reviewCount: product.reviewCount != null ? String(product.reviewCount) : "0",
    inStock: Boolean(product.inStock),
    specifications: parseSpecifications(product.specifications),
  };
}

function validate(form) {
  const errors = {};

  if (!form.name.trim()) errors.name = "Product name is required.";
  if (!form.price || Number.isNaN(Number(form.price)) || Number(form.price) < 0) {
    errors.price = "Enter a valid non-negative price.";
  }
  if (form.originalPrice && (Number.isNaN(Number(form.originalPrice)) || Number(form.originalPrice) < 0)) {
    errors.originalPrice = "Enter a valid non-negative number, or leave empty.";
  }
  if (!form.description.trim()) errors.description = "A short description is required.";

  const rating = form.rating === "" ? NaN : Number(form.rating);
  if (Number.isNaN(rating) || rating < 0 || rating > 5) {
    errors.rating = "Rating must be between 0 and 5.";
  }
  const reviewCount = form.reviewCount === "" ? NaN : Number(form.reviewCount);
  if (Number.isNaN(reviewCount) || reviewCount < 0) {
    errors.reviewCount = "Review count must be zero or more.";
  }

  const wirelessFields = ["wireless", "noiseCancellation", "gps", "healthTracking"];
  for (const field of wirelessFields) {
    const value = form.specifications[field];
    if (value && value.toLowerCase() !== "true" && value.toLowerCase() !== "false") {
      errors[`spec-${field}`] = 'Use "true" or "false".';
    }
  }

  return errors;
}

/**
 * Shared create/edit product form.
 * Pass `product` to edit; omit it to create a new product.
 */
export function ProductForm({ product }) {
  const isEdit = Boolean(product);
  const router = useRouter();
  const toast = useToast();

  const [form, setForm] = useState(() =>
    isEdit ? formFromProduct(product) : emptyForm()
  );
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const availableBrands = useMemo(() => {
    const options = BRAND_OPTIONS[form.category]
      ? [...BRAND_OPTIONS[form.category]]
      : ["Generic"];
    // Keep custom/legacy brands visible in the select while editing.
    if (form.brand && !options.includes(form.brand)) {
      options.unshift(form.brand);
    }
    return options;
  }, [form.category, form.brand]);

  const specFields = useMemo(
    () => CATEGORY_SPEC_FIELDS[form.category] || [],
    [form.category]
  );

  const handleChange = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const handleSpecChange = (key, value) => {
    setForm((current) => ({
      ...current,
      specifications: { ...current.specifications, [key]: value },
    }));
    setFieldErrors((current) => {
      if (!current[`spec-${key}`]) return current;
      const next = { ...current };
      delete next[`spec-${key}`];
      return next;
    });
  };

  const handleCategoryChange = (category) => {
    setForm((current) => ({
      ...current,
      category,
      brand: BRAND_OPTIONS[category]?.[0] ?? current.brand,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSaving) return; // guard against double submissions

    const errors = validate(form);
    setFieldErrors(errors);
    setSubmitError("");

    if (Object.keys(errors).length > 0) {
      setSubmitError("Please fix the highlighted fields before saving.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        brand: form.brand,
        category: form.category,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
        image: form.image.trim() || "/placeholder.svg",
        images: form.images
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        description: form.description.trim(),
        features: form.features
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        rating: Number(form.rating),
        reviewCount: Number(form.reviewCount),
        inStock: Boolean(form.inStock),
        specifications: buildSpecifications(
          form.category,
          form.brand,
          form.specifications
        ),
      };

      if (isEdit) {
        await apiClient.updateProduct(product.id, payload);
        toast.success(`"${payload.name}" was updated.`);
      } else {
        await apiClient.createProduct(payload);
        toast.success(`"${payload.name}" was added to the catalog.`);
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setSubmitError(err.message || "Failed to save the product.");
    } finally {
      setIsSaving(false);
    }
  };

  const errorText = (key) =>
    fieldErrors[key] ? (
      <p className="text-xs text-destructive" role="alert">
        {fieldErrors[key]}
      </p>
    ) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? "Edit product details" : "New product"}</CardTitle>
        <CardDescription>
          {isEdit
            ? "Update any field and save. Storefront pages reflect changes immediately."
            : "Fill in the catalog fields and the specifications relevant to the selected category."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                aria-invalid={Boolean(fieldErrors.name)}
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
              {errorText("name")}
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                className={SELECT_CLASS}
                value={form.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                {CATEGORY_OPTIONS.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <select
                id="brand"
                className={SELECT_CLASS}
                value={form.brand}
                onChange={(e) => handleChange("brand", e.target.value)}
              >
                {availableBrands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (PKR)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                aria-invalid={Boolean(fieldErrors.price)}
                value={form.price}
                onChange={(e) => handleChange("price", e.target.value)}
                required
              />
              {errorText("price")}
            </div>
            <div className="space-y-2">
              <Label htmlFor="originalPrice">Original Price</Label>
              <Input
                id="originalPrice"
                type="number"
                min="0"
                step="0.01"
                aria-invalid={Boolean(fieldErrors.originalPrice)}
                value={form.originalPrice}
                onChange={(e) => handleChange("originalPrice", e.target.value)}
              />
              {errorText("originalPrice")}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="image">Main Image Path</Label>
              <Input
                id="image"
                value={form.image}
                onChange={(e) => handleChange("image", e.target.value)}
                placeholder="/tablets/samsung/galaxy-tab-s9-ultra-front.jpg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="images">Extra Images</Label>
              <Input
                id="images"
                value={form.images}
                onChange={(e) => handleChange("images", e.target.value)}
                placeholder="/img-1.jpg, /img-2.jpg"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              aria-invalid={Boolean(fieldErrors.description)}
              className="min-h-24 w-full rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground px-3 py-2 text-sm shadow-sm transition-colors resize-y focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              required
            />
            {errorText("description")}
          </div>

          <div className="space-y-2">
            <Label htmlFor="features">Features</Label>
            <Input
              id="features"
              value={form.features}
              onChange={(e) => handleChange("features", e.target.value)}
              placeholder="S Pen, AMOLED display, Multitasking"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="rating">Rating (0–5)</Label>
              <Input
                id="rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                aria-invalid={Boolean(fieldErrors.rating)}
                value={form.rating}
                onChange={(e) => handleChange("rating", e.target.value)}
              />
              {errorText("rating")}
            </div>
            <div className="space-y-2">
              <Label htmlFor="reviewCount">Review Count</Label>
              <Input
                id="reviewCount"
                type="number"
                min="0"
                aria-invalid={Boolean(fieldErrors.reviewCount)}
                value={form.reviewCount}
                onChange={(e) => handleChange("reviewCount", e.target.value)}
              />
              {errorText("reviewCount")}
            </div>
            <div className="flex items-end pb-2 gap-2">
              <input
                id="inStock"
                type="checkbox"
                className="h-4 w-4 rounded border-input accent-primary cursor-pointer"
                checked={form.inStock}
                onChange={(e) => handleChange("inStock", e.target.checked)}
              />
              <Label htmlFor="inStock" className="cursor-pointer">
                In Stock
              </Label>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-3">
            <div>
              <h3 className="font-semibold">Specifications</h3>
              <p className="text-sm text-muted-foreground">
                Fields relevant to the “{form.category}” category. Leave blanks you don’t need.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {specFields.map(([key, label]) => (
                <div className="space-y-2" key={key}>
                  <Label htmlFor={`spec-${key}`}>{label}</Label>
                  <Input
                    id={`spec-${key}`}
                    aria-invalid={Boolean(fieldErrors[`spec-${key}`])}
                    value={form.specifications[key] || ""}
                    onChange={(e) => handleSpecChange(key, e.target.value)}
                  />
                  {errorText(`spec-${key}`)}
                </div>
              ))}
            </div>
          </div>

          {submitError ? (
            <p className="text-sm text-destructive" role="alert">
              {submitError}
            </p>
          ) : null}

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={isSaving} className="gap-2">
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : (
                <Save aria-hidden="true" />
              )}
              {isSaving
                ? "Saving…"
                : isEdit
                  ? "Save changes"
                  : "Create product"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push("/admin/products")}
              disabled={isSaving}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
