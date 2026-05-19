"use client";

import { useEffect, useMemo, useState } from "react";
import { AuthenticatedHeader } from "@/components/layout/authenticated-header";
import { Database } from "@/lib/database";
import { useAppSelector } from "@/lib/redux";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const CATEGORY_OPTIONS = [
  "smartphone",
  "tablet",
  "laptop",
  "monitor",
  "charger",
  "console",
  "earbuds",
  "headphone",
  "processor",
  "smartwatch",
];

const BRAND_OPTIONS = {
  smartphone: ["Apple", "Samsung", "Google"],
  tablet: ["Apple", "Samsung"],
  laptop: ["Apple", "Dell", "ASUS"],
  monitor: ["Dell", "LG", "Samsung"],
  charger: ["Apple", "Samsung", "Anker"],
  console: ["Sony"],
  earbuds: ["Sony", "Apple", "Samsung"],
  headphone: ["Sony", "Apple"],
  processor: ["AMD", "Intel"],
  smartwatch: ["Apple", "Samsung", "Garmin"],
};

const CATEGORY_SPEC_FIELDS = {
  smartphone: [
    ["model", "Model"],
    ["battery", "Battery"],
    ["ram", "RAM"],
    ["storage", "Storage"],
    ["processor", "Processor"],
    ["displaySize", "Display Size"],
    ["refreshRate", "Refresh Rate"],
    ["cameraMain", "Main Camera"],
  ],
  tablet: [
    ["model", "Model"],
    ["battery", "Battery"],
    ["ram", "RAM"],
    ["storage", "Storage"],
    ["processor", "Processor"],
    ["displaySize", "Display Size"],
    ["refreshRate", "Refresh Rate"],
  ],
  laptop: [
    ["model", "Model"],
    ["cpu", "CPU"],
    ["ram", "RAM"],
    ["storage", "Storage"],
    ["screenSize", "Screen Size"],
    ["refreshRate", "Refresh Rate"],
    ["battery", "Battery"],
  ],
  monitor: [
    ["model", "Model"],
    ["displaySize", "Display Size"],
    ["resolution", "Resolution"],
    ["refreshRate", "Refresh Rate"],
    ["responseTime", "Response Time"],
    ["panelType", "Panel Type"],
  ],
  charger: [
    ["model", "Model"],
    ["output", "Output"],
    ["ports", "Ports"],
    ["connector", "Connector"],
  ],
  console: [
    ["model", "Model"],
    ["storage", "Storage"],
    ["resolution", "Resolution"],
    ["fps", "FPS"],
  ],
  earbuds: [
    ["model", "Model"],
    ["battery", "Battery"],
    ["driverSize", "Driver Size"],
    ["wireless", "Wireless"],
    ["noiseCancellation", "Noise Cancellation"],
  ],
  headphone: [
    ["model", "Model"],
    ["battery", "Battery"],
    ["driverSize", "Driver Size"],
    ["wireless", "Wireless"],
    ["noiseCancellation", "Noise Cancellation"],
  ],
  processor: [
    ["model", "Model"],
    ["cores", "Cores"],
    ["baseClock", "Base Clock"],
    ["boostClock", "Boost Clock"],
    ["socket", "Socket"],
  ],
  smartwatch: [
    ["model", "Model"],
    ["battery", "Battery"],
    ["displaySize", "Display Size"],
    ["gps", "GPS"],
    ["healthTracking", "Health Tracking"],
  ],
};

const baseSpecValues = {
  model: "",
  battery: "",
  ram: "",
  storage: "",
  processor: "",
  displaySize: "",
  refreshRate: "",
  cameraMain: "",
  cpu: "",
  screenSize: "",
  resolution: "",
  responseTime: "",
  panelType: "",
  output: "",
  ports: "",
  connector: "",
  fps: "",
  driverSize: "",
  wireless: "",
  noiseCancellation: "",
  cores: "",
  baseClock: "",
  boostClock: "",
  socket: "",
  gps: "",
  healthTracking: "",
};

const initialForm = {
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
  specifications: baseSpecValues,
};

function buildSpecifications(category, brand, values) {
  const specs = {
    brand,
  };

  if (values.model) specs.model = values.model;
  if (values.battery) specs.battery = values.battery;
  if (values.ram) specs.ram = values.ram;
  if (values.storage) specs.storage = values.storage;
  if (values.processor) specs.processor = values.processor;
  if (values.cpu) specs.cpu = values.cpu;
  if (values.screenSize) specs.screenSize = values.screenSize;
  if (values.output) specs.output = values.output;
  if (values.connector) specs.connector = values.connector;
  if (values.ports) specs.ports = values.ports.split(",").map((item) => item.trim()).filter(Boolean);
  if (values.driverSize) specs.driverSize = values.driverSize;
  if (values.wireless) specs.wireless = values.wireless.toLowerCase() === "true";
  if (values.noiseCancellation) specs.noiseCancellation = values.noiseCancellation.toLowerCase() === "true";
  if (values.cores) specs.cores = values.cores;
  if (values.baseClock) specs.baseClock = values.baseClock;
  if (values.boostClock) specs.boostClock = values.boostClock;
  if (values.socket) specs.socket = values.socket;
  if (values.fps) specs.fps = values.fps;
  if (values.gps) specs.gps = values.gps.toLowerCase() === "true";
  if (values.healthTracking) specs.healthTracking = values.healthTracking.toLowerCase() === "true";

  const display = {};
  if (values.displaySize) display.size = values.displaySize;
  if (values.refreshRate) display.refreshRate = values.refreshRate;
  if (values.resolution) display.resolution = values.resolution;
  if (values.responseTime) display.responseTime = values.responseTime;
  if (values.panelType) display.type = values.panelType;
  if (Object.keys(display).length > 0) specs.display = display;

  if (values.cameraMain) {
    specs.camera = {
      main: values.cameraMain,
    };
  }

  if (category === "monitor" && values.panelType) {
    specs.display = {
      ...(specs.display || {}),
      type: values.panelType,
    };
  }

  return specs;
}

