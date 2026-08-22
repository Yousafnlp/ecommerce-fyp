"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Filter, Mic, MicOff, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ProductSearchAutocomplete } from "./product-search-autocomplete";
import { useWebSpeechRecognition } from "./use-web-speech-recognition";
import { useWhisperFallback } from "./use-whisper-fallback";
import { categories, brands, pluralizeCategory } from "@/config/categories";
import { formatPrice } from "@/lib/utils";
export function AdvancedSearchInterface({
  initialQuery,
  initialFilters
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery || "");
  const [isListening, setIsListening] = useState(false);
  const [filters, setFilters] = useState(initialFilters);
  const [priceRange, setPriceRange] = useState([initialFilters.priceRange?.min ?? 0, initialFilters.priceRange?.max ?? 5000]);
  const [isLoading, setIsLoading] = useState(false);
  const webSpeech = useWebSpeechRecognition(setQuery, setIsListening);
  const whisper = useWhisperFallback(setQuery, isListening, setIsListening, isLoading, setIsLoading);

  const handleWebspeechRecording = () => {
    if (isListening) webSpeech.stopListening();else webSpeech.startListening();
  };
  const handleWhisperRecording = () => {
    if (isListening) whisper.cancelRecordingRef.current?.();else {
      if (!isLoading) whisper.startRecording();else whisper.cancelRecordingRef.current?.();
    }
  };
  const handleSearch = (queryOverride) => {
    const searchQuery = typeof queryOverride === "string" ? queryOverride : query;
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (filters.category) params.set("category", filters.category);
    if (filters.brand && filters.brand.length > 0) params.set("brand", filters.brand[0]);
    if (filters.features && filters.features.length > 0) params.set("features", filters.features.join(","));
    if (priceRange[0] > 0) params.set("minPrice", priceRange[0].toString());
    if (priceRange[1] < 5000) params.set("maxPrice", priceRange[1].toString());
    if (filters.rating) params.set("rating", filters.rating.toString());
    if (filters.sortBy) params.set("sortBy", filters.sortBy);
    if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);
    router.push(`/search?${params.toString()}`);
  };
  const clearFilters = () => {
    setQuery("");
    setFilters({});
    setPriceRange([0, 5000]);
    router.push("/search");
  };
  const updateFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };
  return <div className="space-y-6">
      {/* Main Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Smart Search
          </CardTitle>
          <CardDescription>
            Search with voice, natural language, or keywords
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <ProductSearchAutocomplete placeholder="Try: 'Best smartphone under $800 with good camera'" value={query || ""} onChange={setQuery} onSearch={handleSearch} className="pr-12">
            {!webSpeech.supported ? <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="absolute right-1 top-1 h-8 w-8 p-0" onClick={handleWhisperRecording}>
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Voice search might not work on non-Chrome browsers
                  </TooltipContent>
                </Tooltip>
            </TooltipProvider> : <Button variant="ghost" size="sm" className={`absolute right-1 top-1 h-8 w-8 p-0 ${isListening ? "text-danger" : ""}`} onClick={handleWebspeechRecording}>
                {isListening || isLoading ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>}
          </ProductSearchAutocomplete>

          {/* Voice Status */}
          {isListening && <div className="flex items-center gap-2 text-sm text-danger">
              <div className="w-2 h-2 bg-danger rounded-full animate-pulse-soft" />
              Listening... Speak now
            </div>}

          {isLoading && <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="animate-spin w-4 h-4 border-2 border-ring/40 border-t-transparent rounded-full" />
              Processing audio...
            </div>}

          <Button onClick={handleSearch} className="w-full">
            <Search className="w-4 h-4 mr-2" />
            Search Products
          </Button>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Advanced Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={filters.category ?? "all"} onValueChange={value => updateFilter("category", value === "all" ? undefined : value)}>
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => <SelectItem key={category} value={category} className="capitalize">
                    {pluralizeCategory(category)}
                  </SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Brand */}
          <div className="space-y-2">
            <Label>Brand</Label>
            <Select value={filters.brand?.[0] ?? "all"} onValueChange={value => updateFilter("brand", value === "all" ? undefined : [value])}>
              <SelectTrigger>
                <SelectValue placeholder="All brands" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {brands.map(brand => <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div className="space-y-4">
            <Label>Price Range</Label>
            <Slider value={priceRange} onValueChange={setPriceRange} max={5000} min={0} step={50} className="w-full" />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{formatPrice(priceRange[0])}</span>
              <span>{formatPrice(priceRange[1])}</span>
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label>Minimum Rating</Label>
            <Select value={filters.rating?.toString() || "any"} onValueChange={value => updateFilter("rating", value === "any" ? undefined : Number(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Any rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Rating</SelectItem>
                <SelectItem value="4.5">4.5+ Stars</SelectItem>
                <SelectItem value="4.0">4.0+ Stars</SelectItem>
                <SelectItem value="3.5">3.5+ Stars</SelectItem>
                <SelectItem value="3.0">3.0+ Stars</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Features */}
          <div className="space-y-2">
            <Label>Features</Label>
            <div className="flex flex-wrap gap-2">
              {["battery", "camera", "display", "gaming", "audio", "performance"].map(feature => {
                const active = (filters.features || []).includes(feature);
                return <button key={feature} type="button" onClick={() => {
                  const next = (filters.features || []).slice();
                  const idx = next.indexOf(feature);
                  if (idx !== -1) next.splice(idx, 1);
                  else next.push(feature);
                  updateFilter("features", next.length > 0 ? next : undefined);
                }} className={`rounded-full px-3 py-1 text-xs font-medium border transition-all ${active ? "bg-gradient-brand text-white border-transparent shadow-[var(--shadow-card)]" : "bg-card/50 text-muted-foreground border-border/60 hover:border-ring/40"}`}>
                  {feature}
                </button>;
              })}
            </div>
          </div>

          {/* Sort Options */}
          <div className="space-y-2">
            <Label>Sort By</Label>
            <div className="grid grid-cols-2 gap-2">
              <Select value={filters.sortBy || "relevance"} onValueChange={value => updateFilter("sortBy", value === "relevance" ? undefined : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="score">SpecSmart Score</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>

              {filters.sortBy && <Select value={filters.sortOrder || "desc"} onValueChange={value => updateFilter("sortOrder", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Low to High</SelectItem>
                    <SelectItem value="desc">High to Low</SelectItem>
                  </SelectContent>
                </Select>}
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={handleSearch} className="flex-1">
              Apply Filters
            </Button>
            <Button variant="outline" onClick={clearFilters}>
              <X className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Searches */}
      <Card>
        <CardHeader>
          <CardTitle>Popular Searches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {["Best smartphones 2024", "Gaming laptops under $1500", "Wireless headphones", "4K cameras", "Smartwatches with GPS", "Budget tablets"].map(search => <Badge key={search} variant="secondary" className="cursor-pointer hover:bg-gradient-brand hover:text-white hover:border-transparent transition-all" onClick={() => {
            setQuery(search);
            handleSearch(search);
          }}>
                {search}
              </Badge>)}
          </div>
        </CardContent>
      </Card>
    </div>;
}
