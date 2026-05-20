"use client";

import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

function formatPrice(price) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(Number(price) || 0);
}

export function ProductSearchAutocomplete({
  value,
  onChange,
  onSearch,
  placeholder,
  className,
  children,
}) {
  const router = useRouter();
  const containerRef = useRef(null);
  const requestIdRef = useRef(0);
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const trimmedValue = String(value || "").trim();
  const canSuggest = trimmedValue.length >= 2;

  useEffect(() => {
    function handlePointerDown(event) {
      if (!containerRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  useEffect(() => {
    if (!canSuggest) {
      requestIdRef.current += 1;
      setSuggestions([]);
      setIsLoading(false);
      setHasSearched(false);
      return undefined;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setIsLoading(true);
    setHasSearched(false);

    const timeoutId = window.setTimeout(async () => {
      try {
        const results = await apiClient.getProductSuggestions(trimmedValue);
        if (requestIdRef.current === requestId) {
          setSuggestions(Array.isArray(results) ? results : []);
          setHasSearched(true);
          setIsOpen(true);
        }
      } catch (error) {
        if (requestIdRef.current === requestId) {
          console.error("Failed to load product suggestions:", error);
          setSuggestions([]);
          setHasSearched(true);
          setIsOpen(true);
        }
      } finally {
        if (requestIdRef.current === requestId) {
          setIsLoading(false);
        }
      }
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [canSuggest, trimmedValue]);

  const handleSuggestionClick = async (suggestion) => {
    setIsOpen(false);
    onChange(suggestion.name);

    try {
      const product = await apiClient.getProductById(suggestion.id);
      router.push(`/products/${product.category}/${product.id}`);
    } catch (error) {
      console.error("Failed to open product suggestion:", error);
      router.push(`/search?q=${encodeURIComponent(suggestion.name)}`);
    }
  };

  const showDropdown = isOpen && canSuggest;

  return (
    <div ref={containerRef} className="relative">
      <Input
        placeholder={placeholder}
        value={value || ""}
        onChange={(event) => {
          onChange(event.target.value);
          if (event.target.value.trim().length >= 2) {
            setIsOpen(true);
          }
        }}
        onFocus={() => {
          if (canSuggest) setIsOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            setIsOpen(false);
            onSearch();
          }

          if (event.key === "Escape") {
            setIsOpen(false);
          }
        }}
        className={className}
      />
      {children}

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-md border bg-popover shadow-lg">
          {isLoading ? (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading suggestions...
            </div>
          ) : suggestions.length > 0 ? (
            <div className="max-h-80 overflow-y-auto py-1">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  type="button"
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent focus:bg-accent focus:outline-none"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                    <Image
                      src={suggestion.image || "/placeholder.svg"}
                      alt={suggestion.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-popover-foreground">
                      {suggestion.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {suggestion.brand}
                    </p>
                  </div>
                  <span className="flex-shrink-0 text-sm font-semibold text-popover-foreground">
                    {formatPrice(suggestion.price)}
                  </span>
                </button>
              ))}
            </div>
          ) : hasSearched ? (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              No suggestions found
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
