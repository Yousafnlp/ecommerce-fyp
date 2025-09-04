import { Database } from "@/lib/database"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Star, Zap, Shield, Headphones } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { AuthenticatedHeader } from "@/components/authenticated-header"

export default async function HomePage() {
  const featuredProducts = await Database.getFeaturedProducts()
  const popularProducts = await Database.getPopularProducts()

  return (
    <div className="min-h-screen bg-background">
      <AuthenticatedHeader />

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            AI-Powered Product Intelligence
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-balance mb-6">
            Find Your Perfect
            <span className="text-primary"> Tech Match</span>
          </h1>

          <p className="text-xl text-muted-foreground text-balance mb-8 max-w-2xl mx-auto">
            Compare specs, get AI recommendations, and make smarter tech purchases with our intelligent product scoring
            system.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/products">
              <Button size="lg" className="text-lg px-8">
                <Search className="w-5 h-5 mr-2" />
                Start Shopping
              </Button>
            </Link>
            <Link href="/advisor">
              <Button variant="outline" size="lg" className="text-lg px-8 bg-transparent">
                <Headphones className="w-5 h-5 mr-2" />
                Try AI Advisor
              </Button>
            </Link>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Smart Scoring</h3>
              <p className="text-sm text-muted-foreground">AI-powered scores based on specs and performance</p>
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                <Search className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Advanced Search</h3>
              <p className="text-sm text-muted-foreground">Voice search and natural language queries</p>
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Expert Comparisons</h3>
              <p className="text-sm text-muted-foreground">Side-by-side spec analysis and recommendations</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Products</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Top-rated products with the highest SpecSmart scores
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="group hover:shadow-lg transition-all duration-300">
                <CardHeader className="p-4">
                  <div className="aspect-square relative mb-4 overflow-hidden rounded-lg bg-muted">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
{/* <Badge className="absolute top-2 right-2 bg-primary">
Score: {product.score}
</Badge> */}
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                  <CardDescription className="text-sm">{product.brand}</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{product.rating}</span>
                      <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">${product.price}</div>
                      {product.originalPrice && (
                        <div className="text-xs text-muted-foreground line-through">${product.originalPrice}</div>
                      )}
                    </div>
                  </div>
                  <Link href={`/products/${product.category}/${product.id}`}>
                    <Button className="w-full" size="sm">
                      View Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Products */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Popular Choices</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Most reviewed and trusted products by our community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularProducts.map((product) => (
              <Card key={product.id} className="group hover:shadow-lg transition-all duration-300">
                <CardHeader className="p-4">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 relative overflow-hidden rounded-lg bg-muted flex-shrink-0">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base line-clamp-2 mb-1">{product.name}</CardTitle>
                      <CardDescription className="text-sm mb-2">{product.brand}</CardDescription>
                      <div className="flex items-center gap-2">
{/* <Badge variant="secondary" className="text-xs">
                          Score: {product.score}
                        </Badge> */}
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs">{product.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold">${product.price}</div>
{/* <Link href={`/compare?products=${product.id}`}>
                      <Button size="sm" variant="outline">
                        Compare
                      </Button>
                    </Link> */}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Make Smarter Tech Choices?</h2>
          <p className="text-xl opacity-90 mb-8">
            Join thousands of users who trust SpecSmart for their tech purchases
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Browse Products
              </Button>
            </Link>
            <Link href="/advisor">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
              >
                Try AI Advisor
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t bg-card/50">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                  <Zap className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-bold">SpecSmart</span>
              </div>
              <p className="text-sm text-muted-foreground">Smarter Choices. Sharper Tech.</p>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Products</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/products/smartphone" className="hover:text-foreground">
                    Smartphones
                  </Link>
                </li>
                <li>
                  <Link href="/products/laptop" className="hover:text-foreground">
                    Laptops
                  </Link>
                </li>
                <li>
                  <Link href="/products/headphones" className="hover:text-foreground">
                    Headphones
                  </Link>
                </li>
                <li>
                  <Link href="/products/camera" className="hover:text-foreground">
                    Cameras
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Features</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
{/* <li>
                  <Link href="/compare" className="hover:text-foreground">
                    Product Compare
                  </Link>
                </li> */}
                <li>
                  <Link href="/search" className="hover:text-foreground">
                    Advanced Search
                  </Link>
                </li>
                <li>
                  <Link href="/advisor" className="hover:text-foreground">
                    AI Advisor
                  </Link>
                </li>
                <li>
                  <Link href="/scores" className="hover:text-foreground">
                    Smart Scoring
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/help" className="hover:text-foreground">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-foreground">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-foreground">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-foreground">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 SpecSmart. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
