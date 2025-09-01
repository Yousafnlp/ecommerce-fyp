import { Database } from "@/lib/database"
import { ComparisonTable } from "@/components/comparison-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"

interface ComparePageProps {
  searchParams: {
    products?: string
  }
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const productIds = searchParams.products ? searchParams.products.split(",") : []
  const products = productIds.length > 0 ? await Database.getComparisonProducts(productIds) : []
  const allProducts = await Database.getProducts()

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
              <Link href="/compare" className="text-sm font-medium text-primary">
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
          <span className="font-medium">Compare</span>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Product Comparison</h1>
          <p className="text-muted-foreground">Compare specifications, scores, and features side by side</p>
        </div>

        {products.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Products Selected</CardTitle>
              <CardDescription>Choose products to compare their specifications and features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {allProducts.slice(0, 6).map((product) => (
                  <Card key={product.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-muted rounded-lg flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">{product.brand}</p>
                          <p className="text-sm font-medium">${product.price}</p>
                        </div>
                        <Link href={`/compare?products=${product.id}`}>
                          <Button size="sm">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Link href="/products">
                <Button>Browse All Products</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <ComparisonTable products={products} />
        )}
      </div>
    </div>
  )
}
