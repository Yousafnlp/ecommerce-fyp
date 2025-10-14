"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import type { SearchFilters } from "@/lib/types";
import { Filter, Mic, MicOff, Search, Sparkles, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface AdvancedSearchInterfaceProps {
  initialQuery: string;
  initialFilters: SearchFilters;
}
export function AdvancedSearchInterface({
  initialQuery,
  initialFilters,
}: AdvancedSearchInterfaceProps) {
  const router = useRouter();

  const [query, setQuery] = useState(initialQuery || "");
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(
    null
  );
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [priceRange, setPriceRange] = useState([
    initialFilters.priceRange?.min || 0,
    initialFilters.priceRange?.max || 5000,
  ]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const cancelRecordingRef = useRef<() => void>(() => {});

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognitionClass =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognitionClass) {
        console.warn("Speech recognition not supported in this browser.");
        return;
      }

      const recognition = new SpeechRecognitionClass();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognition);
    }
  }, []);

  // Generate search suggestions based on query
  useEffect(() => {
    if (query?.length > 2) {
      const mockSuggestions = [
        `${query} under $500`,
        `best ${query} 2024`,
        `${query} with good battery`,
        `${query} for gaming`,
        `${query} comparison`,
      ];
      setSuggestions(mockSuggestions.slice(0, 3));
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const handleVoiceSearch = async () => {
    // Stop if already recording
    if (isListening) {
      if (recognition) recognition.stop();
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      }
      setIsListening(false);
      return;
    }

    // --- Web Speech API path (Chrome, Edge, etc.) ---
    if (recognition) {
      if (isListening) {
        recognition.stop();
        setIsListening(false);
        return;
      }

      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      let silenceTimer: NodeJS.Timeout | null = null;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript =
          event.results[event.results.length - 1][0].transcript;
        setQuery((prev) => prev + " " + transcript);

        if (silenceTimer) clearTimeout(silenceTimer);
        silenceTimer = setTimeout(() => {
          recognition.stop();
          setIsListening(false);
        }, 3000);
      };

      recognition.onerror = (e) => {
        console.warn("Speech recognition error:", e);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      // Safe start (prevent “already started”)
      try {
        recognition.start();
        setIsListening(true);
      } catch (err) {
        if (
          (err as DOMException).name === "InvalidStateError" ||
          (err as DOMException).message.includes("already started")
        ) {
          console.warn(
            "Recognition already running, ignoring duplicate start."
          );
        } else {
          console.error("Speech recognition failed to start:", err);
        }
      }

      // Also let Cancel button stop this mode
      cancelRecordingRef.current = () => {
        try {
          recognition.stop();
        } catch {}
        setIsListening(false);
        setIsLoading(false);
      };

      return;
    }

    // --- Fallback path (non-Chrome browsers) ---
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];
      let cancelled = false;
      let recordingActive = true; // local flag to track recording manually

      setIsListening(true);

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      const data = new Uint8Array(analyser.fftSize);

      let silenceStart = Date.now();
      const silenceDelay = 3000;
      const rmsThreshold = 12;

      const detectSilence = () => {
        if (!recordingActive) return; // stop detection loop when recording ends

        analyser.getByteTimeDomainData(data);
        const rms = Math.sqrt(
          data.reduce((a, b) => a + (b - 128) ** 2, 0) / data.length
        );

        if (rms > rmsThreshold) silenceStart = Date.now();

        if (Date.now() - silenceStart > silenceDelay) {
          if (!cancelled && mediaRecorder.state !== "inactive") {
            recordingActive = false;
            mediaRecorder.stop();
            stream.getTracks().forEach((t) => t.stop());
          }
          return;
        }

        requestAnimationFrame(detectSilence);
      };
      detectSilence();

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

      mediaRecorder.onstop = async () => {
        recordingActive = false; // mark stopped

        if (cancelled) {
          setIsListening(false);
          setIsLoading(false);
          return;
        }

        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("file", audioBlob);

        try {
          setIsListening(false);
          setIsLoading(true);
          const res = await fetch("/api/speech-to-text", {
            method: "POST",
            body: formData,
          });
          const { transcript } = await res.json();
          if (transcript) setQuery(transcript);
        } catch (err) {
          console.error("Transcription failed:", err);
          alert("Failed to transcribe audio");
        }

        setIsLoading(false);
      };

      mediaRecorder.start();

      // Cancel logic
      cancelRecordingRef.current = () => {
        cancelled = true;
        recordingActive = false;
        if (mediaRecorder.state !== "inactive") mediaRecorder.stop();
        stream.getTracks().forEach((t) => t.stop());
        setIsListening(false);
        setIsLoading(false);
      };
    } catch (err) {
      console.error("Audio capture failed:", err);
      alert("Microphone access denied or not available.");
      setIsListening(false);
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (query) params.set("q", query);
    if (filters.category) params.set("category", filters.category);
    if (filters.brand && filters.brand.length > 0)
      params.set("brand", filters.brand[0]);
    if (priceRange[0] > 0) params.set("minPrice", priceRange[0].toString());
    if (priceRange[1] < 5000) params.set("maxPrice", priceRange[1].toString());
    if (filters.rating) params.set("rating", filters.rating.toString());
    if (filters.sortBy) params.set("sortBy", filters.sortBy);
    if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);

    router.push(`/search?${params.toString()}`);
  };

  const handleNaturalLanguageQuery = (suggestion: string) => {
    setQuery(suggestion);
    setSuggestions([]);
  };

  const clearFilters = () => {
    setQuery("");
    setFilters({});
    setPriceRange([0, 5000]);
    router.push("/search");
  };

  const updateFilter = <K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const brands = [
    "Apple",
    "Samsung",
    "Sony",
    "Dell",
    "HP",
    "Lenovo",
    "Google",
    "OnePlus",
  ];
  const categories = [
    "smartphone",
    "laptop",
    "tablet",
    "smartwatch",
    "headphones",
    "camera",
  ];

  return (
    <div className="space-y-6">
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
          <div className="relative">
            <Input
              placeholder="Try: 'Best smartphone under $800 with good camera'"
              value={query || ""}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pr-12"
            />
            {!recognition ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-8 w-8 p-0"
                      onClick={handleVoiceSearch}
                    >
                      {isListening ? (
                        <MicOff className="w-4 h-4" />
                      ) : (
                        <Mic className="w-4 h-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Voice search might not work on non-Chrome browsers
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className={`absolute right-1 top-1 h-8 w-8 p-0 ${
                  isListening ? "text-red-500" : ""
                }`}
                onClick={handleVoiceSearch}
              >
                {isListening ? (
                  <MicOff className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </Button>
            )}
          </div>

          {/* Voice Status */}
          {isListening && (
            <div className="flex items-center gap-2 text-sm text-red-500">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Listening... Speak now
              <Button
                size="sm"
                variant="outline"
                onClick={() => cancelRecordingRef.current()}
              >
                Cancel
              </Button>
            </div>
          )}

          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full" />
              Processing audio...
            </div>
          )}

          {/* Natural Language Suggestions */}
          {suggestions.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Try these natural language queries:
              </Label>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    onClick={() => handleNaturalLanguageQuery(suggestion)}
                  >
                    {suggestion}
                  </Badge>
                ))}
              </div>
            </div>
          )}

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
            <Select
              value={filters.category || "all"}
              onValueChange={(value) =>
                updateFilter("category", value || undefined)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem
                    key={category}
                    value={category}
                    className="capitalize"
                  >
                    {category}s
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Brand */}
          <div className="space-y-2">
            <Label>Brand</Label>
            <Select
              value={filters.brand?.[0] || "all"}
              onValueChange={(value) =>
                updateFilter("brand", value ? [value] : undefined)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All brands" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div className="space-y-4">
            <Label>Price Range</Label>
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              max={5000}
              min={0}
              step={50}
              className="w-full"
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label>Minimum Rating</Label>
            <Select
              value={filters.rating?.toString() || "any"}
              onValueChange={(value) =>
                updateFilter("rating", value ? Number(value) : undefined)
              }
            >
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

          {/* Sort Options */}
          <div className="space-y-2">
            <Label>Sort By</Label>
            <div className="grid grid-cols-2 gap-2">
              <Select
                value={filters.sortBy || "relevance"}
                onValueChange={(value) =>
                  updateFilter(
                    "sortBy",
                    value === "relevance"
                      ? undefined
                      : (value as SearchFilters["sortBy"]) 
                  )
                }
              >
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

              {filters.sortBy && (
                <Select
                  value={filters.sortOrder || "desc"}
                  onValueChange={(value) =>
                    updateFilter(
                      "sortOrder",
                      value as SearchFilters["sortOrder"]
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Low to High</SelectItem>
                    <SelectItem value="desc">High to Low</SelectItem>
                  </SelectContent>
                </Select>
              )}
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
            {[
              "Best smartphones 2024",
              "Gaming laptops under $1500",
              "Wireless headphones",
              "4K cameras",
              "Smartwatches with GPS",
              "Budget tablets",
            ].map((search) => (
              <Badge
                key={search}
                variant="secondary"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                onClick={() => {
                  setQuery(search);
                  handleSearch();
                }}
              >
                {search}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
