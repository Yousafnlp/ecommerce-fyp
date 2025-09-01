import { Database } from "@/lib/database"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, ArrowLeft, ShoppingCart, Heart, Share2, Zap } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"

interface ProductPageProps {
  params: {
    category: string
    id: string
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { category, id } = params
  const product = await Database.getProductById(id)

  if (!product || product.category !== category) {
    notFound()
  }

  // Get related products
  const relatedProducts = await Database.getProducts({
    category: product.category,
  })
  const filteredRelated = relatedProducts.filter((p) => p.id !== product.id).slice(0, 4)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">S</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">SpecSmart</h1>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link href="/products" className="text-sm font-medium hover:text-primary transition-colors">
                Products
              </Link>
              <Link href="/compare" className="text-sm font-medium hover:text-primary transition-colors">
                Compare
              </Link>
              <Link href="/search" className="text-sm font-medium hover:text-primary transition-colors">
                Search
              </Link>
              <Link href="/advisor" className="text-sm font-medium hover:text-primary transition-colors">
                AI Advisor
              </Link>
            </nav>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
              <Button size="sm">Cart (0)</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Link href="/products">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Products
            </Button>
          </Link>
          <span className="text-muted-foreground">/</span>
          <Link href={`/products/${category}`}>
            <Button variant="ghost" size="sm" className="capitalize">
              {category}s
            </Button>
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium truncate">{product.name}</span>
        </div>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square relative overflow-hidden rounded-lg bg-muted">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              <Badge className="absolute top-4 left-4 bg-primary">
                <Zap className="w-3 h-3 mr-1" />
                Score: {product.score}
              </Badge>
            </div>

            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(0, 4).map((image, index) => (
                  <div key={index} className="aspect-square relative overflow-hidden rounded-lg bg-muted">
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`${product.name} view ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="capitalize">
                  {product.category}
                </Badge>
                <Badge variant="outline">{product.brand}</Badge>
              </div>
              <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
              <p className="text-muted-foreground text-lg">{product.description}</p>
            </div>

            {/* Rating and Reviews */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{product.rating}</span>
                <span className="text-muted-foreground">({product.reviewCount} reviews)</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-primary" />
                <span className="font-semibold">SpecSmart Score: {product.score}/100</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold">${product.price}</div>
              {product.originalPrice && (
                <div className="text-xl text-muted-foreground line-through">${product.originalPrice}</div>
              )}
              {product.originalPrice && (
                <Badge variant="destructive">Save ${product.originalPrice - product.price}</Badge>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${product.inStock ? "bg-green-500" : "bg-red-500"}`} />
              <span className={product.inStock ? "text-green-600" : "text-red-600"}>
                {product.inStock ? "In Stock" : "Out of Stock"}
              </span>
            </div>

            {/* Features */}
            <div>
              <h3 className="font-semibold mb-3">Key Features</h3>
              <div className="grid grid-cols-2 gap-2">
                {product.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="flex-1" disabled={!product.inStock}>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
              <Button variant="outline" size="lg">
                <Heart className="w-4 h-4 mr-2" />
                Wishlist
              </Button>
              <Button variant="outline" size="lg">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>

            <Link href={`/compare?products=${product.id}`}>
              <Button variant="outline" className="w-full bg-transparent">
                Compare with Similar Products
              </Button>
            </Link>
          </div>
        </div>

        {/* Specifications */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Technical Specifications</CardTitle>
            <CardDescription>Detailed specs and features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(product.specifications).map(([key, value]) => {
                if (typeof value === "object" && value !== null) {
                  return (
                    <div key={key}>
                      <h4 className="font-semibold mb-2 capitalize">{key.replace(/([A-Z])/g, " $1")}</h4>
                      <div className="space-y-1">
                        {Object.entries(value).map(([subKey, subValue]) => (
                          <div key={subKey} className="flex justify-between text-sm">
                            <span className="text-muted-foreground capitalize">
                              {subKey.replace(/([A-Z])/g, " $1")}:
                            </span>
                            <span>{Array.isArray(subValue) ? subValue.join(", ") : String(subValue)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                }

                return (
                  <div key={key} className="flex justify-between">
                    <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, " $1")}:</span>
                    <span className="font-medium">{Array.isArray(value) ? value.join(", ") : String(value)}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Related Products */}
        {filteredRelated.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredRelated.map((relatedProduct) => (
                <Card key={relatedProduct.id} className="group hover:shadow-lg transition-all duration-300">
                  <CardHeader className="p-4">
                    <div className="aspect-square relative mb-4 overflow-hidden rounded-lg bg-muted">
                      <Image
                        src={relatedProduct.image || "/placeholder.svg"}
                        alt={relatedProduct.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <Badge className="absolute top-2 right-2 bg-primary">{relatedProduct.score}</Badge>
                    </div>
                    <CardTitle className="text-base line-clamp-2">{relatedProduct.name}</CardTitle>
                    <CardDescription className="text-sm">{relatedProduct.brand}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{relatedProduct.rating}</span>
                      </div>
                      <div className="text-lg font-bold">${relatedProduct.price}</div>
                    </div>
                    <Link href={`/products/${relatedProduct.category}/${relatedProduct.id}`}>
                      <Button className="w-full" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
