"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { categories, brands, pluralizeCategory } from "@/config/categories";
import { SORT_OPTIONS, getSortValue, getSortParams } from "@/config/sorting";
import { formatPrice } from "@/lib/utils";

const FEATURES = [
  "Battery",
  "Camera",
  "Display",
  "Gaming",
  "Performance",
  "Audio",
];

export function ProductFilters({ currentFilters }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [priceRange, setPriceRange] = useState([
    currentFilters.priceRange?.min || 0,
    currentFilters.priceRange?.max || 5000,
  ]);
  const updateFilters = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === undefined || value === "") {
      params.delete(key);
    } else {
      params.set(key, value.toString());
    }
    router.push(`/products?${params.toString()}`);
  };
  const applySort = (value) => {
    const params = new URLSearchParams(searchParams.toString());
    const { sortBy, sortOrder } = getSortParams(value);
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);
    router.push(`/products?${params.toString()}`);
  };
  const updateMultiSelectFilters = (key, value, checked) => {
    const currentValues = (currentFilters[key] || []).slice();
    if (checked && !currentValues.includes(value)) {
      currentValues.push(value);
    } else if (!checked) {
      const idx = currentValues.indexOf(value);
      if (idx !== -1) currentValues.splice(idx, 1);
    }
    const params = new URLSearchParams(searchParams.toString());
    if (currentValues.length > 0) {
      params.set(key, currentValues.join(","));
    } else {
      params.delete(key);
    }
    router.push(`/products?${params.toString()}`);
  };
  return (
    <div className="space-y-6">
      {/* Sort */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Sort By</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select
            value={getSortValue(currentFilters.sortBy, currentFilters.sortOrder)}
            onValueChange={applySort}
          >
            <SelectTrigger aria-label="Sort products">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Price Range */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Price Range</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={5000}
            min={0}
            step={50}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{formatPrice(priceRange[0])}</span>
            <span>{formatPrice(priceRange[1])}</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());

              params.set("minPrice", priceRange[0].toString());
              params.set("maxPrice", priceRange[1].toString());

              router.push(`/products?${params.toString()}`);
            }}
          >
            Apply Price Filter
          </Button>
        </CardContent>
      </Card>

      {/* Category */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Category</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={category}
                checked={currentFilters.category === category}
                onCheckedChange={(checked) =>
                  updateFilters("category", checked ? category : null)
                }
              />
              <Label
                htmlFor={category}
                className="text-sm capitalize cursor-pointer"
              >
                {pluralizeCategory(category)}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Brand */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Brand</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {brands.map((brand) => (
            <div key={brand} className="flex items-center space-x-2">
              <Checkbox
                id={brand}
                checked={currentFilters.brand?.includes(brand) || false}
                onCheckedChange={(checked) =>
                  updateMultiSelectFilters("brand", brand, checked)
                }
              />
              <Label htmlFor={brand} className="text-sm cursor-pointer">
                {brand}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {FEATURES.map((feature) => (
            <div key={feature} className="flex items-center space-x-2">
              <Checkbox
                id={`feature-${feature}`}
                checked={currentFilters.features?.includes(feature) || false}
                onCheckedChange={(checked) =>
                  updateMultiSelectFilters("features", feature, checked)
                }
              />
              <Label
                htmlFor={`feature-${feature}`}
                className="text-sm cursor-pointer capitalize"
              >
                {feature}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Rating */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Minimum Rating</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[4.5, 4.0, 3.5, 3.0].map((rating) => (
            <div key={rating} className="flex items-center space-x-2">
              <Checkbox
                id={`rating-${rating}`}
                checked={currentFilters.rating === rating}
                onCheckedChange={(checked) =>
                  updateFilters("rating", checked ? rating : null)
                }
              />
              <Label
                htmlFor={`rating-${rating}`}
                className="text-sm cursor-pointer"
              >
                {rating}+ Stars
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function ClearFiltersButton() {
  const router = useRouter();
  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={() => router.push("/products")}
    >
      Clear All Filters
    </Button>
  );
}
