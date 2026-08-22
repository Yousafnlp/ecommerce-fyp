import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { formatPrice } from "@/lib/utils";
export function ProductInfo({
  category,
  brand,
  name,
  description,
  rating,
  reviewCount,
  score,
  price,
  originalPrice,
  inStock,
  features
}) {
  return <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="capitalize">
            {category}
          </Badge>
          <Badge variant="outline">{brand}</Badge>
        </div>
        <h1 className="text-3xl font-bold mb-4">{name}</h1>
        <p className="text-muted-foreground text-lg">{description}</p>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <Star className="w-5 h-5 fill-[var(--color-star)] text-[var(--color-star)]" />
          <span className="font-semibold">{rating}</span>
          <span className="text-muted-foreground">({reviewCount} reviews)</span>
        </div>
        <Badge variant="brand">SpecSmart Score {score}</Badge>
      </div>

      {/* Price */}
      <div className="flex items-center gap-4">
        <div className="text-3xl font-bold">{formatPrice(price)}</div>
        {originalPrice && <>
            <div className="text-xl text-muted-foreground line-through">
              {formatPrice(originalPrice)}
            </div>
            <Badge variant="destructive">Save {formatPrice(originalPrice - price)}</Badge>
          </>}
      </div>

      {/* Stock */}
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${inStock ? "bg-success animate-pulse-soft" : "bg-danger"}`} />
        <span className={inStock ? "text-success font-medium" : "text-danger font-medium"}>
          {inStock ? "In Stock" : "Out of Stock"}
        </span>
      </div>

      {/* Features */}
      <div>
        <h3 className="font-semibold mb-3">Key Features</h3>
        <div className="grid grid-cols-2 gap-2">
          {features.map((feature, index) => <div key={index} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-gradient-brand rounded-full" />
              <span className="text-sm">{feature}</span>
            </div>)}
        </div>
      </div>
    </div>;
}
