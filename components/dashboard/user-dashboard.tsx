"use client";

import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart,
  Star,
  Settings,
  LogOut,
  Package,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function UserDashboard() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
                  S
                </span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">SpecSmart</h1>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/products"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Products
              </Link>
              <Link
                href="/compare"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Compare
              </Link>
              <Link
                href="/search"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Search
              </Link>
              <Link
                href="/advisor"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                AI Advisor
              </Link>
            </nav>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user.avatar || "/placeholder.svg"} />
              <AvatarFallback className="text-lg">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {user.name}!</h1>
              <p className="text-muted-foreground">
                Manage your account and discover new tech
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-sm text-muted-foreground">
                    Wishlist Items
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">5</p>
                  <p className="text-sm text-muted-foreground">Orders</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">8</p>
                  <p className="text-sm text-muted-foreground">Reviews</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">$2,450</p>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>Your latest purchases</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">iPhone 15 Pro</p>
                        <p className="text-sm text-muted-foreground">
                          Order #12345
                        </p>
                      </div>
                      <Badge>Delivered</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">MacBook Pro 14"</p>
                        <p className="text-sm text-muted-foreground">
                          Order #12344
                        </p>
                      </div>
                      <Badge variant="secondary">Shipped</Badge>
                    </div>
                  </div>
                  <Link href="/dashboard/orders">
                    <Button
                      variant="outline"
                      className="w-full mt-4 bg-transparent"
                    >
                      View All Orders
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle>Recommended for You</CardTitle>
                  <CardDescription>Based on your preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-12 h-12 bg-muted rounded-lg" />
                      <div className="flex-1">
                        <p className="font-medium">Samsung Galaxy S24</p>
                        <p className="text-sm text-muted-foreground">$899</p>
                      </div>
                      <Badge>Score: 94</Badge>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-12 h-12 bg-muted rounded-lg" />
                      <div className="flex-1">
                        <p className="font-medium">Sony WH-1000XM5</p>
                        <p className="text-sm text-muted-foreground">$399</p>
                      </div>
                      <Badge>Score: 89</Badge>
                    </div>
                  </div>
                  <Link href="/products">
                    <Button
                      variant="outline"
                      className="w-full mt-4 bg-transparent"
                    >
                      Browse Products
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>Track and manage your orders</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Order history will be displayed here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wishlist">
            <Card>
              <CardHeader>
                <CardTitle>Your Wishlist</CardTitle>
                <CardDescription>
                  Products you want to buy later
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Your wishlist items will be displayed here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Personal Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-muted-foreground">
                          Name
                        </label>
                        <p className="font-medium">{user.name}</p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">
                          Email
                        </label>
                        <p className="font-medium">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