export function AdminPanel() {
  const user = useAppSelector((state) => state.auth.user);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const availableBrands = useMemo(
    () => BRAND_OPTIONS[form.category] || ["Generic"],
    [form.category]
  );

  const specFields = useMemo(
    () => CATEGORY_SPEC_FIELDS[form.category] || [],
    [form.category]
  );

  const loadProducts = async () => {
    const allProducts = await Database.getProducts({
      sortBy: "newest",
      sortOrder: "desc",
    });
    setProducts(allProducts);
  };

  useEffect(() => {
    if (user?.role === "admin") {
      loadProducts().catch((err) => setError(err.message));
    }
  }, [user?.role]);

  useEffect(() => {
    if (!availableBrands.includes(form.brand)) {
      setForm((current) => ({ ...current, brand: availableBrands[0] }));
    }
  }, [availableBrands, form.brand]);

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-background">
        <AuthenticatedHeader />
        <div className="container mx-auto px-4 py-10">
          <Card>
            <CardHeader>
              <CardTitle>Admin Access Required</CardTitle>
              <CardDescription>
                This page is only available to admin accounts.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  const handleChange = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSpecChange = (key, value) => {
    setForm((current) => ({
      ...current,
      specifications: {
        ...current.specifications,
        [key]: value,
      },
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const payload = {
        name: form.name,
        brand: form.brand,
        category: form.category,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        image: form.image || "/placeholder.svg",
        images: form.images
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        description: form.description,
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

      await Database.createProduct(payload);
      setForm({
        ...initialForm,
        brand: BRAND_OPTIONS.smartphone[0],
        specifications: { ...baseSpecValues },
      });
      await loadProducts();
    } catch (err) {
      setError(err.message || "Failed to create product");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AuthenticatedHeader />
      <div className="container mx-auto space-y-8 px-4 py-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">
            Add products using structured fields that match your existing catalog.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Add Product</CardTitle>
              <CardDescription>
                Use selectors and specification inputs instead of raw JSON.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      value={form.category}
                      onChange={(e) => handleChange("category", e.target.value)}
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
                      className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      type="number"
                      value={form.price}
                      onChange={(e) => handleChange("price", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="originalPrice">Original Price</Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      value={form.originalPrice}
                      onChange={(e) => handleChange("originalPrice", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Main Image</Label>
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

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    className="min-h-24 w-full rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground px-3 py-2 text-sm shadow-sm transition-colors resize-y focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={form.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    required
                  />
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
                    <Label htmlFor="rating">Rating</Label>
                    <Input
                      id="rating"
                      type="number"
                      step="0.1"
                      value={form.rating}
                      onChange={(e) => handleChange("rating", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reviewCount">Review Count</Label>
                    <Input
                      id="reviewCount"
                      type="number"
                      value={form.reviewCount}
                      onChange={(e) => handleChange("reviewCount", e.target.value)}
                    />
                  </div>
                  <div className="flex items-end pb-2 gap-2">
                    <input
                      id="inStock"
                      type="checkbox"
                      className="h-4 w-4 rounded border-input accent-primary cursor-pointer"
                      checked={form.inStock}
                      onChange={(e) => handleChange("inStock", e.target.checked)}
                    />
                    <Label htmlFor="inStock" className="cursor-pointer">In Stock</Label>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold">Specifications</h3>
                    <p className="text-sm text-muted-foreground">
                      Fill the fields relevant to the selected category.
                    </p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {specFields.map(([key, label]) => (
                      <div className="space-y-2" key={key}>
                        <Label htmlFor={`spec-${key}`}>{label}</Label>
                        <Input
                          id={`spec-${key}`}
                          value={form.specifications[key] || ""}
                          onChange={(e) => handleSpecChange(key, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {error ? <p className="text-sm text-destructive">{error}</p> : null}

                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Create Product"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Products</CardTitle>
              <CardDescription>
                Existing products in the catalog.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {products.slice(0, 12).map((product) => (
                <div key={product.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.brand} • {product.category}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {product.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge>Score {product.score}</Badge>
                      <p className="mt-1 text-sm font-semibold">${product.price}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
