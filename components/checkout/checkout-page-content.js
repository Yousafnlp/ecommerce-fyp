"use client";

import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/lib/redux";
import {
  selectCartItems,
  selectTotalItems,
  clearCart,
  clearCartAsync,
} from "@/store/slices/cartSlice";
import { Database } from "@/lib/database";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  CreditCard,
  Truck,
  Shield,
  CheckCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
export function CheckoutPageContent() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const totalItems = useAppSelector(selectTotalItems);
  const user = useAppSelector((state) => state.auth.user);
  const router = useRouter();
  const [cartProducts, setCartProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [shippingAddress, setShippingAddress] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
  });

  // const [billingAddress, setBillingAddress] = useState<Address>({
  //   street: "",
  //   city: "",
  //   state: "",
  //   zipCode: "",
  //   country: "United States",
  // });

  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  });
  useEffect(() => {
    const loadCartProducts = async () => {
      setIsLoading(true);
      try {
        const productIds = items.map((it) => it.productId);
        const products = await Database.getProductsByIds(productIds);
        const enriched = products.map((product) => {
          const cartItem = items.find((i) => i.productId === product.id);
          return { ...product, quantity: cartItem?.quantity || 0 };
        });
        setCartProducts(enriched);
      } catch (error) {
        console.error("Failed to load cart products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadCartProducts();
  }, [items]);

  // Redirect if cart is empty
  useEffect(() => {
    if (!isLoading && totalItems === 0) {
      router.push("/cart");
    }
  }, [totalItems, isLoading, router]);
  const subtotal = cartProducts.reduce(
    (sum, product) => sum + product.price * product.quantity,
    0
  );
  const shipping = subtotal > 100 ? 0 : 15;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;
  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    try {
      const orderItems = cartProducts.map((product) => ({
        productId: product.id,
        quantity: product.quantity,
        price: product.price,
        name: product.name,
        image: product.image,
        category: product.category,
        brand: product.brand,
      }));

      if (user) {
        await Database.createOrder({
          items: orderItems,
          shippingAddress,
          paymentMethod,
          totals: { subtotal, shipping, tax, total },
        });
        await dispatch(clearCartAsync());
      } else {
        dispatch(clearCart());
      }
      router.push("/checkout/success");
    } catch (error) {
      console.error("Failed to place order:", error);
    } finally {
      setIsProcessing(false);
    }
  };
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading checkout...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <Link href="/cart">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </Button>
        </Link>
      </div>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Checkout</h1>
        <p className="text-muted-foreground">
          Complete your order for {totalItems} item{totalItems !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          {[
            {
              step: 1,
              title: "Shipping",
              icon: Truck,
            },
            {
              step: 2,
              title: "Payment",
              icon: CreditCard,
            },
            {
              step: 3,
              title: "Review",
              icon: CheckCircle,
            },
          ].map(({ step, title, icon: Icon }) => (
            <div key={step} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-muted-foreground text-muted-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={`ml-2 text-sm font-medium ${
                  currentStep >= step
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {title}
              </span>
              {step < 3 && <div className="w-8 h-px bg-border mx-4" />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Shipping Information */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Shipping Information
                </CardTitle>
                <CardDescription>
                  Where should we deliver your order?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    placeholder="123 Main Street"
                    value={shippingAddress.street}
                    onChange={(e) =>
                      setShippingAddress((prev) => ({
                        ...prev,
                        street: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="New York"
                      value={shippingAddress.city}
                      onChange={(e) =>
                        setShippingAddress((prev) => ({
                          ...prev,
                          city: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Select
                      value={shippingAddress.state}
                      onValueChange={(value) =>
                        setShippingAddress((prev) => ({
                          ...prev,
                          state: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NY">New York</SelectItem>
                        <SelectItem value="CA">California</SelectItem>
                        <SelectItem value="TX">Texas</SelectItem>
                        <SelectItem value="FL">Florida</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      placeholder="10001"
                      value={shippingAddress.zipCode}
                      onChange={(e) =>
                        setShippingAddress((prev) => ({
                          ...prev,
                          zipCode: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <Button onClick={() => setCurrentStep(2)} className="w-full">
                  Continue to Payment
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Payment Information */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Information
                </CardTitle>
                <CardDescription>How would you like to pay?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={paymentMethod === "card" ? "default" : "outline"}
                      onClick={() => setPaymentMethod("card")}
                      className="h-12"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Card
                    </Button>
                    <Button
                      variant={
                        paymentMethod === "paypal" ? "default" : "outline"
                      }
                      onClick={() => setPaymentMethod("paypal")}
                      className="h-12"
                    >
                      PayPal
                    </Button>
                    <Button
                      variant={
                        paymentMethod === "apple" ? "default" : "outline"
                      }
                      onClick={() => setPaymentMethod("apple")}
                      className="h-12"
                    >
                      Apple Pay
                    </Button>
                  </div>
                </div>

                {paymentMethod === "card" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="cardName">Cardholder Name</Label>
                      <Input
                        id="cardName"
                        placeholder="John Doe"
                        value={cardDetails.name}
                        onChange={(e) =>
                          setCardDetails((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={cardDetails.number}
                        onChange={(e) =>
                          setCardDetails((prev) => ({
                            ...prev,
                            number: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input
                          id="expiry"
                          placeholder="MM/YY"
                          value={cardDetails.expiry}
                          onChange={(e) =>
                            setCardDetails((prev) => ({
                              ...prev,
                              expiry: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          value={cardDetails.cvv}
                          onChange={(e) =>
                            setCardDetails((prev) => ({
                              ...prev,
                              cvv: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sameAddress"
                    checked={sameAsShipping}
                    onCheckedChange={(checked) =>
                      setSameAsShipping(
                        checked === "indeterminate" ? true : checked
                      )
                    }
                  />
                  <Label htmlFor="sameAddress" className="text-sm">
                    Billing address same as shipping
                  </Label>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button onClick={() => setCurrentStep(3)} className="flex-1">
                    Review Order
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Order Review */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Review Your Order
                </CardTitle>
                <CardDescription>
                  Please review your order before placing it
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Order Items */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Order Items</h3>
                  {cartProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-4 p-4 border rounded-lg"
                    >
                      <div className="w-16 h-16 relative overflow-hidden rounded-lg bg-muted">
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{product.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Qty: {product.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          ${(product.price * product.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Shipping Address */}
                <div>
                  <h3 className="font-semibold mb-2">Shipping Address</h3>
                  <div className="text-sm text-muted-foreground">
                    <p>{shippingAddress.street}</p>
                    <p>
                      {shippingAddress.city}, {shippingAddress.state}{" "}
                      {shippingAddress.zipCode}
                    </p>
                    <p>{shippingAddress.country}</p>
                  </div>
                </div>

                <Separator />

                {/* Payment Method */}
                <div>
                  <h3 className="font-semibold mb-2">Payment Method</h3>
                  <div className="text-sm text-muted-foreground capitalize">
                    {paymentMethod}{" "}
                    {paymentMethod === "card" &&
                      cardDetails.number &&
                      `ending in ${cardDetails.number.slice(-4)}`}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(2)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handlePlaceOrder}
                    className="flex-1"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                        Processing...
                      </>
                    ) : (
                      "Place Order"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {cartProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex justify-between text-sm"
                  >
                    <span className="truncate mr-2">
                      {product.name} × {product.quantity}
                    </span>
                    <span>
                      ${(product.price * product.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4" />
                <span>Secure checkout with SSL encryption</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
